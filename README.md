# Turing-Owl í¶‰

Agentic static application security scanner (Semgrep-style).

## What this does
- Local source code scanning
- Cloud-style GitHub repository scanning
- Taint + semantic analysis
- Interprocedural analysis
- SARIF output (GitHub-compatible)
- CI-friendly exit codes

## Install (dev)
```bash
pip install -e .

turing-owl scan path/to/project

turing-owl scan path/to/project

turing-owl cloud-scan \
  --repo https://github.com/OWNER/REPO \
  --commit main \
  --out sarif

turing-owl rules validate backend/rules


---

## í´¹ STEP 5 â€” ENSURE `.gitignore` EXISTS

```bash
cat << 'EOF' > .gitignore
__pycache__/
*.pyc
*.pyo
.env
.venv/
venv/
build/
dist/
.eggs/
*.egg-info/
*.sarif
*.json
.turing-owl-cache/
