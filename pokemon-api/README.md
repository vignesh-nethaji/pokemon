# Pokémon API

A RESTful API built with Node.js and Express to fetch and serve Pokémon data. The project is structured for scalability, maintainability, and includes robust error handling and logging.

## Features
- Fetch paginated Pokémon data
- Fetch details for a specific Pokémon by identifier
- Centralized error handling
- Logging with Winston
- CORS support
- Unit and integration tests with Jest and Supertest

## Project Structure
```
pokemon-api/
├── app.js                # Express app setup
├── server.js             # Entry point
├── package.json          # Project metadata and scripts
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Custom middleware (error handler, etc.)
├── services/             # Business logic and data fetching
├── utils/                # Utility functions and logger
├── __tests__/            # Unit and integration tests
│   ├── integration/
│   └── unit/
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd pokemon-api
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Server
- Start the server:
  ```sh
  npm start
  ```
- For development with auto-reload:
  ```sh
  npm run dev
  ```
- The server will run on `http://localhost:3000` by default.

## API Endpoints
- `GET /pokemon` — Get a paginated list of Pokémon
- `GET /pokemon/:identifier` — Get details for a specific Pokémon

## Testing
- Run all tests:
  ```sh
  npm test
  ```
- Run only unit tests:
  ```sh
  npm run test:unit
  ```
- Run only integration tests:
  ```sh
  npm run test:integration
  ```
- Test coverage reports are generated in the `coverage/` directory.

## Environment Variables
You can configure environment variables in a `.env` file. See `config/environment.js` for supported variables.

## Logging
Logs are written to the `logs/` directory using Winston. Separate files for combined, error, and exceptions.

## License
MIT
