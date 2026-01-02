from typing import Dict, List

def match_call(call: Dict, pattern: Dict) -> bool:
    """
    Semgrep-style call matcher.

    Supported:
      - callee
      - callee_contains
      - arg_contains
      - any_arg_contains
      - argument_count
    """

    if not pattern:
        return False

    callee = call.get("callee", "")
    args: List[str] = call.get("args", [])

    # --------------------
    # CALLEE MATCHING
    # --------------------
    if "callee" in pattern and callee != pattern["callee"]:
        return False

    if "callee_contains" in pattern and pattern["callee_contains"] not in callee:
        return False

    # --------------------
    # ARGUMENT MATCHING
    # --------------------
    if "arg_contains" in pattern:
        if not any(pattern["arg_contains"] in a for a in args):
            return False

    if "any_arg_contains" in pattern:
        needles = pattern["any_arg_contains"]
        if not any(n in a for n in needles for a in args):
            return False

    if "argument_count" in pattern:
        if len(args) != pattern["argument_count"]:
            return False

    return True
