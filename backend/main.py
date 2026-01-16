import json
import os

if args.sarif:
    sarif = result.get("sarif", {})

    output_path = args.output or "result.sarif"

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(sarif, f, indent=2)

    print(f"SARIF written to {output_path}")
    return
