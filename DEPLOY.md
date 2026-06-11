# Skoolyn L.E.A.R.N — Complete Deployment Guide (cPanel / VPS)

## ✅ Prerequisites
- Node.js 18+ (check with `node -v`)
- cPanel with Node.js support OR a VPS with PM2 / systemd
- PostgreSQL database (recommended for production)
- Paystack account (for payments)
- SMTP provider (for emails)

---

## 📁 Environment Variables (`.env`)

Create a `.env` file in the project root. Do NOT commit it to git.

```env
# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (PostgreSQL for production, SQLite for testing only)
DATABASE_URL=postgresql://user:password@localhost:5432/skoolyn_db
# OR for cPanel shared hosting without PostgreSQL: DATABASE_URL=file:./dev.db

# JWT Secret - generate a strong random string
JWT_SECRET=your-super-secret-64-char-random-string
JWT_EXPIRES_IN=7d

# Paystack (you can also set these via Admin Settings UI)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx

# SMTP (for email verification, password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Skoolyn <your-email@gmail.com>

# Cloudinary (optional - for cloud file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Jitsi (public domain is free)
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🚀 Build & Deploy to cPanel

### Step 1: Upload Files
Upload the **entire `skoolyn-learn/` project folder** to your cPanel home directory (e.g., `~/skoolyn-learn/`).

### Step 2: Create `.env` on Server
Upload or create the `.env` file on the server with real credentials.

### Step 3: Setup Node.js App in cPanel
1. Open **cPanel → Setup Node.js App**
2. Node.js version: **18.x**
3. Application root: `skoolyn-learn`
4. Application URL: `yourdomain.com` (or a subdomain like `app.yourdomain.com`)
5. Application startup file: `server.js`
6. Click **Create**

### Step 4: Run Commands (cPanel Terminal or SSH)
```bash
cd ~/skoolyn-learn
npm install
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy
npm run build
```

### Step 5: Restart the App
In cPanel, click **Restart** on your Node.js app.

### Step 6: Make Uploads Folder Writable
```bash
chmod -R 755 public/uploads
```

---

## 🖥️ Deploy to VPS with PM2

```bash
cd /var/www/skoolyn-learn
npm install
npm run build
pm2 start server.js --name "skoolyn"
pm2 save
pm2 startup
```

---

## 🗄️ Database Setup

### For Production (PostgreSQL)
```bash
# Create database manually, then:
npx prisma migrate deploy
npx prisma db seed  # Optional: seed demo data
```

**⚠️ NEVER run `prisma migrate dev` in production. It will reset your database.**

### For Testing (SQLite - NOT for production)
```bash
npx prisma migrate deploy
npx tsx src/prisma/seed.ts
```

---

## 🎓 First-Time Admin Setup

1. Login as **admin** with these credentials:
   - Email: `admin@skoolyn.com`
   - Password: `admin123`

2. Go to **Admin Settings** (`/admin/settings`)
3. Enter your **Paystack Secret Key** and **Public Key**
4. Save settings
5. From now on, all student payments will use YOUR Paystack keys

**Note:** You can also set Paystack keys in `.env` (as fallback), but the **Admin Settings UI takes priority** over `.env`.

---

## 📂 File Uploads

The application saves uploaded files locally to `public/uploads/`:
- `avatars/` — Profile pictures
- `lessons/` — Course videos, PDFs, images
- `assignments/` — Assignment files
- `submissions/` — Student submissions
- `resumes/` — Teacher resumes

**Ensure this folder is writable:**
```bash
chmod -R 755 public/uploads
```

For production with high traffic, consider migrating to **Cloudinary** or **AWS S3**.

---

## 🔑 Demo Accounts (Seeded)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@skoolyn.com` | `admin123` |
| **Teacher** | `teacher@skoolyn.com` | `teacher123` |
| **Student** | `student@skoolyn.com` | `student123` |

---

## 🎨 User Features

| Feature | How it works |
|---------|-------------|
| **Theme** | Go to Settings → choose Light / Dark / System |
| **Font** | Go to Settings → choose Modern, Classic, or Code font |
| **Font Size** | Go to Settings → Small, Default, or Large |
| **Primary Color** | Go to Settings → Blue, Purple, Green, Orange, or Rose |

All settings are saved to `localStorage` and apply immediately.

---

## ⚠️ Important Notes

- The `server.js` file is a custom Next.js server for cPanel compatibility.
- The build uses `output: 'standalone'` in `next.config.js` for optimized deployment.
- Make sure `.env` is NOT in your git repository.
- For SSL, ensure your domain has HTTPS enabled.
- Jitsi live classes use the public `meet.jit.si` domain. For branded meetings, you need a self-hosted Jitsi server.
- **Teachers CANNOT create courses.** Only **Admin** can create courses and assign teachers.
- **Teachers** upload videos & materials through **Videos & Materials** in their sidebar.
- **Students** click on a course to see all modules with video lessons, PDFs, and images.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version (must be 18+) |
| Database errors | Verify `DATABASE_URL` and run `npx prisma migrate deploy` |
| Upload errors | Ensure `public/uploads/` is writable |
| Payment errors | Verify Paystack keys in **Admin Settings** |
| Email not sending | Check SMTP credentials in `.env` |
| 404 pages | Restart the Node.js app in cPanel |
