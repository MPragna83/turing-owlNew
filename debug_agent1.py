from backend.agents.agent1_parser import CodeParsingAgent
import json

parser = CodeParsingAgent()
results = parser.parse("test_project")

print(json.dumps(results, indent=2))
