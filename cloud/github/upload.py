import requests
import json

def upload_sarif(
    repo_url: str,
    commit: str,
    sarif: dict,
    token: str
):
    owner_repo = repo_url.replace("https://github.com/", "").strip("/")
    url = f"https://api.github.com/repos/{owner_repo}/code-scanning/sarifs"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    payload = {
        "commit_sha": commit,
        "ref": "refs/heads/main",
        "sarif": json.dumps(sarif)
    }

    r = requests.post(url, headers=headers, json=payload)
    if r.status_code >= 300:
        raise RuntimeError(f"GitHub upload failed: {r.text}")
