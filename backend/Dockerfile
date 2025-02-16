# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container at /app
COPY requirements.txt .

# Install packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code into the container at /app
COPY . .

# Expose port 8000 for the application
EXPOSE 8000

# Define environment variables (if not using a .env file)
ENV SECRET_KEY=supersecretkey

# Run the application with auto-reload enabled for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
