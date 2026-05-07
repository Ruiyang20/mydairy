# 📔 My Diary — Full Stack App

**Stack:** MongoDB · Express · React · Node.js (MERN)  
**Auth:** Single-user password login · JWT (30 days)

---

## Quick Start (local)

### 1. Install
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Generate your password hash
```bash
node -e "require('bcryptjs').hash('YOUR_PASSWORD', 12).then(console.log)"
```
Copy the output — you'll need it in step 3.

### 3. Configure `server/.env`
```
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mydiary
DIARY_PASSWORD_HASH=<paste hash from step 2>
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_EXPIRES_IN=30d
```

### 4. Run
```bash
npm run dev   # from project root
```

---

## Deploy to Render

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "init"
# create repo on github.com, then:
git remote add origin https://github.com/YOUR/mydiary.git
git push -u origin main
```

### Step 2 — MongoDB Atlas (free tier)
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Database Access → Add user (username + password)
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Drivers → copy the connection string  
   `mongodb+srv://user:pass@cluster.mongodb.net/mydiary`

### Step 3 — Render Web Service
1. [render.com](https://render.com) → New → Web Service → connect your GitHub repo
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && cd ../client && npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. Environment Variables (in Render dashboard):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string |
   | `DIARY_PASSWORD_HASH` | bcrypt hash from step 2 above |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `30d` |

### Step 4 — Deploy
Click **Deploy**. Render builds client + server and serves everything from one URL.

---

## API Reference

All `/api/entries/*` routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ✗ | Get JWT token |
| POST | `/api/auth/verify` | ✗ | Check token validity |
| GET | `/api/entries` | ✓ | List entries |
| GET | `/api/entries/stats` | ✓ | Stats |
| GET | `/api/entries/:id` | ✓ | Single entry |
| POST | `/api/entries` | ✓ | Create |
| PUT | `/api/entries/:id` | ✓ | Update |
| DELETE | `/api/entries/:id` | ✓ | Delete |
