import tempfile
import subprocess
import os

def clone_repo(repo_url: str, commit: str) -> str:
    tmp = tempfile.mkdtemp(prefix="turing-owl-")
    subprocess.check_call(["git", "clone", repo_url, tmp])
    subprocess.check_call(["git", "checkout", commit], cwd=tmp)
    return tmp
