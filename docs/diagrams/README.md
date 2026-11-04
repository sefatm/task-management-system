# Architecture & UML Design Diagrams

This directory contains the UML and Database design diagrams required by Section 8 of `INTERVIEW DEMO PROJECT.pdf`:

---

### 1. Available Diagrams

#### 1. Use Case Diagram
* **Vector Image (SVG):** [`use-case-diagram.svg`](./use-case-diagram.svg)
* **Mermaid Source:** [`use-case-diagram.md`](./use-case-diagram.md)
* **Scope Covered:** 
  - Admin (User management, Global task control, PDF Audit report, Profile & Security)
  - Manager (Team task assignment, Team progress tracking, Department PDF audit)
  - Employee (My Tasks board, Status transition PENDING -> IN_PROGRESS -> DONE, In-app Notifications)

#### 2. Class Diagram (Backend Architecture)
* **Vector Image (SVG):** [`class-diagram.svg`](./class-diagram.svg)
* **Mermaid Source:** [`class-diagram.md`](./class-diagram.md)
* **Scope Covered:** 
  - Controllers (`AuthController`, `UserController`, `TaskController`, `DashboardController`, `ReportController`, `ProfileController`)
  - Services (`AuthService`, `UserService`, `TaskService`, `DashboardService`, `ReportService`, `CurrentUserService`)
  - Entities & Enums (`User`, `Task`, `Role`, `TaskStatus`, `Priority`)
  - Repositories & Security (`TaskRepository`, `UserRepository`, `JwtAuthFilter`, `JwtUtil`, `GlobalExceptionHandler`)

#### 3. Entity Relationship (ER) Diagram
* **Vector Image (SVG):** [`er-diagram.svg`](./er-diagram.svg)
* **Mermaid Source:** [`er-diagram.md`](./er-diagram.md)
* **Scope Covered:** 
  - `USERS` table (id PK, full_name, email UK, password, role, manager_id FK, created_at, active)
  - `TASKS` table (id PK, title, description, status, priority, deadline, assigned_to FK, assigned_by FK, created_at, updated_at)
  - Self-referential relationship (`USERS 1 -> N USERS` for Manager-Employee hierarchy)
  - Task delegation relationships (`USERS 1 -> N TASKS` for assigned_to and assigned_by)

---

### 2. How to Open & Edit in Draw.io (diagrams.net)

You can easily open and customize these diagrams in [app.diagrams.net (Draw.io)](https://app.diagrams.net):

* **Method 1 (Instant Drag & Drop):**
  1. Open [https://app.diagrams.net](https://app.diagrams.net) in your browser.
  2. Drag and drop any `.svg` file (`use-case-diagram.svg`, `class-diagram.svg`, or `er-diagram.svg`) directly into the canvas.

* **Method 2 (Using Mermaid Code):**
  1. In draw.io, click top menu: **Arrange** $\rightarrow$ **Insert** $\rightarrow$ **Advanced** $\rightarrow$ **Mermaid**.
  2. Copy and paste the code from [`use-case-diagram.md`](./use-case-diagram.md), [`class-diagram.md`](./class-diagram.md), or [`er-diagram.md`](./er-diagram.md).
  3. Click **Insert** to automatically generate the diagram.
