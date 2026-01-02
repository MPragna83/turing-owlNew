import os

def get_cloud_token() -> str:
    token = os.getenv("TURING_OWL_TOKEN")
    if not token:
        raise RuntimeError("TURING_OWL_TOKEN not set")
    return token
