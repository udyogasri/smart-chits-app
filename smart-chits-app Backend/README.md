# Smart Chits Backend

A FastAPI-based backend for the Smart Chits application.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env` file.

4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once running, visit `http://localhost:8000/docs` for Swagger UI.

## Deployment

Build and run with Docker:
```bash
docker build -t smart-chits-backend .
docker run -p 8000:8000 smart-chits-backend
```