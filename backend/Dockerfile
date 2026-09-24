FROM python:3.11-slim

# Prevent Python from writing bytecode and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Install lightweight PyTorch CPU wheel first (saves 2.5GB and builds fast)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY --chown=user:user . .

# Ensure upload directories exist and are writable
RUN mkdir -p static/uploads/scans static/uploads/profile static/uploads/signatures static/uploads/degrees && \
    chmod -R 777 static

# Switch to non-root user
USER user

# Expose default Hugging Face Spaces port
EXPOSE 7860

# Launch FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
