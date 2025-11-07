# Render.com Deployment Guide

## Quick Deploy (5 Minutes)

### Step 1: Create Render Account

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with your **GitHub account**

### Step 2: Deploy the Backend

1. From Render dashboard, click **"New +"** → **"Web Service"**

2. Click **"Connect GitHub"** and authorize Render

3. Select your repository: **`umchs-inventory`**

4. Configure the service:
   - **Name**: `umchs-maintenance-backend` (or any name you like)
   - **Branch**: `claude/build-maintenance-data-app-011CUscmjmvnUx5whbekWWGb`
   - **Root Directory**: Leave empty (use root)
   - **Environment**: `Node`
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Build Command**:
     ```
     npm install && npm run init-db && npm run create-admin
     ```
   - **Start Command**:
     ```
     npm start
     ```

5. Scroll down to **"Advanced"** and add environment variables:

   Click **"Add Environment Variable"** for each:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `JWT_SECRET` | `your-random-secret-here-make-it-long` |
   | `DATABASE_PATH` | `./inventory.db` |

6. Select **"Free"** plan

7. Click **"Create Web Service"**

### Step 3: Wait for Deployment

- Render will build and deploy your app (3-5 minutes)
- Watch the logs for progress
- Look for: ✅ **"Your service is live"**

### Step 4: Get Your URL

- Your app will be at: `https://umchs-maintenance-backend.onrender.com`
- Or whatever name you chose: `https://YOUR-NAME.onrender.com`

### Step 5: Test It

Visit: `https://your-app.onrender.com/api/health`

You should see:
```json
{"status":"ok","message":"Inventory API is running"}
```

✅ **Backend deployed successfully!**

---

## Using the Mobile App

Now that your backend is deployed, you can use the mobile app:

### Option A: GitHub Codespace (Browser)

1. Go to: https://github.com/stunkcuf/umchs-inventory
2. Click **"Code"** → **"Codespaces"** → **"Create codespace"**
3. Create file `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-app.onrender.com/api
   ```
4. In terminal:
   ```bash
   cd mobile
   npm install
   npx expo start --web
   ```
5. App opens in browser!

### Option B: Phone App

1. In Codespace terminal:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
2. Scan QR code with Expo Go app
3. App loads on your phone!

---

## Default Credentials

### Inventory System Login
- Username: `admin`
- Password: `admin123`

### Maintenance System Login (IMESD)
- Username: `mbert`
- Password: `Mbert2025!`

---

## Important Notes

### Free Plan Limitations

Render's free plan:
- ✅ 750 hours/month free
- ⚠️ Spins down after 15 min of inactivity
- 🐌 Takes 30-60 seconds to wake up on first request
- ✅ Perfect for personal use!

### Keeping It Awake

If you want instant response, upgrade to paid plan ($7/month) or:
- Set up a ping service (like UptimeRobot)
- Or just accept the 30-second wake-up time

### Database Persistence

The SQLite database will persist between deploys on Render's free plan.

---

## Troubleshooting

### Build Fails

**Error: "Missing script: start"**
- Make sure you're on the correct branch
- Check that `package.json` has the start script

**Error: "Cannot find module"**
- Delete the service and recreate it
- Ensure `npm install` is in the build command

### App Won't Start

**Check the logs:**
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Look for error messages

**Common fixes:**
- Ensure all environment variables are set
- Check that PORT is set to 5000
- Verify JWT_SECRET is set

### Mobile App Can't Connect

**Error: "Network request failed"**
- Check your API URL in `mobile/.env`
- Make sure it ends with `/api`
- Verify backend is running (visit `/api/health`)

**CORS errors:**
- Backend allows all origins by default
- Should work from any domain

---

## Updating Your Deployment

Render auto-deploys on every git push!

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Render automatically rebuilds and redeploys!

---

## Manual Redeploy

From Render dashboard:
1. Click your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Viewing Logs

Real-time logs:
1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab

Download logs:
1. Click "Logs"
2. Click "Download" button

---

## Next Steps

1. ✅ Backend deployed to Render
2. ✅ Mobile app connected to cloud backend
3. 🎉 Use from anywhere!

**Bookmark your URLs:**
- Backend: `https://your-app.onrender.com`
- Mobile: Your Codespace URL
- Expo: Your Expo Snack URL (if using)

---

## Cost

**100% FREE** with Render's free plan!

Optional upgrades:
- Paid plan: $7/month (no spin-down)
- Database: Free SQLite included

---

## Support

- Render Docs: https://render.com/docs
- Dashboard: https://dashboard.render.com
- Status: https://status.render.com

Questions? Check `CLOUD_DEPLOYMENT.md` for more options!
