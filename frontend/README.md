# Task Tracker

A full-stack Kanban task tracker: register, log in, and manage your own tasks on a drag-and-drop board.

![Board](docs/board.png)

## Features

- JWT authentication: register and log in, passwords hashed with BCrypt
- Every user sees only their own tasks (ownership is enforced on the server)
- Kanban board with three columns (To do, In progress, Done) and drag-and-drop between them
- Create and delete tasks, with server-side validation
- Database schema managed by Flyway migrations
- Whole stack starts with a single `docker compose up`

![Login](docs/login.png)

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Flyway |
| Database | PostgreSQL 17 |
| Frontend | React, TypeScript, Vite, dnd-kit |
| Infrastructure | Docker, Docker Compose, nginx |

## Run it

Requirements: Docker Desktop.

```bash
git clone https://github.com/ProgrammingIsMine/task-tracker.git
cd task-tracker
docker compose up --build
```

Then open http://localhost:5173 and register a new account.

The API is available at http://localhost:8081.

## API

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT | no |
| POST | `/api/auth/login` | Log in, returns a JWT | no |
| GET | `/api/tasks` | List the current user's tasks | yes |
| POST | `/api/tasks` | Create a task | yes |
| PATCH | `/api/tasks/{id}` | Change a task's status | yes |
| DELETE | `/api/tasks/{id}` | Delete a task | yes |

Authenticated requests send the header `Authorization: Bearer <token>`.

## Local development

```bash
docker compose up -d db

cd backend/backend
./mvnw spring-boot:run

cd frontend
npm install
npm run dev
```

## Roadmap

- Integration tests (JUnit, Testcontainers)
- CI with GitHub Actions
- Task editing, descriptions and ordering inside a column
- Deployment