<<<<<<< HEAD
FROM python:3.9-slim
=======
FROM python:3.11-slim
>>>>>>> f66392c84b67e0cc47088a25fedd998c507c3569

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

<<<<<<< HEAD
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
=======
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
>>>>>>> f66392c84b67e0cc47088a25fedd998c507c3569
