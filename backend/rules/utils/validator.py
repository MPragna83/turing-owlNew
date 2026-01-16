import os
import yaml

ALLOWED_TYPES = {"taint", "semantic"}
ALLOWED_SEVERITIES = {"low", "medium", "high", "critical"}

REQUIRED_FIELDS = {
    "schema_version",
    "id",
    "type",
    "title",
    "severity",
    "description",
    "confidence",
}


def validate_rules(path: str):
    errors = []
    seen_ids = set()

    for root, _, files in os.walk(path):
        for file in files:
            if not file.endswith(".yaml"):
                continue

            full = os.path.join(root, file)

            try:
                with open(full, "r", encoding="utf-8") as f:
                    rule = yaml.safe_load(f)
            except Exception as e:
                errors.append(f"{file}: invalid YAML ({e})")
                continue

            if not isinstance(rule, dict):
                errors.append(f"{file}: rule must be a YAML object")
                continue

            # ---------- required fields ----------
            missing = REQUIRED_FIELDS - rule.keys()
            if missing:
                errors.append(f"{file}: missing fields {sorted(missing)}")

            # ---------- schema ----------
            if rule.get("schema_version") != 1:
                errors.append(f"{file}: invalid schema_version")

            # ---------- id ----------
            rid = rule.get("id")
            if not rid:
                errors.append(f"{file}: rule id missing or empty")
            elif rid in seen_ids:
                errors.append(f"{file}: duplicate rule id '{rid}'")
            seen_ids.add(rid)

            # ---------- type ----------
            rtype = rule.get("type")
            if rtype not in ALLOWED_TYPES:
                errors.append(f"{file}: invalid type '{rtype}'")

            # ---------- severity ----------
            severity = rule.get("severity")
            if severity not in ALLOWED_SEVERITIES:
                errors.append(f"{file}: invalid severity '{severity}'")

            # ---------- confidence ----------
            conf = rule.get("confidence")
            if not isinstance(conf, (int, float)) or not (0 <= conf <= 1):
                errors.append(f"{file}: confidence must be between 0 and 1")

    return errors
