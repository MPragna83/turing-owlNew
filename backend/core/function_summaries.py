# Global function return taint summaries
# MUST be reset once per scan

FUNCTION_RETURNS = {}

def reset():
    """
    Reset all recorded function summaries.
    Called once per scan.
    """
    FUNCTION_RETURNS.clear()

def record(function_name, taints):
    if taints:
        FUNCTION_RETURNS.setdefault(function_name, set()).update(taints)

def get(function_name):
    return FUNCTION_RETURNS.get(function_name, set())
