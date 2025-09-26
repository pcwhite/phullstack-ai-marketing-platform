# Use an official Python runtime as a parent image
FROM python:3.13-slim

# TODO: INSTALL VIDEO EDITING TOOLS - whisper, etc.


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