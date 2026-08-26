# Testing Node.js Integration

Simple Express and MySQL application for testing the Node.js integration with SiteGround.

## Setup

Install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env`, set the MySQL connection values, and create the database table below. Then start the server:

```sh
npm start
```

The application exposes:

- `GET /` - basic application response
- `GET /health` - HTTP health check
- `GET /names` - list of people saved in MySQL
- `POST /names` - add a person using `{ "name": "Elena" }`
- `GET /db-health` - MySQL connectivity check

The server listens on port `3000` by default.

## Database table

Run this SQL after selecting the configured database:

```sql
CREATE TABLE persons (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);
```

For hosting, set the same `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values in the application's environment settings. Set `DB_HOST` to the MySQL hostname supplied by the hosting provider if it is not `127.0.0.1`.
