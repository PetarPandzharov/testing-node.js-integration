# Testing Node.js Integration

Simple Express application with a MySQL connectivity endpoint.

## Setup

Install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env` and set the MySQL connection values, then start the server:

```sh
npm start
```

The application exposes:

- `GET /` - basic application response
- `GET /health` - HTTP health check
- `GET /db-health` - MySQL connectivity check

The server listens on port `3000` by default.