FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv export --format requirements.txt --no-hashes | pip install -no-cache-dir -r /dev/stdin

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]