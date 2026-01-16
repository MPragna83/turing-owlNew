import hashlib
from typing import List, Dict


class ReasoningAgent3A:
    """
    Agent-3A (Authoritative)
    Deterministic validation & confidence normalization.
    SOURCE OF TRUTH.
    """

    CONFIDENCE_MIN = 0.0
    CONFIDENCE_MAX = 1.0

    def __init__(self):
        self.cache: Dict[str, Dict] = {}

    def validate(self, findings: List[Dict]) -> List[Dict]:
        validated = []

        for v in findings:
            key = self._fingerprint(v)

            if key in self.cache:
                validated.append(self.cache[key])
                continue

            result = self._validate_single(v)
            self.cache[key] = result
            validated.append(result)

        return validated

    def _validate_single(self, v: Dict) -> Dict:
        confidence = float(v.get("confidence", 0.9))
        validated = False
        trace = []

        cwe = v.get("cwe")
        severity = v.get("severity", "").lower()

        # ---------- CWE-AWARE LOGIC ----------
        if cwe == "CWE-77":  # Command Injection
            confidence += 0.05
            validated = True
            trace.append("Command execution sink → high exploitability")

        elif cwe == "CWE-89":  # SQL Injection
            confidence += 0.03
            validated = True
            trace.append("SQL injection pattern detected")

        elif cwe == "CWE-22":  # Path Traversal
            confidence += 0.02
            validated = True
            trace.append("Filesystem path traversal risk")

        elif cwe == "CWE-79":  # XSS
            confidence -= 0.05
            validated = confidence >= 0.85
            trace.append("XSS context-sensitive → reduced certainty")

        elif cwe == "CWE-798":  # Secrets
            if "env" in v.get("description", "").lower():
                confidence = 0.4
                validated = False
                trace.append("Secret appears environment-based")
            else:
                validated = True

        # ---------- REACHABILITY ----------
        if v.get("function"):
            confidence += 0.02
            trace.append("Reachable via function scope")

        if v.get("line", 0) < 5:
            confidence -= 0.03
            trace.append("Likely initialization code")

        confidence = round(
            max(self.CONFIDENCE_MIN, min(self.CONFIDENCE_MAX, confidence)), 2
        )

        return {
            **v,
            "validated": validated,
            "confidence": confidence,
            "decisionSource": "deterministic",
            "decisionTrace": trace
        }

    def _fingerprint(self, v: Dict) -> str:
        h = hashlib.sha1()
        h.update(
            (
                v.get("rule_id", "")
                + v.get("file", "")
                + str(v.get("line", ""))
                + str(v.get("cwe", ""))
            ).encode()
        )
        return h.hexdigest()
