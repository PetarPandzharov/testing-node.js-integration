# Testing Node.js Integration

Simple Express and MySQL application for testing the Node.js integration with SiteGround.

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
- `GET /names` - list of sample names
- `GET /db-health` - MySQL connectivity check

The server listens on port `3000` by default.
