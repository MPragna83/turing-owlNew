from typing import List, Dict, Tuple

def dedupe_findings(findings: List[Dict]) -> List[Dict]:
    seen = set()
    unique = []

    for f in findings:
        key: Tuple = (
            f.get("rule_id"),
            f.get("file"),
            f.get("line"),
            f.get("function"),
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)

    return unique
