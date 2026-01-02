import os
import shutil
import tempfile
import json
from git import Repo

from backend.core.orchestrator import Orchestrator


def run_cloud_scan(repo: str, commit: str, rules_dir: str, out_format: str):
    """
    Cloud-style scan:
    - Clone repo to temp dir
    - Checkout commit
    - Run existing Orchestrator
    - Print JSON or SARIF
    """

    tmp_dir = tempfile.mkdtemp(prefix="turing-owl-")

    try:
        print(f"[+] Cloning {repo}")
        r = Repo.clone_from(repo, tmp_dir)

        if commit and commit != "HEAD":
            print(f"[+] Checking out {commit}")
            r.git.checkout(commit)

        print("[+] Running scan")
        orch = Orchestrator(rules_dir)
        result = orch.run(tmp_dir)

        if out_format == "json":
            print(json.dumps(result["report"], indent=2))
        else:
            print(json.dumps(result["sarif"], indent=2))

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
