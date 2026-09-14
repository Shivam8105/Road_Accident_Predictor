# Multi-stage Dockerfile for FastAPI + React deployment on Render

# STAGE 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend configuration and dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and build production bundle
COPY frontend/ ./
RUN npm run build

# STAGE 2: Python FastAPI Backend Service
FROM python:3.11-slim AS runner
WORKDIR /app

# Install OS runtime dependencies (OpenMP for XGBoost/LightGBM)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy dataset files and backend source code
COPY indian_roads_dataset.csv .
COPY Road.csv .
COPY backend/ ./backend/

# Copy pre-built frontend distribution from STAGE 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000

# Set environment variable for Python module imports
ENV PYTHONPATH=/app/backend

# Launch FastAPI app with Uvicorn
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
