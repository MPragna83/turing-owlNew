import subprocess
import tempfile
import shutil
import os
from typing import Optional


class RepoFetcher:
    """
    Secure Git repository fetcher (GitHub-style).
    """

    def __init__(self):
        self.base_dir = tempfile.mkdtemp(prefix="turing-owl-")

    def clone(self, repo_url: str, ref: Optional[str] = None) -> str:
        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        target_path = os.path.join(self.base_dir, repo_name)

        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, target_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )

        if ref:
            subprocess.run(
                ["git", "checkout", ref],
                cwd=target_path,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True,
            )

        return target_path

    def cleanup(self):
        shutil.rmtree(self.base_dir, ignore_errors=True)
