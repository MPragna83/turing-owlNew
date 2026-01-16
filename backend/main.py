import sys
from backend.core.orchestrator import Orchestrator


def main():
    if len(sys.argv) < 2:
        print("Usage: python backend/main.py <target_path>")
        sys.exit(1)

    target_path = sys.argv[1]

    orchestrator = Orchestrator(rules_dir="backend/rules")
    result = orchestrator.run(target_path)

    findings = result.get("report", {}).get("findings", [])
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
