import os
import yaml
from typing import List, Dict


def load_all_rules(rules_dir: str) -> List[Dict]:
    rules: List[Dict] = []

    for root, _, files in os.walk(rules_dir):
        for file in files:
            if not file.endswith(".yaml"):
                continue

            full = os.path.join(root, file)

            with open(full, encoding="utf-8") as f:
                rule = yaml.safe_load(f)

            if not isinstance(rule, dict):
                raise ValueError(f"{file}: rule must be a YAML object")

            rules.append(rule)

    return rules
