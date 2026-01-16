from typing import Dict, List
import math
import re


class SemanticRuleEngine:
    """
    Semgrep-grade semantic (non-taint) rule engine.
    Handles secrets, config issues, crypto misuse, framework patterns.
    """

    ENTROPY_THRESHOLD = 3.2
    MIN_CONFIDENCE = 0.7

    SECRET_REGEXES = [
        re.compile(r"AKIA[0-9A-Z]{16}"),               # AWS
        re.compile(r"sk_live_[0-9a-zA-Z]{10,}"),       # Stripe
        re.compile(r"AIza[0-9A-Za-z\-_]{35}"),         # Google
        re.compile(r"(?i)api[_-]?key"),
        re.compile(r"(?i)secret"),
        re.compile(r"(?i)password"),
        re.compile(r"(?i)token"),
    ]

    def __init__(self, rules: List[Dict]):
        self.rules = [r for r in rules if r.get("type") == "semantic"]

    # ======================
    # ENTRY
    # ======================
    def analyze(self, parsed_files: List[Dict]) -> List[Dict]:
        findings = []
        seen = set()

        for file in parsed_files:
            for rule in self.rules:
                for f in self._apply(rule, file):
                    key = (
                        f["rule_id"],
                        f["file"],
                        f["line"],
                        f.get("function"),
                    )
                    if key in seen:
                        continue
                    seen.add(key)

                    if f["confidence"] >= self.MIN_CONFIDENCE:
                        findings.append(f)

        return findings

    # ======================
    # APPLY
    # ======================
    def _apply(self, rule: Dict, file: Dict) -> List[Dict]:
        results = []

        fn_keywords = self._lower(rule.get("function_name_contains", []))
        call_keywords = self._lower(rule.get("call_name_contains", []))
        min_len = rule.get("min_string_length", 6)

        # ---------- FUNCTIONS ----------
        for fn in file.get("functions", []):
            name = fn["name"].lower()
            if fn_keywords and not self._contains(name, fn_keywords):
                continue

            results.append(
                self._emit(rule, file, fn["startLine"], fn["name"])
            )

        # ---------- CALLS ----------
        for call in file.get("calls", []):
            callee = (call.get("callee") or "").lower()
            if call_keywords and not self._contains(callee, call_keywords):
                continue

            results.append(
                self._emit(rule, file, call["line"], call.get("function"))
            )

        # ---------- STRING LITERALS ----------
        for lit in file.get("literals", []):
            value = lit["value"]

            if len(value) < min_len:
                continue

            if not self._looks_sensitive(value, rule):
                continue

            results.append(
                self._emit(rule, file, lit["line"], lit.get("function"))
            )

        return results

    # ======================
    # HEURISTICS
    # ======================
    def _looks_sensitive(self, value: str, rule: Dict) -> bool:
        value_l = value.lower()

        # keyword hint
        keywords = self._lower(rule.get("string_contains", []))
        if keywords and not self._contains(value_l, keywords):
            return False

        # regex match (Semgrep-style)
        for r in self.SECRET_REGEXES:
            if r.search(value):
                return True

        # entropy fallback
        return self._entropy(value) >= self.ENTROPY_THRESHOLD

    # ======================
    # HELPERS
    # ======================
    def _entropy(self, s: str) -> float:
        freq = {}
        for c in s:
            freq[c] = freq.get(c, 0) + 1

        entropy = 0.0
        length = len(s)
        for c in freq:
            p = freq[c] / length
            entropy -= p * math.log2(p)

        return entropy

    def _contains(self, text: str, keywords: List[str]) -> bool:
        return any(k in text for k in keywords)

    def _lower(self, items: List[str]) -> List[str]:
        return [i.lower() for i in items]

    # ======================
    # OUTPUT
    # ======================
    def _emit(self, rule: Dict, file: Dict, line: int, function: str) -> Dict:
        return {
            "rule_id": rule["id"],
            "title": rule["title"],
            "severity": rule["severity"],
            "cwe": rule.get("cwe"),
            "category": rule.get("category"),
            "file": file["filePath"],
            "line": line,
            "function": function,
            "description": rule["description"],
            "confidence": rule["confidence"],
            "remediation": rule.get("remediation"),
        }
