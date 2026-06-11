# Skoolyn L.E.A.R.N - Local Setup Guide

## Quick Start (Local Machine)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally
- A Paystack test account (optional for payments)
- A Cloudinary account (optional for file uploads)
- SMTP credentials (optional for email)

### 2. Install Dependencies
```bash
cd skoolyn-learn
npm install
```

### 3. Database Setup (PostgreSQL)

**Copy the original PostgreSQL schema:**
```bash
cp src/prisma/schema.prisma prisma/schema.prisma
```

**Set your DATABASE_URL in `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/skoolyn_learn?schema=public"
```

**Generate Prisma client and migrate:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Demo Data
```bash
npx tsx src/prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## Demo Credentials (After Seeding)

| Role | Email | Password | Use For |
|------|-------|----------|---------|
| **Admin** | admin@skoolyn.com | admin123 | Approve teachers, create courses, view analytics |
| **Teacher** | teacher@skoolyn.com | teacher123 | Create courses, lessons, live classes, tests |
| **Student** | student@skoolyn.com | student123 | Browse courses, enroll, join live classes, groups |

---

## Feature Testing Checklist

### Auth
- [ ] Register as Student → Verify 6-digit code sent to console (email in dev mode)
- [ ] Register as Teacher → Upload resume during application
- [ ] Login with credentials
- [ ] Forgot password flow
- [ ] Google OAuth (requires Google Client ID setup)

### Admin Dashboard
- [ ] Login as `admin@skoolyn.com`
- [ ] Approve/reject teacher applications at `/admin/teachers`
- [ ] Create courses at `/admin/courses/new` → assign teacher, set price, duration
- [ ] View analytics at `/admin/analytics`
- [ ] View all users at `/admin/users`

### Teacher Dashboard
- [ ] Login as `teacher@skoolyn.com`
- [ ] Apply with resume if not approved
- [ ] Create courses at `/teacher/courses`
- [ ] Add video lessons at `/teacher/courses/[id]`
- [ ] Schedule live classes at `/teacher/classes`
- [ ] Create tests with A-E questions at `/teacher/tests`
- [ ] View earnings and analytics at `/teacher/analytics`

### Student Dashboard
- [ ] Login as `student@skoolyn.com`
- [ ] Browse courses at `/student/courses`
- [ ] Enroll in free course (instant)
- [ ] Join live class at `/student/classes` → click "Join Class"
- [ ] Take tests with timer and auto-scoring
- [ ] Join groups at `/student/groups` (course-specific)
- [ ] Upload profile picture at `/settings`

### Live Video Class (Jitsi Meet)
- Teacher creates a live class → generates a Jitsi room URL
- Students click "Join Class" → enter the same Jitsi room
- **All participants see each other** (teacher sees students, students see teacher + classmates)
- Built-in Jitsi chat available
- Screen sharing, video, microphone all work via Jitsi

### Payments (Paystack)
- Student clicks "Buy Course" on paid course
- Redirects to Paystack checkout
- On success: auto-enrolled + confirmation email
- Admin views all transactions at `/admin/payments`

### Notifications
- Notification bell icon in top-right of all dashboards
- Polls for new notifications every 30 seconds
- Shows unread badge count

---

## Environment Variables (`.env`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

DATABASE_URL="postgresql://user:password@localhost:5432/skoolyn_learn?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Skoolyn L.E.A.R.N <noreply@skoolyn.com>
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Project Structure

```
skoolyn-learn/
├── src/app/
│   ├── (auth)/           # Login, Register, Forgot Password, Reset Password
│   ├── (dashboard)/
│   │   ├── (admin)/admin/     # Admin Dashboard, Teachers, Courses, Users, Analytics, Payments
│   │   ├── (teacher)/teacher/ # Teacher Dashboard, Courses, Classes, Tests, Analytics
│   │   └── (student)/student/ # Student Dashboard, Courses, Classes, Groups, Community
│   └── api/               # All REST API routes
├── src/components/        # UI components, shared components, layout
├── src/lib/             # Auth, email, Paystack, Cloudinary, validations
├── src/prisma/          # Schema + seed script
├── public/              # Static assets
└── .env                 # Environment variables
```

---

## Build Status

✅ **Next.js 14 Build: SUCCESS**  
✅ **TypeScript: 0 errors**  
✅ **All pages prerendered correctly**  
✅ **All API routes compiled**  

---

Built with Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, and Paystack.
