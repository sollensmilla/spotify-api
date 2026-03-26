# API Design Assignment

## Spotify API

## Table of Contents
- [Objective](#objective)
- [Implementation Type](#implementation-type)
- [Links and Testing](#links-and-testing)
- [Dataset](#dataset)
- [Design Decisions](#design-decisions)
  - [Authentication](#authentication)
    - [Why JWT?](#why-jwt)
    - [Alternatives and Trade-offs](#alternatives-and-trade-offs)
  - [API Design](#api-design)
    - [Schema design](#schema-design)
    - [Nested Queries](#nested-queries)
    - [Database Indexing and Performance](#database-indexing-and-performance)
    - [Pagination with Page Types](#pagination-with-page-types)
    - [Single Endpoint Approach](#single-endpoint-approach)
  - [Error Handling](#error-handling)
    - [Error Consistency](#error-consistency)
- [Core Technologies Used](#core-technologies-used)
- [Reflection](#reflection)
- [Acknowledgements](#acknowledgements)
- [Requirements](#requirements)
  - [Functional Requirements — Common](#functional-requirements--common)
  - [Functional Requirements — GraphQL](#functional-requirements--graphql)
  - [Non-Functional Requirements](#non-functional-requirements)

## Objective

This API serves data from the Spotify Tracks Dataset, exposing three main resources: tracks, albums, and artists. Users can query and filter tracks by audio features such as danceability, energy, tempo, and genre, as well as browse albums and artists. Tracks support full CRUD operations, while albums and artists are read-only. The API also includes user registration and login with JWT authentication to protect write operations.

## Implementation Type

**GraphQL**

## Links and Testing

| | URL / File |
|---|---|
| **Production API** | [Visit](https://spotify-api-production-82d8.up.railway.app/graphql)|
| **API Documentation** | [Visit](https://documenter.getpostman.com/view/40250406/2sBXijJrkf) |
| **GraphQL Playground** | [Visit](https://spotify-api-production-82d8.up.railway.app/graphql)|
| **Postman Collection** | [Collection](/tests/spotify-api.postman_collection.json) |
| **Production Environment** | [Example Environment](/tests/example.postman_environment.json) [Local Environment](/tests/local.postman_environment.json) [Production Environment](/tests/production.postman_environment.json)|

**Examiner can verify tests in one of the following ways:**

1. **CI/CD pipeline** — check the pipeline output in GitLab for test results.
2. **Run manually** — no setup needed:
   ```
   npm run test:api-production  
   ```

## Dataset

| Field | Description |
|---|---|
| **Dataset source** | [Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset)|
| **Primary resource (CRUD)** | Tracks (track_id, track_name, artists, album_name, track_genre, duration_ms, popularity, key, explicit, tempo, danceability, energy, acousticness, instrumentalness)|
| **Secondary resource 1 (read-only)** | Albums (album_id, album_name, total_tracks) |
| **Secondary resource 2 (read-only)** | Artists (artist_id, artist_name, genres, total_tracks, average_popularity) |

[⬆ Back to top](#table-of-contents)

## Design Decisions

### Authentication

The API uses **JWT (JSON Web Token)** authentication. When a user registers or logs in, the server validates their credentials, hashes passwords with bcrypt (12 salt rounds), and returns a signed JWT containing the user's `id` and `email`, with a 1-hour expiry. The token is signed with a secret key stored in an environment variable (`JWT_SECRET`).
On protected requests, an `authenticate` middleware extracts the Bearer token from the `Authorization` header and verifies it. The decoded user is attached to the GraphQL context, and a `requireAuth` guard is called at the top of any resolver that requires authentication — throwing an `AuthenticationError` if no valid user is present. Invalid or expired tokens are handled gracefully by returning `null` rather than crashing, letting `requireAuth` handle the rejection uniformly.

#### **Why JWT?**

JWT was chosen because it enables **stateless authentication**, meaning the server does not need to store session data. This makes the solution:

- **Scalable** – no need for server-side session storage
- **Flexible** works well with APIs and GraphQL
- **Decoupled** – suitable for distributed systems and microservices

#### Alternatives and Trade-offs
- **Session-based authentication** <br /> 
Stores session data on the server (often with cookies).
  - Pros: Easy to invalidate sessions, simpler security model
  - Cons: Requires server-side storage, less scalable
- **OAuth (e.g., Google/Facebook login)** <br /> 
Delegates authentication to third-party providers.
  - Pros: Convenient for users, no password management
  - Cons: More complex to implement, external dependency
- **API keys** <br /> 
Static tokens used to identify clients.
  - Pros: Simple to implement
  - Cons: Less secure, no built-in expiration or user context
- **Refresh tokens (JWT + refresh flow)** <br /> 
Uses short-lived access tokens with long-lived refresh tokens.
  - Pros: Improved security
  - Cons: More complex implementation

### API Design

The API is implemented using **GraphQL** and is structured around the core domain entities: **tracks, albums, artists, and users**. The database schema is relational, and this structure is reflected in the GraphQL schema design.

#### **Schema design**

Each database table corresponds to a GraphQL type:
- **Track** – represents individual songs and contains audio features and metadata
- **Album** – groups tracks and stores album-level information
- **Artist** – contains artist details and metadata such as genres and popularity
- **User** – handles authentication and user data

A many-to-many relationship between tracks and artists is implemented through the `track_artists` join table. This relationship is exposed in the GraphQL schema by allowing a track to have multiple artists and an artist to have multiple tracks.

Queries and mutations are designed with clear separation of concerns:
- **Queries** handle data retrieval (e.g., fetching tracks or a single track by ID)
- **Mutations** handle data modification (e.g., creating, updating, and deleting tracks)
- **Mutations** that modify data require authentication

The schema is modularized by feature. Each domain (e.g., tracks, albums, artists, users) has its own folder containing:
- Type definitions
- Resolvers
- Data loaders

These are then combined into a central `schema.js` and `resolver.js`, which improves maintainability and scalability by keeping concerns separated.

#### **Nested Queries**

Nested queries are implemented using field-level resolvers. Instead of performing large SQL joins upfront, related data is resolved dynamically when requested.

For example:
- A **Track** resolves its associated **Album** via the `album_id` foreign key
- A **Track** resolves its **Artists** through the `track_artists` join table

To avoid performance issues such as the **N+1 query problem**, DataLoader is used to batch and cache database requests. This ensures that multiple nested queries can be resolved efficiently without excessive database calls.

#### **Database Indexing and Performance**

To improve query performance, several indexes are defined on frequently queried fields in the database.

For the tracks table, indexes are created on:
- track_genre
- popularity
- danceability
- energy

These indexes optimize filtering and sorting operations, which are common in queries where users search for tracks based on genre or audio features.

For the **track_artists** join table, indexes are created on:
- track_id
- artist_id

These indexes improve the performance of resolving relationships between tracks and artists, especially in nested GraphQL queries.

By combining indexing with DataLoader, the API minimizes database load and ensures efficient execution of both simple and complex queries.

#### **Pagination with Page Types**
To efficiently handle large datasets, the API uses **Page types** for `tracks`, `albums`, and `artists`. Each Page type includes:
- `total` – the total number of items matching the query
- `limit` – the maximum number of items returned in the current request
- `offset` – the number of items skipped from the beginning of the list
- `items` – an array of the actual data objects (`Track`, `Album`, or `Artist`)

For example, querying `tracks(limit: 10, offset: 20)` returns 10 tracks, starting from the 21st track in the dataset. This approach allows clients to implement pagination efficiently while keeping the API response sizes manageable.

Page types are combined with **filter inputs**, like `TrackFilterInput`, to let clients retrieve only the subset of data they need (e.g., tracks within a specific genre, popularity range, or energy level). This makes the API both flexible and performant, especially when dealing with thousands of tracks or artists.

By using Page types, the GraphQL API can:
- Avoid over-fetching large datasets
- Support infinite scroll or paginated views in clients
- Maintain consistent query patterns across different entities

#### **Single Endpoint Approach**

GraphQL uses a single endpoint `(/graphql)` for all operations, which significantly influences the API design:
- Clients can request exactly the fields they need, reducing over-fetching
- Complex, nested data can be retrieved in a single request
- The API is flexible and adaptable to different client requirements

However, this approach also introduces challenges:
- **Increased complexity** in resolver logic, since queries can vary in structure
- **Caching is less straightforward** compared to REST APIs
- **Security concerns**, such as deeply nested or expensive queries, require additional safeguards

[⬆ Back to top](#table-of-contents)

## Error Handling

The API uses **GraphQL errors** to provide consistent, structured feedback to clients. All service methods validate input and handle exceptional cases by throwing specific error types provided by `apollo-server-errors`. These include:
- **UserInputError** – used when the client sends invalid input, such as missing required fields, invalid limits or offsets, or invalid filter values.
- **AuthenticationError** – used when authentication fails, e.g., incorrect login credentials or missing JWT.
- **ApolloError** – used for unexpected or internal server errors, such as database failures or failed queries.

Additionally, the utility function `requireRow` ensures that queries returning no rows trigger an `ApolloError` with a clear `NOT_FOUND` code, e.g., when requesting a track, album, or artist that does not exist. This guarantees that clients receive meaningful feedback instead of silently returning `null` or incomplete data.

#### **Error Consistency**
All errors follow a predictable format:
```
{
  "errors": [
    {
      "message": "Resource not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```
- The `message` field describes the error in plain language.
- The `extensions.code` field provides a machine-readable error code for programmatic handling.
This consistent structure makes it easy for clients to handle errors and display user-friendly messages. For example:
- **Validation errors** (like missing fields or invalid input) return `UserInputError` with a descriptive message.
- **Authentication errors** return `AuthenticationError` if the user is unauthorized.
- **Internal errors** or unexpected failures return `ApolloError` with a code like `INTERNAL_ERROR`.

By using these patterns, the API ensures both **clarity for developers** and **robust handling of edge cases**, reducing the risk of silent failures or inconsistent responses.

[⬆ Back to top](#table-of-contents)

## Core Technologies Used

The API is built using a combination of modern Node.js-based technologies, focusing on scalability, maintainability, and clear separation of concerns.
- **Node.js & Express** <br /> 
The backend is built with Node.js using Express as the HTTP server. Express is used to handle middleware, routing, and integration with the GraphQL server.
- **GraphQL (@apollo/server)** <br /> 
Apollo Server is used to implement the GraphQL API. It provides a flexible query system, schema management, and built-in error handling. GraphQL enables clients to request only the data they need and supports nested queries efficiently.
- **PostgreSQL (pg)** <br /> 
A relational PostgreSQL database is used to store tracks, albums, artists, and users. The pg library is used for database communication with connection pooling.
- **DataLoader** <br /> 
DataLoader is used to batch and cache database queries, solving the N+1 problem in nested GraphQL queries and improving performance.
- **JWT (jsonwebtoken)** <br /> 
JSON Web Tokens are used for stateless authentication. Tokens are signed and verified to protect mutations and identify users.
- **bcrypt** <br /> 
Passwords are securely hashed using bcrypt with salt rounds before being stored in the database.
- **dotenv** <br /> 
Environment variables (such as database credentials and JWT secret) are managed using dotenv to keep sensitive data outside the codebase.
- **CSV Parser (csv-parser)** <br /> 
Used to parse the Spotify dataset from CSV files during the seeding process.
- **UUID** <br /> 
UUIDs are used for uniquely identifying resources where needed.
- **CORS** <br /> 
Enables cross-origin requests so that the API can be accessed from different clients.
- **Apollo Server Errors** <br /> 
Provides structured error handling with consistent error types such as UserInputError, AuthenticationError, and ApolloError.
- **Helmet**  <br />
Used to secure HTTP headers and protect against common web vulnerabilities.
- **Express Rate Limit**  <br/>
Protects the API from abuse by limiting the number of requests per IP.
- **Development Tools (ESLint & Nodemon)**
  - ESLint ensures consistent code quality and style.
  - Nodemon improves development workflow by automatically restarting the server on file changes.

[⬆ Back to top](#table-of-contents)

## Reflection

One of the main challenges in this project was maintaining clean and well-structured code throughout the development process. Since the project grew quite large, it required careful planning of the architecture and separation of concerns to keep everything maintainable and consistent.

Another challenge, but also one of the most rewarding parts, was learning GraphQL. I had not worked with it before, but I found it very suitable for this type of API, especially when handling nested data and flexible queries.

Working with PostgreSQL was also a positive experience. Having recently studied database technology, SQL felt familiar, and using a relational database made it easier to model the data properly. In particular, join tables were very useful for representing relationships in the dataset, such as between tracks and artists.

Security was another important and challenging aspect. While I had previous experience with security concepts, I had not applied them to this extent in a larger project. Implementing validation, authentication, and protection mechanisms such as rate limiting and secure headers was both challenging and highly educational, and it is something I will definitely carry forward into future projects.

If I were to do something differently, I would integrate a stronger security mindset from the beginning. Initially, I only implemented basic measures such as password hashing, and added more advanced protections later in the process. Because of this, there is a risk that some aspects may have been overlooked. In future projects, I will prioritize security earlier in the development lifecycle.

## Acknowledgements

I would like to thank our assignment instructor, Oxana, for her valuable guidance, resources, and continuous support throughout the assignment. Her feedback, as well as the tips and discussions shared on Slack, have been very helpful and inspiring.

I would also like to thank my classmates in WP24 for their support and collaboration, especially through discussions on Discord where we could exchange ideas and help each other throughout the project.

[⬆ Back to top](#table-of-contents)

## Requirements

See [all requirements in Issues](../../issues/). Close issues as you implement them. Create additional issues for any custom functionality. See [TESTING.md](TESTING.md) for detailed testing requirements.

### Functional Requirements — Common

| Requirement | Issue | Status |
|---|---|---|
| Data acquisition — choose and document a dataset (1000+ data points) | [#1](../../issues/1) | ✅ |
| Full CRUD for primary resource, read-only for secondary resources | [#2](../../issues/2) | ✅ |
| JWT authentication for write operations | [#3](../../issues/3) | ✅ |
| Error handling (400, 401, 404 with consistent format) | [#4](../../issues/4) | ✅ |
| Filtering and pagination for large result sets | [#17](../../issues/17) | ✅ |

### Functional Requirements — GraphQL

| Requirement | Issue | Status |
|---|---|---|
| Queries and mutations via single `/graphql` endpoint | [#14](../../issues/14) | ✅ |
| At least one nested query | [#15](../../issues/15) | ✅|
| GraphQL Playground available | [#16](../../issues/16) | ✅ |

### Non-Functional Requirements

| Requirement | Issue | Status |
|---|---|---|
| API documentation (Swagger/OpenAPI or Postman) | [#6](../../issues/6) | ✅ |
| Automated Postman tests (20+ test cases, success + failure) | [#7](../../issues/7) | ✅ |
| CI/CD pipeline running tests on every commit/MR | [#8](../../issues/8) | ✅ |
| Seed script for sample data | [#5](../../issues/5) | ✅ |
| Code quality (consistent standard, modular, documented) | [#10](../../issues/10) | ✅ |
| Deployed and publicly accessible | [#9](../../issues/9) | ✅ |
| Peer review reflection submitted on merge request | [#11](../../issues/11) | ✅ |

[⬆ Back to top](#table-of-contents)