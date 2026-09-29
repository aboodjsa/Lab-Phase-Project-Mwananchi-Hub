# Service Mwananchi Hub: Local Service Booking Platform

A full-stack MERN platform that connects customers with trusted local service professionals (plumbers, electricians, cleaners, painters and more) through a simple, transparent booking experience.

![MERN](https://img.shields.io/badge/stack-MERN-14532d) ![Auth](https://img.shields.io/badge/auth-JWT-f2b632) ![Deploy](https://img.shields.io/badge/deploy-Vercel-black) 
## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Project Objectives](#project-objectives)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [System Architecture](#system-architecture)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Security](#security)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)
11. [Project Scope and Limitations](#project-scope-and-limitations)
12. [Folder Structure](#folder-structure)
13. [Installation and Setup](#installation-and-setup)
14. [Environment Variables](#environment-variables)
15. [Demo Accounts](#demo-accounts)
16. [Usage Guide](#usage-guide)
17. [Troubleshooting](#troubleshooting)
18. [Future Enhancements](#future-enhancements)
19. [Timeline](#timeline)
20. [License](#license)

## Problem Statement
Finding a reliable local service provider is difficult. Customers rarely know who is available, how experienced they are, or what they charge, so they rely on word of mouth and guesswork. Skilled independent workers, in turn, have no affordable way to present their work and reach new customers. This leads to:

- Time wasted searching and comparing providers
- Uncertainty about quality, price and trustworthiness
- Unorganised job requests handled over calls and messages
- Limited visibility and growth for local professionals

Service Mwananchi Hub solves this by providing one platform where customers can see who they are hiring (photo, experience, rate, reviews), request a service, and track it to completion, while providers manage their profile and jobs from a dashboard and administrators keep the community safe.

## Project Objectives
- Build a multi-role platform with Customer, Provider and Admin accounts
- Let customers search, filter and compare providers, then book a service
- Let providers manage a public profile and process booking requests
- Track every booking through a clear status lifecycle with in-app notifications
- Build trust through photos, ratings and reviews from real completed jobs
- Give administrators oversight of users, categories and bookings
- Implement secure authentication, authorization and a responsive interface

## Features
### Customer
- Register, log in and log out securely
- Search providers by name or skill; filter by category, city and minimum rating; sort by rating, price or experience
- View provider profiles with photo, headline, experience, rate and reviews
- Send booking requests (job description, address, date and time)
- Dashboard with booking statistics, status tabs, cancel and delete options
- Leave a 1 to 5 star review after a completed job
- In-app notifications for every booking update

### Provider
- Create and edit a public profile: service category, bio, headline, photo, experience, hourly rate, city
- Receive booking requests and move them through accepted, in-progress and completed (or rejected)
- Dashboard with job statistics and status tabs
- Notifications for new requests and new reviews

### Administrator
- Platform statistics: users, providers, bookings, reviews
- Bookings-by-status chart
- Manage users (delete), bookings (delete) and service categories (add, delete)

### Platform
- Landing page with hero and quick search form, services grid, how-it-works and top-rated providers
- About page, header and footer navigation
- Role-based route protection on both frontend and API
- Fully responsive layout for mobile and desktop

## Screenshots
| Home | Find a pro |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Providers](docs/screenshots/providers.png) |

| Customer dashboard | Admin dashboard |
|---|---|
| ![Customer](docs/screenshots/customer-dashboard.png) | ![Admin](docs/screenshots/admin-dashboard.png) |

**Live demo:** https://your-client.vercel.app
## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 with Vite, React Router |
| Styling | Custom CSS (responsive, CSS variables) |
| State | React Context API (authentication) |
| HTTP client | Axios with request and response interceptors |
| Backend | Node.js and Express 4 |
| Database | MongoDB Atlas (free M0 tier) with Mongoose |
| Auth | JWT and bcryptjs |
| Hardening | helmet, express-rate-limit, CORS allow-list |
| Deployment | Vercel (client and serverless API), GitHub |

## System Architecture
```mermaid
flowchart LR
  subgraph Client[React SPA]
    P[Public pages] --- C[Customer dashboard] --- A[Provider and Admin dashboards]
  end
  Client -- "REST/JSON + JWT (Axios)" --> API
  subgraph API[Express API]
    MW[Middleware: helmet, CORS, rate limit, auth, roles] --> R[Routes: auth, services, bookings, misc]
  end
  R --> DB[(MongoDB Atlas via Mongoose)]
```
Key design decisions:
- **Stateless JWT authentication** so the API runs well on serverless hosting
- **Cached database connection** to avoid reconnecting on every serverless invocation
- **Role and ownership checks in middleware and handlers**, never only in the UI
- **References between collections** instead of embedded documents for clean relationships
- **In-app notifications stored in the database**, which work on serverless hosting without WebSockets

## Database Design
```mermaid
erDiagram
  USER ||--o| PROVIDER : "has profile"
  CATEGORY ||--o{ PROVIDER : classifies
  USER ||--o{ BOOKING : requests
  PROVIDER ||--o{ BOOKING : receives
  BOOKING ||--o| REVIEW : "reviewed by"
  PROVIDER ||--o{ REVIEW : "rated by"
  USER ||--o{ NOTIFICATION : receives
```
| Collection | Key fields |
|---|---|
| users | name, email (unique), password (hashed), role (customer, provider, admin), phone, city |
| categories | name (unique), icon, description |
| providers | user (unique ref), category (ref), bio, headline, photo, experienceYears, hourlyRate, city, averageRating, numReviews, isAvailable |
| bookings | customer (ref), provider (ref), description, address, scheduledDate, status |
| reviews | booking (unique ref), customer (ref), provider (ref), rating (1 to 5), comment |
| notifications | user (ref), message, isRead |

Booking status lifecycle: `pending` → `accepted` or `rejected` → `in-progress` → `completed`. A customer may `cancel` while pending or accepted.

Relationships: User to Provider is one-to-one, Provider to Bookings is one-to-many, Customer to Bookings is one-to-many, Booking to Review is one-to-one, Category to Providers is one-to-many.

## API Design
Base path `/api`. 🔒 means a Bearer JWT is required. Errors return `{ "message": "..." }` with an appropriate HTTP status.

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /auth/register | Create account (customer or provider) | Public |
| POST | /auth/login | Log in and receive a token | Public |
| GET | /auth/me | Current user | 🔒 Any |
| PUT | /auth/me | Update name, phone, city | 🔒 Any |
| PUT | /auth/me/password | Change password | 🔒 Any |

### Categories and Providers
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /categories | List categories | Public |
| POST, PUT, DELETE | /categories, /categories/:id | Manage categories | Admin |
| GET | /providers?search&category&city&minRating&sort | Search, filter, sort | Public |
| GET | /providers/:id | Profile with reviews | Public |
| GET | /providers/me | Own profile | 🔒 Provider |
| POST, PUT, DELETE | /providers, /providers/:id | Manage profile | 🔒 Provider (own) or Admin |

### Bookings, Reviews, Notifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /bookings | Request a service | 🔒 Customer |
| GET | /bookings | List bookings (scoped to role) | 🔒 Any |
| PUT | /bookings/:id/status | Change status | 🔒 Provider, Customer (cancel), Admin |
| DELETE | /bookings/:id | Delete booking | 🔒 Owner or Admin |
| POST | /reviews | Review a completed booking | 🔒 Customer |
| GET | /notifications | Latest notifications | 🔒 Any |
| PUT | /notifications/read | Mark all as read | 🔒 Any |

### Administration and Health
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /admin/stats | Platform statistics | 🔒 Admin |
| GET, DELETE | /admin/users, /admin/users/:id | Manage users | 🔒 Admin |
| GET | /health | Service health check | Public |

## Security
| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs (10 salt rounds) |
| Authentication | JWT with 7-day expiry, verified on every protected request |
| Authorization | Role middleware plus ownership checks on bookings and profiles |
| Session hygiene | Client verifies the token on start and clears it on any 401 |
| HTTP headers | helmet |
| Rate limiting | 100 requests per 15 minutes on authentication routes |
| CORS | Allow-list from `CLIENT_URL` (localhost allowed in development) |
| Input validation | Email format, password length, Mongoose schema validation |
| Secrets | Environment variables only; `.env` is git-ignored |
| Error handling | Generic message for server faults; details are logged, not exposed |

## Testing Strategy
Current: a manual end-to-end checklist covering every role and flow.
- Register a customer and a provider; log in and out; wrong password shows an error
- Provider saves a profile; it appears in search with photo and rate
- Customer books; provider receives a notification
- Provider accepts, starts and completes the job; customer is notified at each step
- Customer leaves a review; provider rating updates
- Filters and sorting return correct results
- Customer opening `/admin` is redirected; API returns 403 for the wrong role and 401 without a token
- Admin can delete users, bookings and categories
- Layout works on mobile and desktop

Planned: Jest and Supertest for API routes, React Testing Library for components.

## Deployment Strategy
| Component | Service | Notes |
|---|---|---|
| Frontend | Vercel | Root directory `client`, Vite preset, SPA rewrite in `vercel.json` |
| Backend | Vercel (serverless) | Root directory `server`, entry `api/index.js` |
| Database | MongoDB Atlas | Free M0 cluster, network access set to allow Vercel |
| Source | GitHub | Automatic deploys on push |

Steps:
1. Push the repository to GitHub.
2. Create Vercel project 1 with root directory `server`. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
3. Create Vercel project 2 with root directory `client`. Set `VITE_API_URL=https://<server-url>/api`.
4. Set the server's `CLIENT_URL` to the client URL (no trailing slash) and redeploy the server.
5. In Atlas, Network Access, allow `0.0.0.0/0`.
6. Run `npm run seed` once locally against the Atlas URI.
7. Check `https://<server-url>/api/health`, then test the live site.

## Project Scope and Limitations
Out of scope for this release:
- Online payments
- Image file upload (profile photos are set by URL)
- Email or SMS notifications and real-time push updates
- Provider availability calendar and time-slot conflict checks
- Native mobile apps and multi-language support
- Automated test suite

## Folder Structure
```
mwananchi-hub/
├── client/
│   ├── src/
│   │   ├── pages/        Home, About, Browse, Provider, Auth, Dashboard, Admin
│   │   ├── App.jsx       Routes, header, footer, route guards
│   │   ├── auth.jsx      Auth context (login, register, logout)
│   │   ├── api.js        Axios instance and interceptors
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html, vite.config.js, vercel.json
│   └── package.json
├── server/
│   ├── api/index.js      Vercel serverless entry
│   ├── config/db.js      Cached MongoDB connection
│   ├── middleware/auth.js  protect, allow(roles)
│   ├── models/index.js   User, Category, Provider, Booking, Review, Notification
│   ├── routes/           auth, services, bookings, misc
│   ├── seed.js, server.js, vercel.json
│   └── package.json
├── LICENSE
└── README.md
```

## Installation and Setup
Prerequisites: Node.js 18 or later and a free MongoDB Atlas cluster.
```bash
# Backend
cd server
cp .env.example .env        # then fill in the values
npm install
npm run seed                # creates categories, demo users and providers
npm run dev                 # http://localhost:5000  (check /api/health)

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```
On Windows PowerShell use `copy .env.example .env`.

## Environment Variables
| Variable | Where | Example |
|---|---|---|
| PORT | server | `5000` |
| MONGO_URI | server | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/servicehub?appName=App` |
| JWT_SECRET | server | 128-character random hex |
| CLIENT_URL | server | `http://localhost:5173` (comma-separate multiple origins) |
| VITE_API_URL | client | `http://localhost:5000/api` |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

The database name must come before the `?` in `MONGO_URI`.

## Demo Accounts
Created by `npm run seed`. Change these before any real deployment.
| Role | Email | Password |
|---|---|---|
| Admin | admin@servicehub.com | Admin123! |
| Customer | customer@servicehub.com | Customer123! |
| Provider | omar@servicehub.com | Provider123! |

The other demo providers use the same password (`Provider123!`) with emails such as grace@, peter@, amina@, daniel@, faith@, joseph@ and brian@servicehub.com.

## Usage Guide
**Customer flow**
1. Open the home page, choose a service and city in the hero form, and search.
2. Compare providers by photo, rate, rating and experience; open a profile.
3. Register or log in as a customer, then send a booking request.
4. Track the status in your dashboard; cancel if needed.
5. After the job is completed, leave a review.

**Provider flow**
1. Register as "I offer services" and log in.
2. Complete your public profile in the dashboard (service, headline, photo URL, rate, city).
3. Accept or reject incoming requests, then mark jobs in-progress and completed.

**Admin flow**
1. Log in with the admin account.
2. Review platform statistics and the bookings chart.
3. Manage users, bookings and categories from the tabs.

## Troubleshooting
- **"Cannot reach the server":** the API is not running or `VITE_API_URL` is wrong. Open `http://localhost:5000/api/health`.
- **Demo login fails:** the seed has not run. Run `npm run seed` in `server`.
- **`option servicehub is not supported`:** `MONGO_URI` is malformed; the database name goes before the `?`.
- **Duplicate key error on `slug`:** you are using a database that has another project's collections. Use a fresh database name such as `servicehub`.
- **CORS error in production:** `CLIENT_URL` must match the client URL exactly, without a trailing slash.
- **Server exits with "Missing JWT_SECRET":** add it to `server/.env`.

## Future Enhancements
- Image uploads for provider photos and portfolios
- Online payments (card and mobile money)
- Email and SMS notifications, real-time updates
- Provider availability calendar and time-slot booking
- Provider verification badges and document checks
- Customer profile page and saved favourites
- Map-based search by distance
- Automated tests and CI pipeline
- Swahili and English language support

## Timeline
| Day | Tasks |
|---|---|
| 1 | Project setup, database models, MongoDB Atlas connection |
| 2 | Authentication, JWT, role-based authorization |
| 3 | Provider profiles, categories, listing and creation of bookings |
| 4 | Booking lifecycle, reviews, notifications |
| 5 | Search, filtering and sorting; customer and provider dashboards |
| 6 | Landing page, about page, admin dashboard, responsive polish |
| 7 | Testing, bug fixes, Vercel deployment, documentation |

## License
MIT. See `LICENSE`.
