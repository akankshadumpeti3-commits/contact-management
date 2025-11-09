# NestJS Contact Management API

A RESTful API built with NestJS and MongoDB for managing contacts.

## Prerequisites

- **Node.js** v14.x or higher
- **MongoDB** v4.4 or higher (running locally or via Docker)
- **npm** v6.x or higher

## MongoDB Setup

### Option 1: Local Installation

1. Download and install MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB runs as a service automatically after installation
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Verify MongoDB is running on default port `27017`

### Option 2: Docker

Run MongoDB in a Docker container:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:4.4
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Update environment variables in `.env` if needed (see **Environment Variables** below)

## Environment Variables

All environment variables are documented in `.env.example`. Key variables:

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Application port (default: 3000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/contact-management)
- `MONGODB_DATABASE`: Database name (default: contact-management)

**Note**: The MongoDB database will be created automatically on first connection.

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### Production Mode

```bash
npm run build
npm run start:prod
```

## Other Commands

```bash
npm run build       # Build the application
npm run format      # Format code with Prettier
npm run lint        # Lint and fix code
npm test            # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:cov    # Run tests with coverage
npm run test:e2e    # Run end-to-end tests
```

## Project Structure

```
src/
├── app.module.ts       # Root application module with MongoDB configuration
├── app.controller.ts   # Application controller
├── app.service.ts      # Application service
├── main.ts             # Application entry point
└── ...
```

## Technology Stack

- **Framework**: NestJS v11
- **Database**: MongoDB v4.4+
- **ODM**: Mongoose v8
- **Runtime**: Node.js v14+
- **Language**: TypeScript v5 
