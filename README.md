# Listings Application

This project contains a backend API server and two frontend applications (manager and customer interfaces).

## Architecture

- **Server**: Node.js/TypeScript backend API running on port 3000
- **Manager**: Static frontend for managers running on port 8080
- **Customer**: Static frontend for customers running on port 8081

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Navigate to the project root directory:

   ```bash
   cd listings
   ```

2. Start all services:

   ```bash
   docker-compose up
   ```

3. Access the applications:
   - **Backend API**: http://localhost:3000
   - **Manager Interface**: http://localhost:8887
   - **Customer Interface**: http://localhost:8888

### Building Images

To build the Docker images with your Docker Hub username:

```bash
# Build and tag for Docker Hub
docker-compose build
docker tag listings-server username/listings-server:latest
docker tag listings-manager username/listings-manager:latest
docker tag listings-customer username/listings-customer:latest
```

### Stopping the Application

```bash
docker-compose down
```

## Development

### Backend Development

The server is a Node.js/TypeScript application with the following endpoints:

- `/listings` - Listings management
- `/reviews` - Reviews management

### Frontend Development

Both frontend applications are static HTML/CSS/JavaScript applications served by nginx.

## Docker Services

- **server**: Node.js backend API
- **manager**: Manager frontend interface
- **customer**: Customer frontend interface

All services are connected via a Docker network for internal communication.
