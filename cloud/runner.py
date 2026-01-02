import tempfile
import subprocess
import os
from backend.core.orchestrator import Orchestrator
from cloud.upload import upload_results

def run_cloud_scan(repo, commit, out_format):
    with tempfile.TemporaryDirectory(prefix="turing-owl-") as tmp:
        subprocess.run(
            ["git", "clone", "--depth", "1", repo, tmp],
            check=True
        )

        if commit != "HEAD":
            subprocess.run(["git", "checkout", commit], cwd=tmp, check=True)

        orch = Orchestrator()
        results = orch.run(tmp)

        upload_results(results, out_format)
