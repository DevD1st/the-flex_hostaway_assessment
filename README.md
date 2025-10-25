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

Please note:

- Backend live API: https://the-flex-yusuf-hostaway-backend.onrender.com
- Frontend (Manager) live API: https://the-flex-hostaway-assessment.onrender.com
- Frontend (Customer) live API: https://the-flex-yusuf-hostaway-customer.onrender.com

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

## Testing

### Running Tests

The project includes comprehensive test coverage for the backend API:

```bash
# Run all tests
cd server && npm test

# Run specific test files
npm test -- --testPathPattern="func.test.ts"
npm test -- --testPathPattern="listings.router.test.ts"
npm test -- --testPathPattern="reviews.router.test.ts"
```

### Test Structure

- **Unit Tests**: Located in `server/src/util/__test__/` - Test utility functions
- **Integration Tests**: Located in `server/src/routers/__test__/` - Test API endpoints
- **Test Framework**: Jest with TypeScript support
- **HTTP Testing**: Supertest for API endpoint testing

### Test Coverage

- ✅ **Utility Functions**: `validateDto`, `transformStringToStringArray`, `transformStringToIntArray`
- ✅ **Listings Router**: GET endpoints with validation and error handling
- ✅ **Reviews Router**: GET and PATCH endpoints with authentication and validation

## CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing and CI/CD:

- **Workflow File**: `.github/workflows/server-test.yaml`
- **Trigger Events**:
  - Pull requests to `main` branch
  - Pushes to `main` branch
  - Manual workflow dispatch
- **Path Filtering**: Only runs when `server/**/*` files are changed

### Automated Testing

The CI pipeline automatically:

1. **Checks out code** from the repository
2. **Sets up Node.js 20.x** environment
3. **Installs dependencies** with `npm i`
4. **Runs tests** with `npm run test:ci`

### Workflow Configuration

```yaml
name: PermTest
on:
  pull_request:
    branches: [main]
    paths: [server/**/*]
  push:
    branches: [main]
    paths: [server/**/*]
  workflow_dispatch:
```

### Development Process

1. **Create Feature Branch**:

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**: Implement your changes with proper tests

3. **Run Tests Locally**: Ensure all tests pass

   ```bash
   cd server && npm test
   ```

4. **Commit and Push**: Push to remote and create pull request

   ```bash
   git add .
   git commit -m "feat: add new listing endpoint"
   git push origin feature/new-feature
   ```

5. **Automated Testing**: GitHub Actions will automatically run tests on PR creation

### Code Quality Standards

- **Automated Testing**: All tests must pass in CI pipeline
- **Type Safety**: Full TypeScript support with strict mode
- **Error Handling**: Comprehensive error handling and validation
- **Path-based Triggers**: CI only runs when server code changes

### Docker Services

- **server**: Node.js backend API
- **manager**: Manager frontend interface
- **customer**: Customer frontend interface

All services are connected via a Docker network for internal communication.
