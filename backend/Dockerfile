FROM python:3.12-slim

WORKDIR /app

ENV DJANGO_SETTINGS_MODULE=core.prod
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv export --format requirements.txt --no-hashes | pip install --no-cache-dir -r /dev/stdin
COPY . .

CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000"]