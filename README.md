# TaskFlow — Mini Employee & Task Management System

Role-based enterprise full-stack web application (ADMIN / MANAGER / EMPLOYEE) built according to the interview specification.

```
task-management-system/
├── backend/          Spring Boot 3.2 REST API (Java 17, Spring Security + JWT, JPA, MySQL 8)
├── frontend/         Angular 13 SPA (Bootstrap 5, route guards, HTTP interceptor, RxJS)
├── database/         MySQL 8 schema + seed data (schema.sql)
├── docs/             UML diagrams (SVG + Mermaid), Postman collection
├── docker-compose.yml Local MySQL 8 database service (auto-loads database/schema.sql)
└── README.md         Project documentation & setup guide
```

---

## 🌐 Live URLs (Deliverable 2)
- **Frontend Application (Netlify):** [https://task-management-fifo.netlify.app](https://task-management-fifo.netlify.app)
- **Backend REST API (Render):** [https://taskflow-backend-btqs.onrender.com](https://taskflow-backend-btqs.onrender.com)
- **Database (Railway MySQL):** `tokaido.proxy.rlwy.net:33938` (Database: `railway` / `taskdb`)

---

## 1. Project Overview
TaskFlow is a robust 3-tier enterprise role-based task management system. It features:
- **Role-Based Access Control (RBAC):** Strict method-level enforcement on backend via Spring Security `@PreAuthorize` across **ADMIN**, **MANAGER**, and **EMPLOYEE** roles.
- **Task Lifecycle & State Machine:** Strictly enforced forward-only task transitions (`PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
- **Real-Time Notification System:** Live topbar bell with animated pulsing unread counter; automatic alerts when tasks are assigned to employees or completed by team members.
- **Executive Audit Reporting:** Interactive 9-column live audit table with status/priority filtering, pagination, assign date, deadline, and complete date, plus one-click streaming A4 landscape vector PDF export.
- **Security & Profile Settings:** Stateless JWT authentication, BCrypt password hashing (12 rounds), live identity summary, custom avatar photo uploads, and secure password updates.

---

## 2. Tech Stack
| Layer | Technologies & Libraries |
|-------|--------------------------|
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security 6 (Stateless JWT, BCrypt), Spring Data JPA, Hibernate, Jakarta Bean Validation, OpenPDF, Maven |
| **Frontend** | Angular 13, TypeScript, Bootstrap 5, Bootstrap Icons, RxJS (BehaviorSubject), HTML5, CSS3 |
| **Database** | MySQL 8.0 (InnoDB engine, foreign keys, self-referential hierarchy, soft-delete flags) |
| **Deployment** | Netlify (Frontend static SPA), Render / Railway (Backend container), Railway / PlanetScale (Cloud MySQL) |
| **Documentation** | UML Diagrams (Use Case, Class, ER in SVG & Mermaid), Postman Collection v2.1 |

---

## 3. Local Setup Instructions

### Prerequisites
- Java Development Kit (JDK 17 or higher)
- Node.js (v14.x or v16.x LTS) & npm
- MySQL 8.0 server (or Docker)

### Step 1: Database Setup
Using Docker (recommended):
```bash
docker compose up -d db        # Starts MySQL 8 on localhost:3306 and loads database/schema.sql automatically
```
Or with local MySQL server:
```bash
mysql -u root -p < database/schema.sql
```

### Step 2: Backend Setup (Spring Boot)
```bash
cd backend
export DB_PASSWORD=root JWT_SECRET=super-secret-jwt-key-for-task-management-system-2026
mvn spring-boot:run            # Starts REST API on http://localhost:8080
mvn test                       # Runs JUnit 5 & Mockito test suite
```
*(On Windows PowerShell, use `.\start-backend.ps1` or set `$env:DB_PASSWORD="root"`)*

### Step 3: Frontend Setup (Angular)
```bash
cd frontend
npm install --legacy-peer-deps
npm start                      # Starts Angular dev server on http://localhost:4200
```
Open your browser and navigate to `http://localhost:4200`.

---

## 4. Environment Variables List (Backend)
All sensitive credentials and environment configs are parameterized with zero hardcoding:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `DB_HOST` | `localhost` | MySQL host address |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `taskdb` | MySQL database name |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | *(required)* | Database password |
| `DB_SSL` | `false` | Enable SSL (`true` for cloud MySQL instances like Railway/Aiven) |
| `JWT_SECRET` | *(required)* | HMAC-SHA256 secret key (**min 32 characters**) |
| `JWT_EXPIRATION_MS` | `3600000` | Token expiration time (1 hour = 3,600,000 ms) |
| `CORS_ORIGINS` | `http://localhost:4200` | Comma-separated allowed frontend origins |
| `PORT` | `8080` | Backend HTTP server port |

---

## 5. Sample Login Credentials (Seed Data)
The system comes pre-seeded with sample users for all 3 roles (passwords hashed via BCrypt in `database/schema.sql`):

| Role | Email Address | Password | Permissions & Scope |
|------|---------------|----------|---------------------|
| **ADMIN** | `admin@demo.com` | `Admin@123` | Full system access, User CRUD, company-wide tasks & audit PDF |
| **MANAGER** | `manager@demo.com` | `Manager@123` | Assign tasks to own team, track team progress, team audit PDF |
| **EMPLOYEE** | `emp1@demo.com` | `Emp@123` | View assigned tasks, forward-only status updates, notifications |
| **EMPLOYEE** | `emp2@demo.com` | `Emp@123` | Second employee under Mia Manager for multi-user testing |

*(Quick 1-Click login buttons for each role are available at the bottom of the sign-in page!)*

---

## 6. API Documentation Table
All API endpoints except `/api/auth/login` require the `Authorization: Bearer <token>` header. Method-level role authorization is enforced with `@PreAuthorize` (wrong role = **403 Forbidden**, invalid/expired token = **401 Unauthorized**).

| HTTP Method | Endpoint URL | Required Role | Functionality & Constraints |
|:-----------:|:-------------|:-------------:|:----------------------------|
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns `{ token, role, name }` |
| `POST` | `/api/auth/register` | `ADMIN` | Registers a new user directly into the system |
| `GET` | `/api/users?q=&page=&size=` | `ADMIN` | Paginated user list with full-text name & email search |
| `GET` | `/api/users/{id}` | `ADMIN` | Retrieves specific user profile details |
| `POST` | `/api/users` | `ADMIN` | Creates new user; hashes password with BCrypt (12 rounds) |
| `PUT` | `/api/users/{id}` | `ADMIN` | Updates user details; leaves password intact if blank |
| `DELETE` | `/api/users/{id}` | `ADMIN` | Soft delete (`active=false`); preserves task FK history |
| `POST` | `/api/tasks` | `MANAGER`, `ADMIN` | Creates task; manager can only assign to own team members |
| `GET` | `/api/tasks` | Authenticated | Role-filtered task directory (Admin=all, Manager=team, Employee=self) |
| `GET` | `/api/tasks/assignees` | `MANAGER`, `ADMIN` | Lists eligible employees based on caller's management scope |
| `GET` | `/api/tasks/{id}` | Authenticated | Fetches task by ID; checks row-level caller authorization |
| `PUT` | `/api/tasks/{id}/status` | `EMPLOYEE` | Forward-only status updates (`PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`) |
| `PUT` | `/api/tasks/{id}` | `MANAGER`, `ADMIN` | Updates task metadata; manager restricted to own assigned tasks |
| `DELETE` | `/api/tasks/{id}` | `ADMIN` | Permanently deletes a task |
| `GET` | `/api/dashboard/stats` | Authenticated | Role-scoped KPI metrics and live status counts |
| `GET` | `/api/reports/tasks/pdf` | `ADMIN`, `MANAGER` | Streams binary A4 landscape audit PDF report via OpenPDF |
| `GET` | `/api/profile` | Authenticated | Retrieves caller's profile metadata |
| `PUT` | `/api/profile` | Authenticated | Updates full name of logged-in user |
| `PUT` | `/api/profile/password` | Authenticated | Changes password after BCrypt verification of current password |

*Postman Collection is located at [`docs/postman/TaskManagement.postman_collection.json`](docs/postman/TaskManagement.postman_collection.json).*

---

## 7. Architecture & Diagrams
Located in [`docs/diagrams/`](docs/diagrams/):
- **Use Case Diagram**: [use-case-diagram.svg](docs/diagrams/use-case-diagram.svg) | [Mermaid](docs/diagrams/use-case-diagram.md)
- **Class Diagram**: [class-diagram.svg](docs/diagrams/class-diagram.svg) | [Mermaid](docs/diagrams/class-diagram.md)
- **ER Diagram**: [er-diagram.svg](docs/diagrams/er-diagram.svg) | [Mermaid](docs/diagrams/er-diagram.md)
- **Draw.io Guide**: [README.md](docs/diagrams/README.md) (Instructions to drag-and-drop or import into Draw.io)
