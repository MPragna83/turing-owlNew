from typing import List, Dict
from collections import Counter

def group_by_category(findings: List[Dict]) -> Dict:
    return dict(Counter(f.get("category") for f in findings))
