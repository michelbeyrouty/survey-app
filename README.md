# Survey App

A RESTful API for creating and managing surveys, built with Express.js and SQLite.

## Features

- **Survey Management**: Create, list, and share surveys
- **Question Types**: Support for TEXT, RATING, and BOOLEAN questions
- **Role-Based Access**: ADMIN and ANSWERER roles with different permissions
- **Answer Collection**: Submit and retrieve survey responses
- **Statistics**: Aggregated survey results for admins

## Tech Stack

- **Runtime**: Node.js (>=14.0.0)
- **Framework**: Express.js
- **Database**: SQLite

## Installation

```bash
npm install
```

## Usage

### Local Development

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server runs on `http://localhost:3000` by default.

### Docker

```bash
# Build the image
docker build -t survey-app .

# Run the container
docker run -p 3000:3000 survey-app
```

## API Endpoints

### Health

| Method | Endpoint  | Auth | Description  |
| ------ | --------- | ---- | ------------ |
| GET    | `/health` | None | Health check |

### Surveys

| Method | Endpoint                       | Auth     | Description             |
| ------ | ------------------------------ | -------- | ----------------------- |
| GET    | `/surveys`                     | Any Role | List surveys            |
| POST   | `/surveys`                     | Admin    | Create survey           |
| GET    | `/surveys/:surveyId`           | Any Role | Get survey by ID        |
| POST   | `/surveys/:surveyId/share`     | Admin    | Share survey with users |
| POST   | `/surveys/:surveyId/questions` | Admin    | Add questions to survey |

### Answers

| Method | Endpoint                                   | Auth     | Description                   |
| ------ | ------------------------------------------ | -------- | ----------------------------- |
| GET    | `/answers`                                 | Answerer | Get all user's answers        |
| GET    | `/surveys/:surveyId/answers`               | Answerer | Get user's answers for survey |
| POST   | `/surveys/:surveyId/answers`               | Answerer | Submit answers                |
| GET    | `/users/:userId/surveys/:surveyId/answers` | Admin    | Get user answers (admin)      |
| GET    | `/statistics`                              | Admin    | Get aggregated stats          |

## Authentication

Pass user info via headers:

- `x-user-id`: User ID
- `x-user-role`: `ADMIN` or `ANSWERER`

## Question Types

| Type      | Fields                                     |
| --------- | ------------------------------------------ |
| `TEXT`    | `text`, `type`                             |
| `BOOLEAN` | `text`, `type`                             |
| `RATING`  | `text`, `type`, `rating_min`, `rating_max` |

## Example Payloads

### Create Survey

```json
{
  "title": "Employee Engagement Survey",
  "questions": [
    {
      "text": "How satisfied are you with your current role?",
      "type": "RATING",
      "rating_min": 1,
      "rating_max": 5
    },
    {
      "text": "Do you feel supported by your manager?",
      "type": "BOOLEAN"
    },
    {
      "text": "What is one thing we could improve?",
      "type": "TEXT"
    }
  ]
}
```

### Submit Answers

```json
{
  "answers": [
    { "question_id": 1, "value": 4 },
    { "question_id": 2, "value": true },
    { "question_id": 3, "value": "Better communication" }
  ]
}
```

## Project Structure

```
├── config/          # Configuration constants
├── controllers/     # Route handlers and Business Logic handlers
├── docs/            # Project documentation
├── errors/          # Custom error classes
├── middlewares/     # Express middleware
├── policies/        # Authorization policies
├── services/        # DB access
├── validators/      # Request validation
├── Dockerfile       # Docker configuration
├── main.js          # App setup
└── server.js        # Entry point
```

## Notes

- Each answerer can submit only one set of answers per survey
- Assuming that the right combination of userId and role are sent as headers
- TODO: Add unit and integration tests
- TODO: Move database to external service (e.g., PostgreSQL, MySQL) instead of having it locally

## Original Requirements

See [docs/Developer_Take_Home_Project_1.pdf](docs/Developer_Take_Home_Project_1.pdf) for the original project instructions.

## License

ISC
