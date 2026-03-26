# Spotify API
This project is an assignment for the course **1DV627 - Webben som applikationsplattform** at Linneaus Univeristy. 

**👉 For examiners:** <br/>
The full assignment documentation (design decisions, architecture, etc.) can be found here: <br/>
[Assigment documentation](./docs/assignment_documentation.md) 

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Database & Seeding](#database--seeding)
- [Testing](#testing)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [API Access](#api-access)
- [Features](#features)
- [Security & Validation](#security--validation)
- [License](#license)

## Overview
This is a **GraphQL API** built on top of a Spotify tracks dataset. It exposes three main resources:
- Tracks (CRUD)
- Albums (read-only)
- Artists (read-only)

The API allows filtering tracks based on audio features such as:
-  danceability
- energy
- tempo
- genre
- explicit
- acousticness
- instrumentalness
- key
It also includes **JWT-based authentication**, input validation, and API protection mechanisms such as rate limiting and secure HTTP headers.

## Tech Stack
- Node.js + Express
- GraphQL (Apollo Server)
- PostgreSQL
- DataLoader
- JWT Authentication
- Docker
- Postman / Newman (testing)

[⬆ Back to top](#table-of-contents)

## Getting Started

**1. Clone the repository**
```
git clone <https://github.com/sollensmilla/spotify-api.git>
cd spotify-api
```

**2. Install dependencies**
```
npm install
```

**3. Environment variables** <br/>
Create a .env file in the root:
```
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

## Running the application

### Development mode
```
npm run dev
```

### Prodoction mode
```
npm start
```
The API will be available at:
```
http://localhost:3000/graphql
```
[⬆ Back to top](#table-of-contents)

## Database & Seeding
### Create tables + seed data
```
npm run seed
```
This will:
- Create database tables
- Parse the CSV dataset
- Insert tracks, albums, and artists as well as track_artists joint table

## Testing
The project uses **Postman + Newman** for API testing.
### Run tests locally
```
npm run test:api
```
Uses:
```
tests/local.postman_environment.json
```

### Run tests against production
```
npm run test:api-production
```
Uses:
```
tests/production.postman_environment.json
```
[⬆ Back to top](#table-of-contents)

## Docker
### Build Docker image
```
docker build -t spotify-api .
```
### Run container
```
docker run -p 3000:3000 --env-file .env spotify-api
```

## Project Structure
```
src/
│
├── config/        # Database & GraphQL setup
├── graphql/       # Types, resolvers, loaders 
├── services/      # Business logic
├── middleware/    # Auth middleware
├── utils/         # Helper functions
├── seed/          # Data import pipeline
├── tests/.        # Postman test file and environments
└── server.js      # Entry point
```
The project follows: 
- Separation of concerns
- Dependency injection
- Modular GraphQL architecture

[⬆ Back to top](#table-of-contents)

## API Access
### Production
🔗 [https://spotify-api-production-82d8.up.railway.app/graphql](https://spotify-api-production-82d8.up.railway.app/graphql) <br />
### Documentation
📄 [https://documenter.getpostman.com/view/40250406/2sBXijJrkf](https://documenter.getpostman.com/view/40250406/2sBXijJrkf)

## Features
- GraphQL single endpoint `(/graphql)`
- Filtering & pagination
- Nested queries (tracks ↔ artists ↔ albums)
- JWT authentication
- Input validation (strict type & range validation)
- Rate limiting & API protection
- Secure HTTP headers (Helmet)
- DataLoader optimization (avoids N+1 problem)
- Structured error handling

[⬆ Back to top](#table-of-contents)

## Security & Validation
The API includes several security mechanisms and input validation strategies to ensure safe and robust operation.

### Input Validation
All incoming data is validated at the service layer using custom validation utilities:
- Strings, numbers, booleans, and UUIDs are strictly validated
- Length constraints and value ranges are enforced
- Invalid input results in structured GraphQL errors (`UserInputError`)

This prevents malformed data from reaching the database.

### Authentication & Authorization
- JWT-based authentication is used for protected operations
- Tokens are signed using HS256 and expire after 1 hour
- Passwords are securely hashed using bcrypt before storage

### Rate Limiting
- Global rate limit: **100 requests per 15 minutes per IP**
- Additional rate limiting is applied to the `/graphql` endpoint
- Authentication operations (`register`, `login`) are excluded to allow onboarding and testing

This protects the API from abuse and brute-force attacks.

### HTTP Security Headers
- `helmet` is used to set secure HTTP headers
- Helps mitigate common attacks such as XSS, clickjacking, and MIME sniffing

### Error Handling
- Centralized and structured error handling via Apollo Server
- Uses:
  - `UserInputError`
  - `AuthenticationError`
  - `ApolloError`
- Prevents leaking sensitive internal details

### Environment Configuration
- Sensitive data (e.g. JWT secret, database credentials) is stored in environment variables using `dotenv`
- Ensures secrets are not exposed in the codebase

## License
This project is part of a university assignment and is intended for educational purposes.

[⬆ Back to top](#table-of-contents)