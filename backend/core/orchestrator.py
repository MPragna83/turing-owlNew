from backend.core.repo_fetcher import RepoFetcher
import os
import json
import traceback
from typing import Dict

from backend.agents.agent1_parser import CodeParsingAgent
from backend.agents.agent2_rules import RuleEngineAgent
from backend.agents.agent2_semantic_ast import SemanticASTEngine
from backend.agents.agent3a_validator import ReasoningAgent3A
from backend.agents.agent3b_AI import FixGenerationAgent3B
from backend.agents.agent4_report import ReportingAgent
from backend.core.context import ScanContext
from backend.rules.loader import load_all_rules
from backend.core.dedupe import dedupe_findings


class Orchestrator:
    def _merge(self, taint, semantic):

        merged = { (f["rule_id"], f["file"], f["line"]): f for f in semantic }

        for f in taint:

            key = (f["rule_id"], f["file"], f["line"])

            merged[key] = f

        return list(merged.values())

    """
    SINGLE source of execution order.
    """

    def __init__(self, rules_dir: str, output_dir: str = "backend/output"):
        self.rules_dir = rules_dir
        self.output_dir = output_dir

        # ---------- LOAD RULES ----------
        all_rules = load_all_rules(rules_dir)

        taint_rules = [r for r in all_rules if r.get("type") == "taint"]
        semantic_rules = [r for r in all_rules if r.get("type") == "semantic"]

        # ---------- AGENTS ----------
        self.parser = CodeParsingAgent()
        self.rule_engine = RuleEngineAgent(taint_rules)
        self.semantic_engine = SemanticASTEngine(semantic_rules)
        self.validator = ReasoningAgent3A()
        self.fix_generator = FixGenerationAgent3B()
        self.reporter = ReportingAgent()

    # ======================
    # PIPELINE
    # ======================
    def run(self, target_path: str) -> Dict:
        context = ScanContext(target_path)

        try:
            # 1️⃣ PARSE
            parsed_files = self.parser.parse(target_path)
            context.add_metadata("filesParsed", len(parsed_files))

            # 2️⃣ DETECT
            taint_findings = self.rule_engine.analyze(parsed_files)
            from backend.core.timeout import time_limit
            with time_limit(10):
                semantic_findings = self.semantic_engine.analyze(parsed_files)

            findings = dedupe_findings(self._merge(taint_findings, semantic_findings))
            from backend.core.limits import enforce_limits
            enforce_limits(parsed_files, findings)
            context.add_metadata("findingsDetected", len(findings))

            # 3️⃣ VALIDATE
            validated = self.validator.validate(findings)
            context.add_metadata("findingsValidated", len(validated))

            # 4️⃣ FIXES
            enriched = self.fix_generator.generate_fixes(validated)

            # 5️⃣ REPORT
            sarif = self.reporter.generate_sarif(enriched)
            dashboard = self.reporter.generate_dashboard_summary(enriched)

            report_json = {
                "metadata": {
                    "tool": "Turing-Owl",
                    "version": "2.4.0",
                    **context.get_metadata(),
                },
                "summary": dashboard,
                "findings": enriched,
            }

            self._write_outputs(sarif, report_json, dashboard)

            return {
                "sarif": sarif,
                "report": report_json,
                "dashboard": dashboard,
            }

        except Exception as e:
            context.add_error(str(e))
            context.add_error(traceback.format_exc())
            return {
                "error": "Internal scanner failure",
                "details": context.errors,
            }

    # ======================
    # OUTPUT
    # ======================
    def _write_outputs(self, sarif: dict, report: dict, dashboard: dict):
        os.makedirs(self.output_dir, exist_ok=True)

        with open(os.path.join(self.output_dir, "report.sarif"), "w", encoding="utf-8") as f:
            json.dump(sarif, f, indent=2)

        with open(os.path.join(self.output_dir, "report.json"), "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        with open(os.path.join(self.output_dir, "dashboard.json"), "w", encoding="utf-8") as f:
            json.dump(dashboard, f, indent=2)

    def scan_repo(self, repo_url: str, ref: str | None = None):
        fetcher = RepoFetcher()
        try:
            local_path = fetcher.clone(repo_url, ref)
            return self.run(local_path)
        finally:
            fetcher.cleanup()
