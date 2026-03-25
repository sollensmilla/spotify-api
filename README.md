# Spotify API
This project is an assignment for the course **1DV627 - Webben som applikationsplattform** at Linneaus Univeristy. 

**👉 For examiners:** <br/>
The full assignment documentation (design decisions, architecture, etc.) can be found here: <br/>
[Assigment documentation](./docs/assignment_documentation.md) 

## Overview
This is a **GraphQL API** built on top of a Spotify tracks dataset. It exposes three main resources:
- Tracks (CRUD)
- Albums (read-only)
- Artists (read-only) <br />
<br/>
The API allows filtering tracks based on audio features such as:
- danceability
- energy
- tempo
- genre
- explicit
- acousticness
- instrumentalness
- key
It also includes **JWT-based authentication** to protect write operations.

## Tech Stack
- Node.js + Express
- GraphQL (Apollo Server)
- PostgreSQL
- DataLoader
- JWT Authentication
- Docker
- Postman / Newman (testing)

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

## API Access
### Production
🔗 [https://spotify-api-production-82d8.up.railway.app/graphql](https://spotify-api-production-82d8.up.railway.app/graphql) <br />
### Documentation
📄 [https://documenter.getpostman.com/view/40250406/2sBXijJrkf](https://documenter.getpostman.com/view/40250406/2sBXijJrkf)

## Features