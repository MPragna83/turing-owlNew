#!/usr/bin/env python3
import argparse
import os
import sys
import json
from typing import List

# IMPORTANT: absolute backend imports
from backend.core.orchestrator import Orchestrator
from backend.rules.utils.validator import validate_rules


SEVERITY_ORDER = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4
}

# ======================
# UTILITIES
# ======================
def validate_target(path: str) -> str:
    if not os.path.exists(path):
        print(f"[ERROR] Path does not exist: {path}")
        sys.exit(3)
    return os.path.abspath(path)


def severity_hit(findings, threshold):
    limit = SEVERITY_ORDER[threshold]
    return any(
        SEVERITY_ORDER.get(f.get("severity", ""), 0) >= limit
        for f in findings
    )

# ======================
# CLI ENTRYPOINT
# ======================
def main():
    parser = argparse.ArgumentParser(
        prog="turing-owl",
        description="Turing-Owl — Agentic Static Application Security Scanner"
    )

    sub = parser.add_subparsers(dest="command", required=True)

    # ---------- scan ----------
    scan = sub.add_parser("scan", help="Scan a project")
    scan.add_argument("target")
    scan.add_argument("--rules", default="backend/rules")

    scan.add_argument("--json", action="store_true", help="Print JSON report")
    scan.add_argument("--sarif", action="store_true", help="Print SARIF")
    scan.add_argument("--quiet", action="store_true", help="No stdout")

    scan.add_argument("--ci", action="store_true", help="CI mode")
    scan.add_argument(
        "--severity-threshold",
        choices=["low", "medium", "high", "critical"],
        help="Exit non-zero if findings >= severity"
    )

    scan.add_argument("--verbose", action="store_true")
    scan.add_argument("--dry-run", action="store_true")

    # ---------- cloud-scan ----------
    cloud = sub.add_parser("cloud-scan", help="Scan a Git repository (cloud-style)")
    cloud.add_argument("--repo", required=True, help="Git repository URL")
    cloud.add_argument("--commit", default="HEAD", help="Commit SHA or branch")
    cloud.add_argument(
        "--out",
        choices=["sarif", "json"],
        default="sarif",
        help="Output format"
    )
    cloud.add_argument("--rules", default="backend/rules")

    # ---------- rules ----------
    rules = sub.add_parser("rules", help="Rule management")
    rules_sub = rules.add_subparsers(dest="rules_cmd", required=True)

    validate = rules_sub.add_parser("validate", help="Validate rule set")
    validate.add_argument("path")

    rules_sub.add_parser("list", help="List rules")

    args = parser.parse_args()

    # ======================
    # RULE COMMANDS
    # ======================
    if args.command == "rules":
        if args.rules_cmd == "validate":
            errors = validate_rules(args.path)
            if errors:
                for e in errors:
                    print("[ERROR]", e)
                sys.exit(1)
            print("All rules valid")
            sys.exit(0)

        if args.rules_cmd == "list":
            orch = Orchestrator("backend/rules")
            for r in orch.rule_engine.rules:
                print(f"{r['id']} — {r['title']}")
            sys.exit(0)

    # ======================
    # CLOUD SCAN
    # ======================
    if args.command == "cloud-scan":
        from cloud.runner.run_cloud_scan import run_cloud_scan
        run_cloud_scan(
            repo=args.repo,
            commit=args.commit,
            rules_dir=args.rules,
            out_format=args.out
        )
        sys.exit(0)

    # ======================
    # LOCAL SCAN
    # ======================
    if args.command == "scan":
        target = validate_target(args.target)
        orch = Orchestrator(args.rules)
        result = orch.run(target)

        findings = result["report"]["findings"]
        summary = result["dashboard"]

        if args.quiet:
            pass
        elif args.json:
            print(json.dumps(result["report"], indent=2))
        elif args.sarif:
            print(json.dumps(result["sarif"], indent=2))
        else:
            print("\n=== Scan Summary ===")
            print(f"Total findings: {summary['totalVulnerabilities']}")
            print(
                f"Critical: {summary['bySeverity'].get('critical', 0)} | "
                f"High: {summary['bySeverity'].get('high', 0)} | "
                f"Medium: {summary['bySeverity'].get('medium', 0)} | "
                f"Low: {summary['bySeverity'].get('low', 0)}"
            )

        if args.severity_threshold and severity_hit(findings, args.severity_threshold):
            sys.exit(2)

        if args.ci and any(f["severity"] in ("critical", "high") for f in findings):
            sys.exit(2)

        sys.exit(0)


if __name__ == "__main__":
    main()
