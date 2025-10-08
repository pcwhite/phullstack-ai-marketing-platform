# Use an official Python runtime as a parent image
FROM python:3.13-slim

RUN apt-get update && apt-get install -y ffmpeg 


# Install Poetry
RUN pip install poetry

# Set the working directory in the container
WORKDIR /app

# Copy source files and metadata before install first for dependency caching
COPY pyproject.toml poetry.lock* README.md ./
COPY src/ src/

# Install dependencies and your project
RUN poetry install --no-interaction --no-ansi

# Run the service when the container launches
CMD ["poetry", "run", "asset-processing-service"]