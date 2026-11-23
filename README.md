# MentorLagbe - Tutor-Student Connection Platform

## Live Links
- **Client (Frontend):** https://mentorlagbe-tuitionplatform.vercel.app/
- **Server (Backend):** https://mentorlagbe-server-1.vercel.app/

## Assignment 9 Category 001
This project implements all requirements of MentorLagbe Assignment 9 Category 001, including:
- Full-stack Next.js application with App Router
- JWT-based authentication with role-based authorization (student, tutor)
- Stripe payment integration ($15 tutor Pro plan, $10 student Pro plan)
- Tuition search, filter, and pagination
- Student, Tutor, and Admin dashboards with role-specific features
- Application management (create, view, cancel, accept/reject)
- MongoDB database with proper indexes
- Seed data setup for demo accounts

## Technology Stack
- **Framework:** Next.js 16.4.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn-ui, class-variance-authority, cn
- **UI Components:** lucide-react, sonner (toast notifications)
- **Backend:** Express.js 5, MongoDB (v7.9.0)
- **Authentication:** better-auth with MongoDB adapter, JWT via jose
- **Payments:** Stripe ^23.1.0
- **HTTP Client:** native fetch with custom apiRequest utility

## Implemented Features

### Authentication & Authorization
- Email/password sign in via better-auth with MongoDB adapter
- Role-based access: `student` and `tutor` (admin routes protected by `verifyAdmin`)
- Named middlewares: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`
- `authorizeRole(...roles)` middleware for granular route protection
- JWT verification with remote JWKS from `BETTER_AUTH_URL`
- User profile management (getMyProfile, updateMyProfile)

### Student Workflow
- Browse and search tuition listings (public, no login required)
- Filter tuitions by subject, class level, mode (online/offline), location
- Pagination support for tuition listings
- Apply for tuition submissions (create application)
- Cancel pending applications
- View own applications from dashboard
- Student dashboard statistics (stats)
- Stripe checkout: $10/month Pro plan
- Toast notifications across all user workflows

### Tutor Workflow
- Post tuition listings (subject, location, schedule, monthly fee)
- View own tuition listings from dashboard
- View and manage applications for own tuitions (accept/reject)
- Tutor dashboard statistics (stats)
- Stripe checkout: $15/month Pro plan
- Priority listing in search & category filters
- Golden PRO verification badge

### Admin Workflow
- View all tuition listings and applications
- Approject or reject tuition listings
- Update user roles and account status
- View all payment transactions
- Admin dashboard statistics (stats)

### Tuition Search & Filter (Public)
- Search tuitions by subject, class level, mode, location
- Server-side pagination
- Retrieve approved+active tuitions only
- Public API: GET /api/tuitions?status=approved&isActive=true

### Toast Notifications
- Notification batches across sign-in, sign-up, my-tuitions, applicants, post-tuition, [id] page, and Navbar
- Sonner toast component for all user workflows

## NPM Packages
### Production Dependencies
- @base-ui/react ^1.9.0
- @better-auth/mongo-adapter ^1.7.25
- better-auth ^1.7.25
- class-variance-authority ^0.7.1
- cn ^0.5.2
- lucide-react ^1.75.0
- mongodb ^7.9.0
- next 16.4.6
- next-themes ^0.4.6
- react 19.3.0
- react-dom 19.3.0
- shadcn-ui
- sonner ^2.0.8
- tw-animate-css ^1.4.0

### Development Dependencies
- @tailwindcss/turbopack 4.3.3
- @types/node ^20
- @types/react ^19
- @types/react-dom ^19
- eslint ^9
- eslint-config-next 16.4.6
- tailwindcss 4.3.3
- typescript ^5

## Installation & Local Development

### Prerequisites
- Node.js 26.x (LTS)
- MongoDB Atlas or local MongoDB instance

### Client Setup
```bash
cd client
cp .env.local.example .env.local  # copy env template
# Set required env vars (see below)
npm install
npm run dev  # runs on http://localhost:3000
```

### Server Setup
```bash
cd server
cp .env .env.local  # or use vercel env pull
# Set required env vars (see below)
npm install
npm run dev  # runs on http://localhost:5000 (or PORT env var)
```

### Required Environment Variable NAMES
- `NEXT_PUBLIC_API_URL` - API base URL (defaults to localhost:5000)
- `BETTER_AUTH_URL` - Better Auth base URL for JWKS verification
- `BETTER_AUTH_SECRET` - Better Auth session secret
- `MONGODB_URI` - MongoDB connection string (do not document values)
- `DB_NAME` - Database name (do not document values)
- `CLIENT_URL` - Frontend URL for callback URLs
- `PORT` - Server port (default: 5000)
- `STRIPE_SECRET_KEY` - Stripe secret key (do not document values)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (do not document values)

### Backend Connection
The server connects to MongoDB using `MONGODB_URI` and `DB_NAME` environment variables. The database collections are:
- `users` - authenticated user accounts with role and plan fields
- `tuitions` - tuition listings with status, isActive, and seedKey fields
- `applications` - student application records (unique index on tuitionId + studentId)
- `payments` - Stripe transaction records (unique index on sessionId)

The server startup order is: `connectDB()` → `createIndexes()` → route mounting → `app.listen(PORT)`.

## Repository
- **Client:** https://github.com/hridoycoders/mentorlagbe-client.git
- **Server:** https://github.com/hridoycoders/mentorlagbe-server.git

## Git Commits
- Client: 40 commits on main (origin/main synced)
- Server: 29 commits on main (origin/main synced)