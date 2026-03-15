# LMSPro — Project Documentation

> **Version:** 1.0.0  
> **Last Updated:** March 15, 2026  
> **Stack:** Node.js · Express · Prisma · MySQL (Aiven Cloud) | Next.js 14 · Tailwind CSS · Shadcn/UI · Zustand

---

## Table of Contents

1. [Project Overview](#1-project-overview)  
2. [Architecture](#2-architecture)  
3. [Tech Stack](#3-tech-stack)  
4. [Project Structure](#4-project-structure)  
5. [Database Schema](#5-database-schema)  
6. [Backend API Reference](#6-backend-api-reference)  
7. [Authentication & Authorization](#7-authentication--authorization)  
8. [Frontend Application](#8-frontend-application)  
9. [Key Features](#9-key-features)  
10. [Environment Configuration](#10-environment-configuration)  
11. [Getting Started](#11-getting-started)  
12. [Scripts & Utilities](#12-scripts--utilities)  

---

## 1. Project Overview

LMSPro is a full-stack **Learning Management System** built for online course delivery, inspired by platforms like Udemy. It supports three user roles — **Student**, **Instructor**, and **Admin** — with features including course browsing, enrollment, YouTube-based video playback with anti-cheat progress tracking, and a comprehensive admin dashboard for platform management.

### Core Capabilities

| Capability | Description |
|---|---|
| **Unified Login** | Single login page with tabs for Student and Admin roles |
| **Student Registration** | Self-service sign-up for new learners |
| **Course Catalog** | Public course listing with bestseller badges, ratings, and pricing |
| **Course Player** | Embedded YouTube player with strict progress tracking |
| **Anti-Cheat System** | Prevents video fast-forwarding; enforces 95% watch completion |
| **AI Learning Assistant** | AI-powered chat for course help and personalized suggestions |
| **Admin AI Co-pilot** | Natural language admin commands for platform management |
| **Simulated Payments** | Integrated checkout for course enrollment with history tracking |
| **Admin Dashboard** | Analytics activity feed, trends, and site-wide settings |
| **Role-Based Access** | JWT-secured endpoints with admin-only routes |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                     Next.js 14 (App Router)                     │
│              Tailwind CSS · Shadcn/UI · Framer Motion           │
│                   Zustand (Auth State Mgmt)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP (Axios)
                           │  Bearer Token Auth
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API SERVER                           │
│                Express.js (TypeScript) — Port 8000              │
│                                                                  │
│  Routes:  /api/auth  ·  /api/users  ·  /api/courses            │
│           /api/content  ·  /api/progress  ·  /api/admin/stats   │
│                                                                  │
│  Middleware:  authenticateToken  ·  requireAdmin                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │  Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MySQL DATABASE                                │
│              Aiven Cloud (SSL-enabled)                          │
│                                                                  │
│  Tables:  users · subjects · sections · videos                  │
│           enrollments · video_progress · refresh_tokens          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe server code |
| **Prisma** | ORM for MySQL database access |
| **MySQL (Aiven)** | Cloud-hosted relational database with SSL |
| **Hugging Face** | AI model hosting (Meta-Llama-3 via Inference Endpoints) |
| **bcrypt** | Password hashing (salt rounds: 10) |
| **jsonwebtoken** | JWT token generation & verification |
| **nodemon** | Hot-reload during development |

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe frontend code |
| **Tailwind CSS** | Utility-first CSS styling |
| **Shadcn/UI** | Premium component library (Card, Dialog, Table, etc.) |
| **Framer Motion** | Page transitions and micro-animations |
| **Zustand** | Lightweight auth state management with persistence |
| **Axios** | HTTP client with interceptors for auth |
| **react-youtube** | YouTube embedded player component |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting utilities |

---

## 4. Project Structure

```
LMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (6 models + 1 enum)
│   ├── scripts/
│   │   └── seedAdmin.ts           # Admin user seeding script
│   ├── src/
│   │   ├── index.ts               # Express app entry point (port 8000)
│   │   ├── lib/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts   # JWT auth + admin role guard
│   │   └── routes/
│   │       ├── auth.ts            # Login & Register endpoints
│   │       ├── users.ts           # User profile & admin user management
│   │       ├── courses.ts         # Course CRUD & public listing
│   │       ├── content.ts         # Section & video management (admin)
│   │       ├── progress.ts        # Enrollment & anti-cheat
│   │       ├── ai.ts              # AI chat & assistance endpoints [NEW]
│   │       ├── payments.ts        # Simulated payment processing [NEW]
│   │       ├── settings.ts        # Site configuration management [NEW]
│   │       └── analytics.ts       # Admin dashboard stats & trends
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                       # Environment variables
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx               # Root redirect → /login
    │   │   ├── layout.tsx             # Root layout
    │   │   ├── globals.css            # Global styles & theme tokens
    │   │   ├── login/
    │   │   │   └── page.tsx           # Unified login (Student + Admin tabs)
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx         # Student layout with sidebar
    │   │   │   └── page.tsx           # Course catalog for students
    │   │   ├── course/
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx       # Course landing/detail page
    │   │   │       └── play/
    │   │   │           └── page.tsx   # Video player with progress tracking
    │   │   └── admin/
    │   │       ├── layout.tsx         # Admin layout with sidebar
    │   │       ├── page.tsx           # Admin dashboard (stats overview)
    │   │       ├── courses/
    │   │       │   └── page.tsx       # Course inventory management
    │   │       └── users/
    │   │           └── page.tsx       # Learner database & warnings
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── AuthGuard.tsx      # Client-side route protection
    │   │   ├── layout/
    │   │   │   ├── AdminSidebar.tsx   # Admin navigation sidebar
    │   │   │   └── StudentSidebar.tsx # Student navigation sidebar
    │   │   └── ui/                    # Shadcn/UI components (14 components)
    │   ├── lib/
    │   │   ├── axios.ts              # Axios instance with auth interceptors
    │   │   └── utils.ts              # cn() utility for class merging
    │   └── store/
    │       └── authStore.ts          # Zustand auth store (persisted)
    ├── tailwind.config.ts
    ├── next.config.mjs
    └── package.json
```

---

## 5. Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ enrollments : "enrolls in"
    users ||--o{ subjects : "creates"
    users ||--o{ refresh_tokens : "has"
    users ||--o{ video_progress : "tracks"
    users ||--o{ payments : "makes"
    subjects ||--o{ enrollments : "has"
    subjects ||--o{ sections : "contains"
    subjects ||--o{ payments : "associated with"
    sections ||--o{ videos : "contains"
    videos ||--o{ video_progress : "tracked by"

    users {
        BigInt id PK
        String name
        String email UK
        String password_hash
        Enum role "admin | student | instructor"
        DateTime created_at
    }

    subjects {
        BigInt id PK
        String title
        String slug
        String headline
        String description
        String thumbnail_url
        BigInt created_by FK
        Boolean is_published
        Boolean is_bestseller
        Decimal rating
        Int review_count
        Int enrollment_count
        Decimal price
        DateTime created_at
    }

    sections {
        BigInt id PK
        BigInt subject_id FK
        String title
        Int order_index
        DateTime created_at
    }

    videos {
        BigInt id PK
        BigInt section_id FK
        String title
        String youtube_video_id
        String description
        Int duration_seconds
        Int order_index
        DateTime created_at
    }

    enrollments {
        BigInt id PK
        BigInt user_id FK
        BigInt subject_id FK
        DateTime enrolled_at
    }

    video_progress {
        BigInt id PK
        BigInt user_id FK
        BigInt video_id FK
        Int last_position_seconds
        Boolean is_completed
        DateTime completed_at
        DateTime updated_at
    }

    payments {
        BigInt id PK
        BigInt user_id FK
        BigInt subject_id FK
        Decimal amount
        String transaction_id UK
        String status "completed | pending | failed"
        DateTime created_at
    }

    settings {
        BigInt id PK
        String site_name
        String support_email
        Boolean maintenance_mode
        Boolean allow_new_registrations
        DateTime updated_at
    }

    refresh_tokens {
        BigInt id PK
        BigInt user_id FK
        String token_hash
        DateTime expires_at
        DateTime revoked_at
        DateTime created_at
    }
```

### Key Constraints

- `enrollments` has a **unique compound key** on `(user_id, subject_id)` — prevents duplicate enrollments
- `video_progress` has a **unique compound key** on `(user_id, video_id)` — one progress record per user-video pair
- `users.email` is **unique** across the platform
- All foreign keys use **CASCADE on delete** (deleting a parent removes children)

---

## 6. Backend API Reference

> **Base URL:** `http://localhost:8000/api`

### 6.1 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Unified login for all roles |
| `POST` | `/auth/register` | ❌ | Student self-registration |

#### `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student"          // optional: "student" | "admin"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

**Errors:** `401` Invalid credentials · `403` Unauthorized for role · `500` Server error

#### `POST /auth/register`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "student"           // defaults to "student"
}
```

**Response (200):** Same shape as login response (auto-login on register)

**Errors:** `400` Email already in use · `500` Server error

---

### 6.2 Users (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/users/me` | ✅ | Any | Get authenticated user's profile |
| `GET` | `/users` | ✅ | Admin | List all platform users |
| `POST` | `/users/:id/warn` | ✅ | Admin | Issue warning to a user |

#### `POST /users/:id/warn`

**Request Body:**
```json
{ "reason": "Terms violation" }
```

**Response (200):**
```json
{ "message": "Warning sent successfully" }
```

---

### 6.3 Courses (`/api/courses`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/courses` | ❌ | Public | List published courses |
| `GET` | `/courses?bestsellers=true` | ❌ | Public | Filter bestseller courses |
| `GET` | `/courses/:slug` | ❌ | Public | Get course details + sections + videos |
| `GET` | `/courses/all` | ✅ | Admin | List ALL courses (including unpublished) |
| `POST` | `/courses` | ✅ | Admin | Create new course |
| `PUT` | `/courses/:id` | ✅ | Admin | Update course details |

#### `POST /courses` (Create)

**Request Body:**
```json
{
  "title": "Advanced TypeScript",
  "slug": "advanced-typescript",
  "headline": "Master the hardest parts of TS",
  "description": "Full course description...",
  "thumbnail_url": "https://...",
  "price": 499
}
```

#### `PUT /courses/:id` (Update)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "is_published": true,
  "is_bestseller": true,
  "price": 599
}
```

---

### 6.4 Content Management (`/api/content`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/content/sections` | ✅ | Admin | Add section to a course |
| `POST` | `/content/videos` | ✅ | Admin | Add video to a section |
| `PUT` | `/content/videos/:id` | ✅ | Admin | Update video details |

#### `POST /content/sections`

```json
{
  "subject_id": 1,
  "title": "Getting Started",
  "order_index": 1
}
```

#### `POST /content/videos`

```json
{
  "section_id": 1,
  "title": "Introduction to Types",
  "youtube_video_id": "dQw4w9WgXcQ",
  "description": "Video description...",
  "order_index": 1,
  "duration_seconds": 600
}
```

---

### 6.5 Progress & Enrollment (`/api/progress`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/progress/status/:subjectId` | ✅ | Check enrollment & get all video progress |
| `POST` | `/progress/enroll` | ✅ | Enroll in a course |
| `POST` | `/progress/sync/:videoId` | ✅ | Sync video watch progress (anti-cheat) |

#### `POST /progress/enroll`

```json
{ "subjectId": 1 }
```

#### `POST /progress/sync/:videoId` — Anti-Cheat

```json
{ "position_seconds": 45 }
```

**Anti-Cheat Rules:**
- Maximum allowed jump: **15 seconds** per sync ping (5-second intervals)
- Video considered complete at **95%** of total duration
- Fast-forward returns `422` with `allowedPosition` for player rollback

---

### 6.6 Admin Analytics (`/api/admin/stats`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/admin/stats` | ✅ | Admin | Platform-wide statistics |
| `GET` | `/admin/stats/activity` | ✅ | Admin | Recent enrollment & registration activity |
| `GET` | `/admin/stats/trends` | ✅ | Admin | 7-day enrollment trend data |

#### `GET /admin/stats`

**Response (200):**
```json
{
  "totalStudents": 142,
  "totalCourses": 8,
  "totalEnrollments": 356,
  "totalVideos": 120,
  "totalRevenue": 45200
}
```

---

### 6.7 AI Assistant (`/api/ai`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/ai/student/chat` | ✅ | Student | General learning assistance & course help |
| `GET` | `/ai/student/suggestions` | ✅ | Student | Personalized course recommendations |
| `POST` | `/ai/admin/assist` | ✅ | Admin | Execute DB actions via natural language |

---

### 6.8 Payments (`/api/payments`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/enroll` | ✅ | Enroll with simulated payment logic |
| `GET` | `/payments/history` | ✅ | Get student's payment record history |

---

### 6.9 Settings (`/api/settings`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/settings` | ✅ | Any | Fetch global site settings |
| `PUT` | `/settings` | ✅ | Admin | Update site-wide configuration |

---

## 7. Authentication & Authorization

### JWT Token Flow

1. User submits credentials via `POST /auth/login` or `POST /auth/register`
2. Server validates credentials, generates JWT with payload: `{ userId, email, role }`
3. Token expires in **7 days**
4. Client stores token in **Zustand persisted store** (localStorage key: `lms-auth-storage`)
5. Axios interceptor automatically attaches `Authorization: Bearer <token>` to every request
6. On `401` response, client auto-logs out and redirects to `/login`

### Middleware Stack

```
authenticateToken     → Validates JWT, attaches req.user
    └── requireAdmin  → Checks req.user.role === 'admin'
```

### Frontend Route Protection

The `AuthGuard` component provides client-side protection:
- Checks for valid `token` and `user` in Zustand store
- Redirects unauthorized users to `/login`
- Supports `allowedRoles` prop for role-based page access
- Displays a loading spinner while checking authorization

---

## 8. Frontend Application

### 8.1 Pages & Navigation

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | Root | Public | Redirects to `/login` |
| `/login` | Login Page | Public | Tabbed login (Student / Admin) with registration |
| `/dashboard` | Student Dashboard | Student | Browse available published courses |
| `/course/[slug]` | Course Landing | Student | Course details, curriculum preview, enrollment |
| `/course/[slug]/play` | Course Player | Enrolled | YouTube player with progress sidebar |
| `/dashboard/learning` | My Learning | Student | Grid of enrolled courses with progress |
| `/dashboard/payments` | Pay History | Student | List of previous course transactions |
| `/admin` | Admin Dashboard | Admin | Stats overview, activity feed, and trends |
| `/admin/courses` | Course Manager | Admin | CRUD courses, toggle publish/bestseller |
| `/admin/users` | User Manager | Admin | Search users, issue warnings |
| `/admin/settings` | Site Settings | Admin | Manage site name, support email, and modes |

### 8.2 State Management

**Zustand Store (`authStore.ts`):**

```typescript
interface AuthState {
  user: User | null;     // { id, name, email, role }
  token: string | null;  // JWT token
  login: (user, token) => void;
  logout: () => void;
}
```

- Persisted to `localStorage` under key `lms-auth-storage`
- Auto-restored on page load for session continuity

### 8.3 Axios Configuration

- **Base URL:** `http://localhost:8000/api` (configurable via `NEXT_PUBLIC_API_URL`)
- **Request interceptor:** Injects Bearer token from auth store
- **Response interceptor:** Auto-logout on 401

### 8.4 UI Design System

- **Theme:** Dark mode with glassmorphism (`backdrop-blur`, `glass-card` class)
- **Colors:** Custom primary/accent/destructive tokens via CSS variables
- **Typography:** System fonts with tight tracking, bold headlines
- **Components:** 14 Shadcn/UI components (Card, Dialog, Table, Tabs, Badge, Button, Input, Label, Progress, Skeleton, Avatar, Separator, Dropdown Menu)
- **Animations:** Framer Motion for page transitions, AnimatePresence for tab switching
- **Icons:** Lucide React icon set throughout

---

## 9. Key Features

### 9.1 AI & Personalization

LMSPro leverages **Meta-Llama-3** (via Hugging Face) to provide:
- **Student Chat:** Real-time help with curriculum doubts and platform navigation.
- **Smart Suggestions:** Recommendations based on a student's existing enrollments.
- **Admin Co-pilot:** Admins can manage the platform using natural language (e.g., "Create a new course about React" or "Delete user with email test@test.com").

### 9.2 Anti-Cheat Video Progress Tracking

The system ensures learning integrity by preventing students from fast-forwarding through videos:

1. **Client syncs every 5 seconds** via `POST /progress/sync/:videoId`
2. **Server checks jump distance** — if `position_seconds - last_position_seconds > 15`, returns `422`
3. **Player rolls back** to the last allowed position on cheat detection
4. **95% threshold** — video marked complete when position ≥ 95% of `duration_seconds`
5. **Keyboard disabled** — YouTube player configured with `disablekb: 1`

### 9.3 Student Experience Enhancements

- **My Learning:** A dedicated dashboard for students to track their enrolled courses and progress.
- **Sequential Learning:** Integrated sidebar for easy navigation between course sections and videos.
- **Progress Visibility:** Granular completion tracking per video and overall course progress bars.

### 9.4 Simulated Payment System

Students can "purchase" courses via a simulated checkout flow:
- Enforces subject price during enrollment.
- Generates unique transaction IDs (`SIM-XXX`).
- Maintains a permanent `payments` record for invoice/history visibility.

### 9.5 Admin Dashboard control

- **Advanced Analytics:** Real-time stats, recent activity feeds, and enrollment trends.
- **Course & Content CRUD:** Full control over subjects, sections, and videos.
- **Global Settings:** Centralized control for maintenance mode, registration toggles, and site branding.

---

## 10. Environment Configuration

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string (Prisma format) | `mysql://user:pass@host:port/db?ssl-mode=REQUIRED` |
| `PORT` | API server port | `8000` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secure-secret-key` |
| `HF_TOKEN` | Hugging Face API Token (for AI features) | `hf_...` |

### Frontend

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## 11. Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MySQL** database (local or cloud)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd LMS

# 2. Backend Setup
cd backend
npm install
npx prisma generate        # Generate Prisma client
npx prisma db push          # Sync schema to database
npm run dev                 # Start dev server on port 8000

# 3. Frontend Setup (new terminal)
cd frontend
npm install
npm run dev                 # Start Next.js on port 3000
```

### Seed Admin User

```bash
cd backend
npx ts-node scripts/seedAdmin.ts
```

This creates an admin account (or updates an existing one).

---

## 12. Scripts & Utilities

| Script | Location | Command | Description |
|---|---|---|---|
| Backend Dev | `backend/` | `npm run dev` | Start Express with nodemon (hot-reload) |
| Backend Build | `backend/` | `npm run build` | Compile TypeScript to `dist/` |
| Backend Start | `backend/` | `npm start` | Run compiled production build |
| Frontend Dev | `frontend/` | `npm run dev` | Start Next.js dev server |
| Frontend Build | `frontend/` | `npm run build` | Production build |
| Frontend Lint | `frontend/` | `npm run lint` | ESLint check |
| Seed Admin | `backend/` | `npx ts-node scripts/seedAdmin.ts` | Create/update admin user |
| Prisma Studio | `backend/` | `npx prisma studio` | Visual database browser |
| DB Push | `backend/` | `npx prisma db push` | Sync schema to database |
| Generate Client | `backend/` | `npx prisma generate` | Regenerate Prisma client |

---

> **Health Check:** `GET http://localhost:8000/health` returns `{ "status": "ok", "time": "..." }`
