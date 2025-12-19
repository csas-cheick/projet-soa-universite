FROM python:3.10-slim
WORKDIR /app
RUN pip install fastapi "uvicorn[standard]" pymongo "python-jose[cryptography]" pydantic
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]