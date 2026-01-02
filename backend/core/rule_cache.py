# Caches rule metadata for SARIF + reporting

_RULE_INDEX = {}

def get_rule(rule):
    rid = rule["id"]
    if rid not in _RULE_INDEX:
        _RULE_INDEX[rid] = {
            "id": rid,
            "title": rule["title"],
            "severity": rule["severity"],
            "cwe": rule.get("cwe"),
            "category": rule.get("category"),
        }
    return _RULE_INDEX[rid]
