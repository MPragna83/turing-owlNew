MAX_FILES = 5000
MAX_FINDINGS = 10000

def enforce_limits(files, findings):
    if len(files) > MAX_FILES:
        raise RuntimeError("File scan limit exceeded")

    if len(findings) > MAX_FINDINGS:
        raise RuntimeError("Finding limit exceeded")
