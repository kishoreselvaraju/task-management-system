# 🚀 Secure Task Management System

A full-stack **role-based access control (RBAC) Task Management System** built with **Nx monorepo**, **NestJS (backend)**, and **Angular (frontend)**.  

This project demonstrates **multi-role access**, **JWT authentication**, **audit logging**, and **task categorization**.

---

## 🔧 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/kishoreselvaraju/task-management-system
cd secure-task-mgmt

2. Install dependencies
npm install

3. Environment Variables

Create .env files in project root or directly in apps/api/.

apps/api/.env

JWT_SECRET=dev-secret
DB_TYPE=sqlite
DB_NAME=db.sqlite
DB_SYNC=true


JWT_SECRET: secret key for signing JWTs.

DB_TYPE: database type (default: sqlite).

DB_NAME: database filename.

DB_SYNC: auto-sync entities (dev only).

4. Run backend (NestJS API)
npx nx serve api


Backend runs on http://localhost:3000/api

5. Run frontend (Angular dashboard)
npx nx serve dashboard


Frontend runs on http://localhost:4200

🏗 Architecture Overview

This project uses Nx Monorepo to manage both frontend and backend in one workspace.

secure-task-mgmt/
├── apps/
│   ├── api/         # NestJS backend (Auth, Tasks, Audit APIs)
│   └── dashboard/   # Angular frontend (Login, Tasks, Audit UI)
├── libs/            # Shared libraries (if needed in future)
├── nx.json
├── package.json
└── tsconfig.base.json

Why Nx?

Unified tooling for frontend + backend.

Shared libraries/modules across apps.

Built-in Jest, ESLint, and CI/CD support.

 Data Model
Entities

User

id, email, password, role, organizationId

Task

id, title, description, status, category, ownerId, organizationId

AuditLog

id, userId, action, resource, createdAt

Organization

id, name

ERD
erDiagram
    User ||--o{ Task : "owns"
    User ||--o{ AuditLog : "triggers"
    Organization ||--o{ User : "has"
    Organization ||--o{ Task : "manages"
    Task ||--o{ AuditLog : "is logged in"

🔐 Access Control (RBAC)
Roles

Admin

Full access to tasks, users, audit logs.

Owner

Manage tasks in their organization, view audit logs.

Viewer

Read-only access to tasks.

JWT Auth

Login returns a JWT with user id, email, role, organizationId.

Each request validates token via Authorization: Bearer <token>.

Guards enforce role-based access at controller level.

Example JWT payload:

{
  "sub": "user-123",
  "email": "admin@acme.com",
  "role": "ADMIN",
  "organizationId": "org-1",
  "iat": 1695400000,
  "exp": 1695486400
}

📡 API Documentation
Auth
POST /api/auth/login
Request:
{ "email": "admin@acme.com", "password": "password123" }

Response:
{ "access_token": "<JWT>" }

Tasks
GET /api/tasks

Returns tasks for current user’s organization.

Response:
[
  { "id": "1", "title": "Setup CI/CD", "category": "Work", "status": "NEW" }
]

POST /api/tasks

Create a new task.

Request:
{ "title": "Finish Docs", "category": "Work" }

Response:
{ "id": "2", "title": "Finish Docs", "status": "NEW" }

Audit Logs
GET /api/audit-log

Admin/Owner only. Returns action history.

Response:
[
  {
    "id": 1,
    "userId": "123",
    "action": "create_task",
    "resource": "task:1",
    "createdAt": "2025-09-21T10:00:00Z"
  }
]