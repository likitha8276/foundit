# Production Dockerfile for AI Lost and Found ML Microservice
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU and dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV TEXT_MODEL_NAME=sentence-transformers/all-mpnet-base-v2
ENV IMAGE_MODEL_NAME=openai/clip-vit-base-patch32

# Pre-download models during docker build to ensure instant container startup
RUN python -c "from transformers import AutoTokenizer, AutoModel, CLIPProcessor, CLIPModel; \
    AutoTokenizer.from_pretrained('sentence-transformers/all-mpnet-base-v2'); \
    AutoModel.from_pretrained('sentence-transformers/all-mpnet-base-v2'); \
    CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32'); \
    CLIPModel.from_pretrained('openai/clip-vit-base-patch32')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
