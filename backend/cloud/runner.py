import tempfile
import shutil
import os
from git import Repo
from backend.core.orchestrator import Orchestrator


def run_cloud_scan(repo_url: str, commit: str, out: str):
    tmp_dir = tempfile.mkdtemp(prefix="turing-owl-")

    try:
        Repo.clone_from(repo_url, tmp_dir, branch=commit, depth=1)

        orch = Orchestrator("backend/rules")
        result = orch.run(tmp_dir)

        if out == "json":
            print(result["report"])
        else:
            print(result["sarif"])

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
