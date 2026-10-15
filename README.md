# Employee Leave Management

Spring Boot REST API with JWT security and role-based access (Employee, Manager),
plus a React frontend. Assignment for Ikaansh Edutech Private Limited.

**Stack:** Java 17+, Spring Boot 3, Spring Security + JWT, Spring Data JPA, PostgreSQL, React 18 (Vite)

## Prerequisites
Java 17+, Maven (or the included `mvnw`), Node.js 18+, PostgreSQL

## 1. Database
1. Create a database: `CREATE DATABASE employee_leave_db;`
2. Run `database.sql` (creates the tables and the two test users).
3. In `leave-management/src/main/resources/application.properties`, set
   `spring.datasource.username` and `spring.datasource.password` to your PostgreSQL login.

## 2. Backend (http://localhost:8080)
    cd leave-management
    mvnw spring-boot:run

Swagger UI: http://localhost:8080/swagger-ui/index.html

## 3. Frontend (http://localhost:5173)
    cd leave-frontend
    npm install
    npm run dev

Vite proxies `/api` to port 8080, so there are no CORS problems.
If the backend uses another port, change `target` in `vite.config.js`.

## Test users (password: password123)
| Username | Role |
|---|---|
| employee1 | Employee |
| manager1 | Manager |

## API
| Method | Endpoint | Role |
|---|---|---|
| POST | /api/auth/login | Public |
| POST | /api/leaves | Employee |
| GET | /api/leaves/my | Employee |
| GET | /api/leaves?page=0&size=10 | Manager |
| PUT | /api/leaves/{id}/approve | Manager |
| PUT | /api/leaves/{id}/reject | Manager |

## Project structure
`controller` (HTTP layer), `service` (business logic), `repository` (JPA),
`entity` (data model), `security` (JWT filter, config), `dto`.

## Implemented
- JWT login, role-based authorization
- Create, approve and reject leave requests
- Pagination on the manager list
- React UI for both roles

## Not implemented / future work
(list honestly what you skipped, for example tests)
