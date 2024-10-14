# Fugle Pre-test
- This project is for pre-test of Fugle.
- This project sets up a Node.js application using Docker and Docker compose to simplify set up flow.

## Prerequisites
- Ubuntu 20.04 LTS (x86_64)
- Docker 27.3.1
- Docker Compose 27.3.1


## Project Structure

Your project should have the following structure:

```
project-root/
├── Dockerfile                # Instructions for building Docker image 
├── README.md                 # This file
├── app.js                    # Entry point for application 
├── docker-compose.yml        # Docker Compose configuration
├── package-lock.json         # Locked dependency 
├── package.json              # Package settings
├── src                       # Application source code
│   ├── config
│   ├── controller
│   ├── event
│   ├── helper
│   ├── model
│   ├── route
│   └── ws-server.js
└── tests                     # Test file for source code
    └── event

```

## Getting Started

1. **Clone the repository** (if applicable):
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Build and run the application**:
   ```
   docker compose up --build
   ```

3. **Access the application**:
   - Open your web browser and navigate to `http://localhost:3000/data?user=<id>`.
   - Open your ws client (e.g. Postman) to `ws://localhost:3000/streaming`.

## Stopping the Application

To stop the application and remove the containers, use:
```
docker compose down
```

## License
MIT
