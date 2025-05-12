# Software Integration Project Documentation

**Version 1.0.0**

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Requirements](#requirements)
4. [Setup](#setup)

   * [Clone Repository](#clone-repository)
   * [Configure Environment](#configure-environment)
   * [Install & Build](#install--build)
   * [Run Locally](#run-locally)
   * [Docker Setup](#docker-setup)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Core Middleware & Services](#core-middleware--services)
8. [API Endpoints](#api-endpoints)
9. [Error Handling](#error-handling)
10. [Logging & Health](#logging--health)
11. [Testing](#testing)
12. [CI & Quality](#ci--quality)
13. [Deployment](#deployment)
14. [Contributing](#contributing)
15. [FAQ](#faq)
16. [License](#license)

---

## Overview

This project is a RESTful API built with Node.js, Express, TypeScript, and MongoDB, with optional PostgreSQL support. It provides user authentication, messaging, comments, ratings, and profile management, secured by JWT and structured for containerized scaling.

## Architecture

* **API Layer**: Express with modular routes and controllers
* **Databases**:

  * MongoDB (primary for domain models)
  * PostgreSQL (optional, configured via environment)
* **Security**: `helmet`, CORS, JWT-based auth
* **Logging**: Morgan (HTTP) and Winston (application)
* **DevOps**: Docker, Docker Compose, Newman for Postman tests

## Requirements

* Node.js v16+
* npm v8+
* MongoDB (local or Docker)
* PostgreSQL (if using relational data)
* Docker & Docker Compose (optional)
* Git

## Setup

### Clone Repository

```bash
git clone /mnt/data/Software-Integration-Project.git
cd Software-Integration-Project/Software-Integration-Project
```

### Configure Environment

Copy one of the provided `.env.*` files (e.g., `.env.development`) to `.env`:

```bash
cp .env.development .env
```

Ensure values are set:

```
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug
JWT_SECRET_KEY=your_jwt_secret
MONGODB_URI=mongodb://mongo:27017/epita
DB_HOST=postgres
DB_PORT=5432
DB_NAME=movies
DB_USER=postgres
DB_PASSWORD=postgres
# Mongo Express (optional)
ME_CONFIG_MONGODB_SERVER=mongo
ME_CONFIG_MONGODB_PORT=27017
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=admin
```

### Install & Build

```bash
npm install
npm run build
```

### Run Locally

* **Development** (auto-rebuild):

  ```bash
  npm run dev
  ```
* **Production**:

  ```bash
  npm start
  ```

### Docker Setup

* Build and start:

  ```bash
  docker-compose up --build -d
  ```
* Stop and remove:

  ```bash
  docker-compose down
  ```

## Environment Variables

| Variable                       | Description                              | Example                       |
| ------------------------------ | ---------------------------------------- | ----------------------------- |
| `NODE_ENV`                     | Environment (`development`/`production`) | `development`                 |
| `PORT`                         | Service port                             | `8080`                        |
| `LOG_LEVEL`                    | Winston log level                        | `debug`                       |
| `JWT_SECRET_KEY`               | Secret for signing JWTs                  | `your_jwt_secret`             |
| `MONGODB_URI`                  | MongoDB connection string                | `mongodb://mongo:27017/epita` |
| `DB_HOST`                      | PostgreSQL host                          | `postgres`                    |
| `DB_PORT`                      | PostgreSQL port                          | `5432`                        |
| `DB_NAME`                      | PostgreSQL database name                 | `movies`                      |
| `DB_USER`                      | PostgreSQL user                          | `postgres`                    |
| `DB_PASSWORD`                  | PostgreSQL password                      | `postgres`                    |
| `ME_CONFIG_MONGODB_SERVER`     | Mongo Express server host                | `mongo`                       |
| `ME_CONFIG_MONGODB_PORT`       | Mongo Express server port                | `27017`                       |
| `ME_CONFIG_BASICAUTH_USERNAME` | Mongo Express username                   | `admin`                       |
| `ME_CONFIG_BASICAUTH_PASSWORD` | Mongo Express password                   | `admin`                       |

## Project Structure

```
Software-Integration-Project/
├── src/
│   ├── boot/             # App initialization (DB, Express)
│   ├── constants/        # Shared enums & constants
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, validation, errors, health
│   ├── models/           # Mongoose schemas & TS models
│   ├── routes/           # Route definitions
│   └── index.ts          # Entry point
├── __tests__/            # Jest unit & integration tests
├── docker-compose*.yml   # Compose setups (dev/prod)
├── postman/              # Collection & environment for Newman
├── .env.*                # Env examples
├── package.json          # Scripts & dependencies
├── tsconfig.json         # TypeScript config
└── .eslintrc.js          # Linting config
```

## Core Middleware & Services

* **helmet**: Secure HTTP headers
* **cors**: Cross-origin access control
* **express-validator**: Request payload validation
* **authentication**: JWT issuance and guard
* **healthCheck**: `/health` endpoint for liveness/readiness
* **notFound**: Catch-all 404 handler
* **winston**: Application logging setup
* **database**: MongoDB connection; optional PostgreSQL setup

## API Endpoints

Base URL: `http://localhost:{PORT}/api`

### Authentication

| Method | Endpoint         | Body                         | Auth Required |
| ------ | ---------------- | ---------------------------- | ------------- |
| POST   | `/auth/register` | `{ name, email, password }`  | No            |
| POST   | `/auth/login`    | `{ email, password }`        | No            |
| POST   | `/auth/logout`   | — (clears token client-side) | Yes           |

### Users (Requires JWT)

| Method | Endpoint     | Body              | Description      |
| ------ | ------------ | ----------------- | ---------------- |
| GET    | `/users`     | —                 | List all users   |
| GET    | `/users/:id` | —                 | Get user details |
| PUT    | `/users/:id` | `{ name, email }` | Update user      |
| DELETE | `/users/:id` | —                 | Delete user      |

### Messages (Requires JWT)

| Method | Endpoint        | Body                       | Description    |
| ------ | --------------- | -------------------------- | -------------- |
| GET    | `/messages`     | `?page=&limit=`            | Paginated list |
| POST   | `/messages`     | `{ content, recipientId }` | Create message |
| GET    | `/messages/:id` | —                          | Get message    |
| DELETE | `/messages/:id` | —                          | Delete message |

### Comments, Ratings, Profile

Endpoints available under `/comments`, `/rating`, `/profile` following similar patterns for CRUD operations—refer to route files in `src/routes/` for details.

## Error Handling

* **404**: Route not found
* **400**: Validation errors with details
* **401**: Authentication failures
* **500**: Server errors (unexpected)

## Logging & Health

* **HTTP**: Morgan logs requests
* **App**: Winston writes to console/files per `LOG_LEVEL`
* **Health**: GET `/health` returns `{ status, uptime, db:connectionStatus }`

## Testing

* **Framework**: Jest with TypeScript support
* **Run tests**: `npm test`
* **Coverage**: `npm run test:coverage`
* **Postman**: `npm run postman:test` (Newman)

## CI & Quality

* **Lint**: `npm run lint`, autofix with `npm run lint:fix`
* **Format**: `npm run format`
* **Pre-commit**: Husky + lint-staged
* CI pipeline includes build, lint, test, and Newman checks

## Deployment

* Deploy with Docker Compose (multi-env files)
* Use multi-stage Dockerfile for lean production image
* Kubernetes manifests available if required

## Contributing

1. Fork the repository
2. Create branch: `feat/your-feature`
3. Commit & push changes
4. Open PR and follow guidelines in `CONTRIBUTING.md`

## FAQ

* **Port conflict?** Update `PORT` in `.env`
* **DB connection?** Check `MONGODB_URI` and container names
* **JWT errors?** Verify `JWT_SECRET_KEY`

## License

This project is licensed under the MIT License. See `LICENSE` for details.
