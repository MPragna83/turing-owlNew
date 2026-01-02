FROM python:3.11-slim

RUN apt-get update && apt-get install -y git

WORKDIR /app
COPY . /app

RUN pip install .

ENTRYPOINT ["/app/.github/actions/scan/entrypoint.sh"]
