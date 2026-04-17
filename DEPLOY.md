# 🚀 Deployment Guide — LetsFix Campus Issue Reporting System

Follow these steps **in order**. Total time: ~20–30 minutes.

---

## Step 1 — MongoDB Atlas (Cloud Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and **Sign Up** (free)
2. Click **"Build a Database"** → Choose **Free M0** → Pick any region → Click **Create**
3. **Create a Database User:**
   - Left sidebar → **Database Access** → **Add New Database User**
   - Username: `letsfixadmin` (or anything you prefer)
   - Password: generate a strong one, **save it**
   - Role: **Atlas Admin** → Click **Add User**
4. **Allow All IP Addresses:**
   - Left sidebar → **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** → Confirm
5. **Get your Connection String:**
   - Left sidebar → **Database** → **Connect** → **Drivers**
   - Copy the URI that looks like:
     ```
     mongodb+srv://letsfixadmin:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual password
   - Add the database name at the end:
     ```
     mongodb+srv://letsfixadmin:YOUR_PASS@cluster0.xxxxx.mongodb.net/letsfixcampus
     ```
   - **Save this URI** — you'll need it for Render.

---

## Step 2 — Cloudinary (Image Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) and **Sign Up** (free)
2. After logging in, go to your **Dashboard**
3. Note down these 3 values:
   - **Cloud Name** (e.g. `dxyz1234`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcDEFghi...`)
4. **Save these 3 values** — you'll need them for Render.

---

## Step 3 — Deploy Backend to Render

1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. Go to [render.com](https://render.com) → **Sign Up with GitHub**

3. Click **New +** → **Web Service**

4. Connect your GitHub repo: `Letsfixcampusissuereportingsystem`

5. Configure the service:
   | Setting | Value |
   |---|---|
   | Name | `letsfixcampus-backend` |
   | Root Directory | `backend` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |

6. Scroll down to **Environment Variables** and add ALL of these:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | *(your Atlas URI from Step 1)* |
   | `JWT_SECRET` | *(generate: open terminal, run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)* |
   | `JWT_EXPIRE` | `7d` |
   | `COLLEGE_EMAIL_DOMAIN` | `@grietcollege.com` |
   | `UPLOAD_METHOD` | `cloudinary` |
   | `CLOUDINARY_CLOUD_NAME` | *(from Step 2)* |
   | `CLOUDINARY_API_KEY` | *(from Step 2)* |
   | `CLOUDINARY_API_SECRET` | *(from Step 2)* |
   | `FRONTEND_URL` | *(leave blank for now — fill in after Step 4)* |
   | `POLL_DAY` | `6` |
   | `POLL_START_HOUR` | `0` |

7. Click **Create Web Service** → Wait for deploy (~3-5 min)

8. **Copy your Render URL** — it looks like `https://letsfixcampus-backend.onrender.com`

9. Come back and update `FRONTEND_URL` after Step 4.

---

## Step 4 — Update Frontend Config

1. Open the file `.env.production` in your project root
2. Replace the placeholder with your actual Render URL:
   ```
   VITE_API_BASE_URL=https://letsfixcampus-backend.onrender.com/api
   ```
3. Save the file and commit:
   ```bash
   git add .env.production
   git commit -m "Set production API URL"
   git push origin main
   ```

---

## Step 5 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign Up with GitHub**

2. Click **Add New...** → **Project**

3. Import your GitHub repo: `Letsfixcampusissuereportingsystem`

4. Configure:
   | Setting | Value |
   |---|---|
   | Framework Preset | `Vite` |
   | Root Directory | `.` (leave as default) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Scroll down to **Environment Variables** — Vercel will auto-read your `.env.production` file from the repo. No need to add them manually.

6. Click **Deploy** → Wait ~2 minutes

7. **Copy your Vercel URL** — it looks like `https://letsfixcampusissuereportingsystem.vercel.app`

---

## Step 6 — Connect Frontend to Backend (CORS)

1. Go back to your **Render dashboard**
2. Select your backend service → **Environment**
3. Find `FRONTEND_URL` and set it to your Vercel URL:
   ```
   https://letsfixcampusissuereportingsystem.vercel.app
   ```
4. Click **Save Changes** — Render will redeploy automatically

---

## Step 7 — Re-run Admin Scripts

Since you now have a cloud database, you need to re-add your admin users:

1. Temporarily set your local `backend/.env` MONGO_URI to the Atlas URI
2. Run your admin scripts:
   ```bash
   cd backend
   node scripts/seedAdminUser.js
   node scripts/addYuvanAdmin.js
   node scripts/addVivekAdmin.js
   ```
3. Revert `backend/.env` MONGO_URI back to `mongodb://localhost:27017/letsfixcampus` for local dev

---

## ✅ Done! Test It

Open your Vercel URL from **any device, any network**:
```
https://letsfixcampusissuereportingsystem.vercel.app
```

### What to test:
- [ ] Sign up with a college email
- [ ] Log in as admin
- [ ] Report an issue with an image
- [ ] Verify the image appears (served from Cloudinary)
- [ ] Vote on an issue

---

## ⚠️ Known Limitations (Free Tier)

| Issue | Cause | Fix |
|---|---|---|
| First request takes 30–60s | Render spins down after 15min idle | Upgrade Render to $7/mo paid plan |
| 512MB storage limit | Cloudinary free tier | Upgrade if needed |
| 512MB RAM | Render free tier | Upgrade if traffic grows |

---

## 🔄 Future Updates

Whenever you push code changes to GitHub:
- **Backend** → Render auto-redeploys
- **Frontend** → Vercel auto-redeploys

No manual steps needed after initial setup!
