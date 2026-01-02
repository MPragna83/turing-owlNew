from backend.agents.agent1_parser import CodeParsingAgent
from backend.agents.agent2_rules import RuleEngineAgent
import json

parser = CodeParsingAgent()
parsed = parser.parse("test_project")

engine = RuleEngineAgent("backend/rules")
findings = engine.analyze(parsed)

print(json.dumps(findings, indent=2))
print("\nTOTAL TAINT FINDINGS:", len(findings))
