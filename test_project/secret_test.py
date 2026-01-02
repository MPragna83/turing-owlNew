import os
import sys
import pickle
import yaml
import hashlib
import sqlite3
import subprocess
import requests
import ssl
import jwt
import re
from flask import Flask, request, render_template_string

app = Flask(__name__)

# =====================================================
# 1️⃣ COMMAND INJECTION (CWE-77)
# =====================================================
def run_command():
    cmd = input("Enter command: ")
    os.system(cmd)              # should trigger command injection
    subprocess.call(cmd, shell=True)  # shell=True RCE


# =====================================================
# 2️⃣ EVAL / RCE (CWE-95)
# =====================================================
def eval_rce():
    code = input("Enter python code: ")
    eval(code)
    exec(code)


# =====================================================
# 3️⃣ SQL INJECTION (CWE-89)
# =====================================================
def sql_injection():
    user = input("Username: ")
    conn = sqlite3.connect("users.db")
    cur = conn.cursor()

    query = f"SELECT * FROM users WHERE name = '{user}'"
    cur.execute(query)   # string-built SQL
    return cur.fetchall()


# =====================================================
# 4️⃣ XSS (CWE-79)
# =====================================================
@app.route("/xss")
def reflected_xss():
    name = request.args.get("name")
    return f"<h1>Hello {name}</h1>"


@app.route("/xss_template")
def template_xss():
    name = request.args.get("name")
    return render_template_string("<p>{{name}}</p>", name=name)


# =====================================================
# 5️⃣ PATH TRAVERSAL (CWE-22)
# =====================================================
def read_file():
    filename = input("Enter filename: ")
    with open(filename) as f:
        return f.read()


# =====================================================
# 6️⃣ INSECURE DESERIALIZATION (CWE-502)
# =====================================================
def load_pickle():
    data = input("Enter pickled data path: ")
    with open(data, "rb") as f:
        return pickle.load(f)


def load_yaml():
    content = input("YAML file: ")
    with open(content) as f:
        return yaml.load(f)   # unsafe yaml.load


# =====================================================
# 7️⃣ HARDCODED SECRETS (CWE-798)
# =====================================================
API_KEY = "sk_live_1234567890"
AWS_SECRET = "AKIA123456789SECRET"

def api_key():
    return "hardcoded_api_key_123"


# =====================================================
# 8️⃣ LOGGING SECRETS (CWE-532)
# =====================================================
def log_secret():
    password = input("Password: ")
    print("User password:", password)


# =====================================================
# 9️⃣ WEAK CRYPTO (CWE-327)
# =====================================================
def weak_crypto(data):
    return hashlib.md5(data.encode()).hexdigest()


# =====================================================
# 🔟 SSL VERIFICATION DISABLED (CWE-295)
# =====================================================
def insecure_https():
    requests.get("https://example.com", verify=False)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE


# =====================================================
# 1️⃣1️⃣ SSRF (CWE-918)
# =====================================================
def ssrf():
    url = input("Enter URL: ")
    return requests.get(url).text


# =====================================================
# 1️⃣2️⃣ JWT NONE ALGORITHM (CWE-347)
# =====================================================
def jwt_none(token):
    jwt.decode(token, options={"verify_signature": False})


# =====================================================
# 1️⃣3️⃣ DEBUG MODE ENABLED (CWE-489)
# =====================================================
if __name__ == "__main__":
    app.run(debug=True)
