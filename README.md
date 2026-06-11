# Skoolyn L.E.A.R.N

A production-ready fullstack Learning Management System (LMS) built with **Next.js 14 (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma ORM**, **PostgreSQL**, **Socket.io**, and **Paystack API**.

## Features

### Three Roles
- **Admin**: Platform management, user/teacher approval, course oversight, analytics, payments, announcements
- **Teacher**: Course creation, video/PDF/image lessons, assignments, tests with auto-scoring, live video classes (Jitsi), analytics, earnings
- **Student**: Course browsing, Paystack payments, enrollment, live class participation, group communication, assignments, timed tests

### Authentication
- Email/password registration with 6-digit verification code via SMTP
- Google OAuth "Continue with Google"
- JWT auth with httpOnly cookies
- Password reset via secure email link
- Role-based route guards and middleware

### Live Features
- Socket.io room-based chat per live class
- Jitsi Meet iframe integration for video conferencing
- Chat history with emoji support and file sharing

### Payments (Paystack)
- Initialize NGN transactions with metadata
- Callback verification and webhook support
- Automated enrollment on successful payment
- Branded confirmation emails

### Admin Dashboard
- Approve/reject teacher applications with resume download
- Course creation and pricing (Free/Paid in NGN)
- User management (view, suspend, delete)
- Payment transaction logs and analytics
- Platform-wide announcements
- Revenue and completion analytics

### Teacher Dashboard
- Course and lesson management (Video, PDF, Image)
- Assignment and test creation (A-E multiple choice, auto-scoring)
- Live class scheduling with Jitsi
- Student analytics and earnings tracking
- CSV grade export

### Student Dashboard
- Browse/filter/search courses by category, price, rating
- Enroll in free or paid courses (Paystack checkout)
- Live class join with real-time chat
- Timed tests with auto-submit and instant scoring
- Group creation and community posts
- Assignment submissions with file upload
- Progress tracking per course

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + bcryptjs + httpOnly cookies |
| Payments | Paystack API |
| Real-time | Socket.io |
| Email | Nodemailer (SMTP/SendGrid-ready) |
| Uploads | Cloudinary (AWS S3 compatible) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## Project Structure

```
skoolyn-learn/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth pages (login, register, forgot-password, reset-password)
│   │   ├── (dashboard)/
│   │   │   ├── (admin)/admin/      # Admin dashboard pages
│   │   │   ├── (teacher)/teacher/  # Teacher dashboard pages
│   │   │   └── (student)/student/ # Student dashboard pages
│   │   ├── api/                    # REST API routes
│   │   │   ├── auth/               # Register, login, verify, google, forgot/reset password
│   │   │   ├── teacher/            # Course, lesson, assignment, test, live class APIs
│   │   │   ├── student/            # Browse, enroll, submit, group APIs
│   │   │   ├── admin/              # Teachers, users, courses, payments, analytics, announcements
│   │   │   ├── payments/           # Initialize, verify, webhook
│   │   │   ├── upload/             # Resume, lesson, assignment, submission file uploads
│   │   │   └── chat/socket         # Socket.io server setup
│   │   ├── layout.tsx              # Root layout with ThemeProvider, AuthProvider, SocketProvider
│   │   └── globals.css             # Tailwind + theme variables
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (Button, Card, Input, Select, etc.)
│   │   ├── auth/                   # Auth-specific components
│   │   ├── admin/                  # Admin dashboard components
│   │   ├── teacher/                # Teacher dashboard components
│   │   ├── student/                # Student dashboard components
│   │   ├── shared/                 # ThemeToggle, reusable widgets
│   │   ├── layout/                 # DashboardShell, Sidebar, Navbar
│   │   └── providers/              # ThemeProvider, AuthProvider, SocketProvider
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities, auth, email, paystack, cloudinary, validations
│   ├── types/                      # TypeScript interfaces and enums
│   └── prisma/
│       └── schema.prisma           # Complete database schema
├── public/                         # Static assets
├── .env.example                    # Environment variable template
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind + custom theme colors
└── package.json
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Paystack account (test/live keys)
- Cloudinary account (for file uploads)
- Google Cloud Console (for OAuth)
- SMTP credentials (Gmail, SendGrid, etc.)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd skoolyn-learn
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skoolyn_learn?schema=public"

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# SMTP / Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Skoolyn L.E.A.R.N <noreply@skoolyn.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Jitsi
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed sample data
npx tsx src/prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Production Build

```bash
npm run build
npm start
```

## Default Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skoolyn.com | admin123 |
| Teacher | teacher@skoolyn.com | teacher123 |
| Student | student@skoolyn.com | student123 |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email + 6-digit code |
| POST | `/api/auth/verify-code` | Verify email code |
| POST | `/api/auth/login` | Login with JWT cookie |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Clear cookie |

### Teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/courses` | List my courses |
| POST | `/api/teacher/courses` | Create course |
| POST | `/api/teacher/lessons` | Upload lesson |
| POST | `/api/teacher/assignments` | Create assignment |
| POST | `/api/teacher/tests` | Create test + questions |
| POST | `/api/teacher/live-classes` | Schedule live class |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/courses` | Browse all courses |
| POST | `/api/student/enroll` | Enroll in course |
| POST | `/api/payments/initialize` | Start Paystack payment |
| GET | `/api/payments/verify` | Verify callback |
| POST | `/api/student/assignments` | Submit assignment |
| POST | `/api/student/tests` | Submit test answers |
| GET | `/api/student/live-classes` | List upcoming classes |
| POST | `/api/student/groups` | Create/join group |
| POST | `/api/student/posts` | Post in group |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/teachers` | List teacher applications |
| PATCH | `/api/admin/teachers` | Approve/reject teacher |
| GET | `/api/admin/users` | Manage users |
| GET | `/api/admin/analytics` | Platform analytics |
| GET | `/api/admin/payments` | Transaction history |
| POST | `/api/admin/announcements` | Broadcast announcements |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel Dashboard
4. Build command: `npm run build`

### Backend + Database (Railway/Render)

1. Create PostgreSQL database on Railway or Render
2. Deploy the Next.js app with the same environment variables
3. Update `NEXT_PUBLIC_APP_URL` to production domain

### Cloudinary (File Storage)

1. Create account on [Cloudinary](https://cloudinary.com)
2. Copy credentials to environment variables
3. Upload presets are configured automatically in code

### Paystack (Payments)

1. Create account on [Paystack](https://paystack.com)
2. Use test keys for development, live keys for production
3. Set webhook URL to `https://yourdomain.com/api/payments/webhook`

## Security

- **Zod** input validation on all API routes
- **bcryptjs** password hashing with salt rounds 12
- **JWT** stored in httpOnly, Secure, SameSite=Lax cookies
- **Rate limiting** on auth endpoints (recommended: add `express-rate-limit` or API gateway rules)
- **XSS protection** via React's built-in escaping and DOMPurify for rich content
- **File upload validation** (type, size) before Cloudinary upload
- **HTTPS only** in production (cookies set Secure flag)
- **Prisma** query safety (parameterized queries by default)

## License

MIT License - Skoolyn L.E.A.R.N Team

---

Built with passion for education in Nigeria and beyond.
