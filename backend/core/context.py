from typing import Dict, Any, List


class ScanContext:
    """
    ScanContext holds scan-wide state and metadata.
    NO execution logic.
    NO agent behavior.
    """

    def __init__(self, target_path: str):
        self.target_path = target_path

        # ---------- METADATA ----------
        self.metadata: Dict[str, Any] = {
            "target": target_path
        }

        # ---------- CONFIG (CLI-derived) ----------
        self.config: Dict[str, Any] = {}

        # ---------- ERROR / WARN TRACKING ----------
        self.errors: List[str] = []
        self.warnings: List[str] = []

        # ---------- FUTURE EXTENSIONS ----------
        self.cfg = {}
        self.dfg = {}
        self.taint = {}

    # ======================
    # METADATA
    # ======================
    def add_metadata(self, key: str, value: Any):
        self.metadata[key] = value

    def get_metadata(self) -> Dict[str, Any]:
        return dict(self.metadata)

    # ======================
    # CONFIG
    # ======================
    def set_config(self, key: str, value: Any):
        self.config[key] = value

    def get_config(self) -> Dict[str, Any]:
        return dict(self.config)

    # ======================
    # ERRORS / WARNINGS
    # ======================
    def add_error(self, message: str):
        self.errors.append(message)

    def add_warning(self, message: str):
        self.warnings.append(message)

    def has_errors(self) -> bool:
        return bool(self.errors)

    def has_warnings(self) -> bool:
        return bool(self.warnings)
