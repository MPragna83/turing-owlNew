from pathlib import Path

DEFAULT_IGNORES = {
    "node_modules",
    "dist",
    "build",
    "__pycache__",
    ".git",
    ".venv",
}

def load_ignore_patterns(base_path: str):
    ignore_file = Path(base_path) / ".turing-owlignore"
    patterns = set(DEFAULT_IGNORES)

    if ignore_file.exists():
        with open(ignore_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.add(line)

    return patterns
