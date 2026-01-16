import ast
import os
import fnmatch
from typing import Dict, List, Set
from pathlib import Path

from backend.core.function_summaries import record, get

# =====================================================
# IGNORE DIRECTORIES
# =====================================================
DEFAULT_IGNORE_DIRS = {
    "node_modules", ".git", "__pycache__", ".venv",
    "dist", "build", ".next", ".vite", "coverage",
}

# =====================================================
# TAINT SOURCES
# =====================================================
TAINT_SOURCES = {
    "input",
    "sys.argv",
    "request.args",
    "request.form",
    "request.values",
    "request.json",
    "request.data",
}

# =====================================================
# TAINT SINKS (STRICT)
# =====================================================
TAINT_SINKS = {
    # RCE
    "exec",
    "eval",
    "os.system",
    "subprocess.call",
    "subprocess.Popen",
    "subprocess.run",

    # Templates / XSS
    "render_template",
    "render_template_string",

    # Deserialization
    "pickle.load",
    "yaml.load",
}

# =====================================================
# IGNORE HELPERS
# =====================================================
def load_ignore_patterns(base_path: str) -> Set[str]:
    patterns = set(DEFAULT_IGNORE_DIRS)
    ignore_file = Path(base_path) / ".turing-owlignore"

    if ignore_file.exists():
        with ignore_file.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.add(line)
    return patterns


def is_ignored(rel_path: str, patterns: Set[str]) -> bool:
    return any(fnmatch.fnmatch(rel_path, p) for p in patterns)

# =====================================================
# AGENT-1 PARSER
# =====================================================
class CodeParsingAgent(ast.NodeVisitor):
    """
    Python AST parser with correct taint propagation.
    """

    def __init__(self):
        self.reset()

    # ----------------------
    # STATE
    # ----------------------
    def reset(self):
        self.current_file = ""
        self.current_function = None

        self.functions: List[Dict] = []
        self.calls: List[Dict] = []
        self.assignments: List[Dict] = []
        self.literals: List[Dict] = []

        self.taint_env: Dict[str, Set[str]] = {}
        self.taint_flows: List[Dict] = []

    # ----------------------
    # ENTRY
    # ----------------------
    def parse(self, target_path: str) -> List[Dict]:
        results = []
        base = os.path.abspath(target_path)
        ignores = load_ignore_patterns(base)

        for root, dirs, files in os.walk(base):
            rel_root = os.path.relpath(root, base)
            dirs[:] = [
                d for d in dirs
                if not is_ignored(os.path.join(rel_root, d), ignores)
            ]

            for file in files:
                if not file.endswith(".py"):
                    continue

                rel_file = os.path.join(rel_root, file)
                if is_ignored(rel_file, ignores):
                    continue

                self.reset()
                self.current_file = os.path.join(root, file)

                try:
                    with open(self.current_file, encoding="utf-8") as f:
                        tree = ast.parse(f.read())
                    self.visit(tree)
                except Exception:
                    continue

                results.append(self._emit())

        return results

    # ----------------------
    # VISITORS
    # ----------------------
    def visit_FunctionDef(self, node):
        prev_fn = self.current_function
        prev_env = self.taint_env.copy()

        self.current_function = node.name
        self.taint_env = {arg.arg: set() for arg in node.args.args}

        self.functions.append({
            "name": node.name,
            "startLine": node.lineno,
        })

        self.generic_visit(node)

        self.current_function = prev_fn
        self.taint_env = prev_env

    def visit_Return(self, node):
        if not self.current_function or not node.value:
            return

        taints = self._expr_taint(node.value)
        if taints:
            record(self.current_function, taints)

    def visit_Assign(self, node):
        taints = self._expr_taint(node.value)

        for target in node.targets:
            if isinstance(target, ast.Name):
                self.taint_env[target.id] = taints.copy()

        self.generic_visit(node)

    def visit_Call(self, node):
        callee = self._resolve_callee(node.func)
        arg_taints = [self._expr_taint(arg) for arg in node.args]

        self.calls.append({
            "callee": callee,
            "line": node.lineno,
            "function": self.current_function,
            "args": [ast.dump(a) for a in node.args],
        })

        # ---------- TAINT → SINK ----------
        if self._is_sink(callee):
            for taints in arg_taints:
                for src in taints:
                    self.taint_flows.append({
                        "source": src,
                        "sink": callee,
                        "line": node.lineno,
                        "function": self.current_function,
                        "path": [src, callee],
                    })

        self.generic_visit(node)

    def visit_Constant(self, node):
        if isinstance(node.value, str):
            self.literals.append({
                "value": node.value,
                "length": len(node.value),
                "line": node.lineno,
                "function": self.current_function,
            })

    # ----------------------
    # TAINT ENGINE
    # ----------------------
    def _expr_taint(self, node) -> Set[str]:
        # variable
        if isinstance(node, ast.Name):
            return self.taint_env.get(node.id, set())

        # sys.argv[1]
        if isinstance(node, ast.Subscript):
            return self._expr_taint(node.value)

        # request.args / request.form / etc
        if isinstance(node, ast.Attribute):
            name = self._resolve_callee(node)
            for src in TAINT_SOURCES:
                if name.startswith(src):
                    return {src}
            return set()

        # function calls
        if isinstance(node, ast.Call):
            callee = self._resolve_callee(node.func)

            # direct source
            if callee in TAINT_SOURCES:
                return {callee}

            taints = set()

            # interprocedural summary
            summary = get(callee)
            if summary:
                taints |= summary

            for arg in node.args:
                taints |= self._expr_taint(arg)

            return taints

        # string building
        if isinstance(node, ast.BinOp):
            return self._expr_taint(node.left) | self._expr_taint(node.right)

        if isinstance(node, ast.JoinedStr):
            taints = set()
            for v in node.values:
                taints |= self._expr_taint(v)
            return taints

        if isinstance(node, ast.FormattedValue):
            return self._expr_taint(node.value)

        return set()

    # ----------------------
    # HELPERS
    # ----------------------
    def _resolve_callee(self, func) -> str:
        if isinstance(func, ast.Attribute):
            return f"{self._resolve_callee(func.value)}.{func.attr}"
        if isinstance(func, ast.Name):
            return func.id
        return "unknown"

    def _is_sink(self, callee: str) -> bool:
        # Explicitly ignore SQL cursor execution
        if callee.endswith(".execute") or callee.endswith(".executemany"):
            return False

        if callee in TAINT_SINKS:
            return True

        for s in TAINT_SINKS:
            if callee.endswith("." + s):
                return True

        return False

    # ----------------------
    # OUTPUT
    # ----------------------
    def _emit(self):
        return {
            "filePath": self.current_file,
            "language": "python",
            "functions": self.functions,
            "calls": self.calls,
            "assignments": self.assignments,
            "literals": self.literals,
            "taint": {"flows": self.taint_flows},
        }
