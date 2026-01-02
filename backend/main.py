import sys

from backend.core.orchestrator import Orchestrator


def main():
    if len(sys.argv) < 2:
        print("Usage: python -m backend.main <target_path>")
        sys.exit(1)

    target_path = sys.argv[1]

    orchestrator = Orchestrator(rules_dir="backend/rules")
    result = orchestrator.run(target_path)

    findings = result["report"]["findings"]
    summary = result["dashboard"]

    print("Scan completed.")
    print(f"Total findings: {summary['totalVulnerabilities']}")
    print(
        f"Critical: {summary['bySeverity']['critical']} | "
        f"High: {summary['bySeverity']['high']} | "
        f"Medium: {summary['bySeverity']['medium']} | "
        f"Low: {summary['bySeverity']['low']}"
    )


if __name__ == "__main__":
    main()
