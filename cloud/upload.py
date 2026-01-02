import json
import sys

def upload_results(results, fmt):
    if fmt == "sarif":
        print(json.dumps(results, indent=2))
    else:
        print(json.dumps(results, indent=2))
