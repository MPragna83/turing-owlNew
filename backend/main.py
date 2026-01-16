import sys
import json
import argparse
from backend.core.orchestrator import Orchestrator


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("target_path")
    parser.add_argument("--sarif", action="store_true")
    parser.add_argument("--output", default="result.sarif")
    args = parser.parse_args()

    orchestrator = Orchestrator(rules_dir="backend/rules")
    result = orchestrator.run(args.target_path)

    # SARIF output (machine-readable ONLY)
    if args.sarif:
        sarif = result.get("sarif")
        if not sarif:
            print("ERROR: SARIF data not generated", file=sys.stderr)
            sys.exit(1)

        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(sarif, f, indent=2)

        print(f"SARIF written to {args.output}")
        return

    # Human-readable output
    summary = result.get("dashboard", {})
    by_sev = summary.get("bySeverity", {})

    print("Scan completed.")
    print(f"Total findings: {summary.get('totalVulnerabilities', 0)}")
    print(
        f"Critical: {by_sev.get('critical', 0)} | "
        f"High: {by_sev.get('high', 0)} | "
        f"Medium: {by_sev.get('medium', 0)} | "
        f"Low: {by_sev.get('low', 0)}"
    )


if __name__ == "__main__":
    main()
