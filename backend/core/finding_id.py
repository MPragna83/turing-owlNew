import hashlib

def stable_finding_id(rule_id, file, line, function):
    raw = f"{rule_id}:{file}:{line}:{function}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]
