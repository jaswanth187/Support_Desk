# SupportDesk

SupportDesk is a full-stack customer support and ticket management platform built for Admin, Agent, and Customer users. It provides role-based dashboards, ticket assignment and lifecycle management, comments, ticket history, and secure authentication.

## Live Demo

- Frontend: https://support-desk-flow.vercel.app
- Backend API: https://supportdesk-api-29vu.onrender.com
- API health check: https://supportdesk-api-29vu.onrender.com/api/health
- GitHub: https://github.com/jaswanth187/Support_Desk

## Application Screenshots

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Agent Management

![Agent Management](docs/screenshots/agent-management.png)

### Ticket Management

![Ticket Management](docs/screenshots/ticket-management.png)

### Ticket Details

![Ticket Details](docs/screenshots/ticket-details.png)

## Features

### Authentication and Security

- Registration and login
- JWT access tokens
- HTTP-only refresh cookies
- Access-token refresh and refresh-token rotation
- Secure logout and session revocation
- Role-based protected routes
- Login and registration rate limits
- Production secure cookies and request origin validation

### Admin

- Platform dashboard and support statistics
- View and manage users and agents
- Activate or deactivate agents
- View all tickets
- Assign or unassign agents
- Update ticket status and priority

### Agent

- Agent dashboard
- View assigned tickets
- Update ticket status and priority
- Add ticket comments
- View ticket history

### Customer

- Create support tickets
- View personal tickets
- Track ticket status and priority
- Read and add comments
- View ticket history

### Ticket Management

- Unique ticket numbers
- Categories, priorities, statuses, assignments, comments, and audit history
- Priorities: Low, Medium, High, Urgent
- Statuses: Open, In Progress, Resolved, Closed

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Forms and Validation | React Hook Form, Zod |
| API Client | Axios |
| Charts | Recharts |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | JWT, HTTP-only refresh cookies |
| Testing | Vitest, Testing Library, Supertest |
| Deployment | Vercel (frontend), Render (backend) |

## System Architecture

```mermaid
flowchart TD
    U[Customer / Agent / Admin] --> F[React and TypeScript Frontend]
    F -->|Axios REST requests| A[Express REST API]
    A --> AUTH[Authentication and Authorization]
    A --> VAL[Zod Validation]
    AUTH --> SVC[Service Layer]
    VAL --> SVC
    SVC --> REPO[Repository Layer]
    REPO --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
```

## Project Structure

```text
Support_Desk/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── test/
│       ├── types/
│       └── utils/
├── server/
│   ├── prisma/
│   ├── integration-tests/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlwares/
│   │   ├── respositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   └── tests/
└── README.md
```

## API Overview

All API endpoints are served through the `/api` base path.

| Module | Functionality |
|---|---|
| Authentication | Registration, login, token refresh, logout, profile, and password management |
| Users | Authenticated profile access |
| Agents | Agent creation, listing, retrieval, and activation/deactivation |
| Tickets | Ticket creation, retrieval, assignment, status updates, and priority updates |
| Comments | Ticket comment listing and creation |
| Dashboard | Role-based support statistics and analytics |

Example protected route paths include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/dashboard`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets/:id/comments`
- `PATCH /api/tickets/:id/status`
- `PATCH /api/tickets/:id/priority`
- `GET /api/agents`

### API Health Check

`GET /api/health`

Returns the backend service health status.

> Authentication and authorization are required for protected endpoints. Access is controlled through role-based permissions.

This is an overview, not a substitute for the complete endpoint reference.

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/jaswanth187/Support_Desk.git
cd Support_Desk
```

### 2. Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure the Backend

Create `server/.env` from `server/.env.example` if an example file is available, or use the variables below:

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace_with_a_secret_at_least_32_characters_long
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY_DAYS=7
```

`DIRECT_URL` is optional. The Prisma configuration uses `DIRECT_URL` when it is provided and falls back to `DATABASE_URL`.

Never commit real database credentials or secrets.

### 4. Configure the Frontend

Create `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Set Up the Database

Run the migrations and generate the Prisma client from the `server` directory:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

For local development, migrations can instead be applied with:

```bash
npx prisma migrate dev --config prisma7.config.ts
```

Optional seed scripts:

```bash
npm run db:seed
```

Create a production Admin account with environment-provided credentials:

```bash
# Set SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD first
npm run db:seed:admin
```

### 6. Run the Application

Start the backend:

```bash
cd server
npm run dev
```

In a second terminal, start the frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## Testing

Run backend unit and route tests:

```bash
cd server
npm test
```

Run backend integration tests with an isolated PostgreSQL database:

```bash
cd server
TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE npm run test:integration
```

Run frontend tests, lint, and production build:

```bash
cd client
npm test
npm run lint
npm run build
```

## Production Configuration

- Set `CLIENT_URL` to the exact deployed frontend origin.
- Set `DATABASE_URL` and, if used by the hosting provider, `DIRECT_URL`.
- Set a strong `JWT_ACCESS_SECRET` of at least 32 characters.
- Deploy the frontend with `/api` rewrites configured for the backend.
- Ensure the backend uses HTTPS and proxy settings are correct for IP-based rate limits.
- The refresh cookie requires a secure HTTPS deployment.

The frontend production configuration uses `/api` and its Vercel rewrite forwards API requests to the deployed backend. Local development uses `VITE_API_BASE_URL`.

## Future Enhancements

- Email notifications
- Real-time ticket updates
- File attachments
- Advanced search and filtering
- Reporting and analytics exports
- Shared/Redis-backed rate limiting for horizontally scaled deployments

## Author

**Jaswanth Chunduri**

Full-Stack Developer | React | TypeScript | Node.js | PostgreSQL
