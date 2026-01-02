def exit_code(findings):
    if any(f["severity"] == "critical" for f in findings):
        return 3
    if any(f["severity"] == "high" for f in findings):
        return 2
    if findings:
        return 1
    return 0
