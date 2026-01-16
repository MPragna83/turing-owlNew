#!/bin/sh
set -e

echo "íº€ Running Turing-Owl scanner..."

python -m backend.cli scan /github/workspace --sarif > /github/workspace/result.sarif

echo "âœ” Scan complete."
echo "í³„ Result saved to result.sarif"
