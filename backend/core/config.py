import os
import yaml


class OwlConfig:
    """
    Loads .turing-owl.yml project configuration
    """

    def __init__(self, root: str):
        self.path = os.path.join(root, ".turing-owl.yml")
        self.data = {}

        if os.path.exists(self.path):
            with open(self.path, encoding="utf-8") as f:
                self.data = yaml.safe_load(f) or {}

    def get(self, key, default=None):
        return self.data.get(key, default)

    def excluded_paths(self):
        return set(self.data.get("exclude", []))

    def severity_threshold(self):
        return self.data.get("severity_threshold")

    def min_confidence(self):
        return self.data.get("confidence", {}).get("min")
