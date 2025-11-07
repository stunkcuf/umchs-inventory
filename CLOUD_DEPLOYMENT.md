# Cloud Deployment Guide - No Installation Required!

This guide will help you deploy the maintenance ticket app to the cloud so you can use it from any device, including your company computer.

## 🚀 Quick Start Options

### Option 1: Render.com (Easiest - 100% Free)

**No installation required! Deploy directly from GitHub:**

1. **Create a Render account**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Deploy the backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `umchs-inventory` repository
   - Branch: `claude/build-maintenance-data-app-011CUscmjmvnUx5whbekWWGb`
   - Click "Connect"

3. **Configure settings**
   - Name: `umchs-maintenance-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run init-db`
   - Start Command: `cd backend && npm start`
   - Plan: `Free`

4. **Add environment variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV = production
     PORT = 5000
     JWT_SECRET = your-random-secret-key-here
     DATABASE_PATH = ./inventory.db
     ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - You'll get a URL like: `https://umchs-maintenance-backend.onrender.com`

6. **Test it**
   - Visit: `https://your-app.onrender.com/api/health`
   - Should see: `{"status":"ok","message":"Inventory API is running"}`

---

### Option 2: Fly.io (Fast & Free)

**If you can run ONE command from any computer:**

1. **Install Fly CLI** (or use their web dashboard)
   ```bash
   # On Mac/Linux
   curl -L https://fly.io/install.sh | sh

   # On Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login & Deploy**
   ```bash
   fly auth login
   fly launch --config fly.backend.toml --now
   ```

3. **Your app is live!**
   - URL: `https://umchs-maintenance-backend.fly.dev`

---

### Option 3: GitHub Codespaces (100% Browser-Based)

**Perfect for restricted company computers - everything runs in your browser!**

1. **Open Codespace**
   - Go to https://github.com/stunkcuf/umchs-inventory
   - Click "Code" → "Codespaces" → "Create codespace on [branch]"

2. **Setup Backend** (in the Codespace terminal)
   ```bash
   cd backend
   npm install
   npm run init-db
   npm run create-admin
   npm start
   ```

3. **Codespaces gives you a public URL automatically!**
   - Look for the "Ports" tab at the bottom
   - Port 5000 will show as "forwarded"
   - Click the globe icon to get your public URL

4. **Use the Mobile App in Browser**
   ```bash
   # Open new terminal
   cd mobile
   npm install
   npx expo start --web
   ```

5. **Access from your phone**
   - The Expo web app will open in a new browser tab
   - Scan the QR code with your phone using Expo Go app
   - Or just use it in the browser!

---

### Option 4: Replit (Instant, No Setup)

**Deploy in under 2 minutes:**

1. Go to https://replit.com
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Paste: `https://github.com/stunkcuf/umchs-inventory`
5. Click "Import"
6. In the Shell tab, run:
   ```bash
   cd backend && npm install && npm run init-db && npm start
   ```
7. Click "Run" - Replit gives you a public URL instantly!

---

## 📱 Accessing the Mobile App

Once your backend is deployed, you have 3 options for the mobile app:

### A) Use Expo Web (Browser on Phone)

1. Get your backend URL from above (e.g., `https://your-app.onrender.com`)

2. Update the API URL:
   - In your GitHub repo, edit `mobile/src/services/api.js`
   - Change line 5 to:
     ```javascript
     const API_URL = 'https://your-backend-url.com/api';
     ```

3. Deploy mobile app to Expo:
   ```bash
   cd mobile
   npm install
   npx expo publish
   ```

4. Visit the Expo web URL from your phone's browser!

### B) Expo Snack (Instant Mobile Preview)

1. Go to https://snack.expo.dev
2. Create a new Snack
3. Upload all files from the `mobile/src` directory
4. Update the API_URL in `services/api.js` to your backend URL
5. Click "Run" - works on phone or browser!

### C) Physical Phone (Best Experience)

1. Install "Expo Go" app from App Store / Play Store
2. In a Codespace or any computer:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Scan the QR code with your phone
4. App loads directly on your phone!

---

## 🔧 Quick Configuration Checklist

After deployment, you need to:

1. **Create admin user** (run once)
   ```bash
   cd backend && npm run create-admin
   ```

2. **Update mobile API URL**
   - Edit `mobile/src/services/api.js`
   - Replace `http://localhost:5000/api` with your cloud URL

3. **Set your maintenance credentials**
   - Login to the app
   - Go to Tickets tab
   - Enter IMESD credentials (mbert / Mbert2025!)

---

## 🎯 Recommended: Render.com + Expo Web

**Why this combo?**
- ✅ 100% free
- ✅ No installation needed
- ✅ Works on company computers
- ✅ Auto-deploys on git push
- ✅ HTTPS included
- ✅ Access from any device

**Setup time: 5 minutes**

1. Deploy backend to Render (see Option 1 above)
2. Note your backend URL
3. Update `mobile/src/services/api.js` with backend URL
4. Push to GitHub
5. Open GitHub Codespace
6. Run `cd mobile && npx expo start --web`
7. Use the app in browser or scan QR for phone!

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables are set
- Ensure PORT is set to 5000
- Check logs in your cloud dashboard

### Mobile can't connect to backend
- Verify API_URL in `mobile/src/services/api.js`
- Make sure backend URL includes `/api` at the end
- Check backend is actually running (visit `/api/health`)

### "Cannot create admin user"
- Database needs to be initialized first
- Run: `npm run init-db` before `create-admin`

### CORS errors
- Add your frontend URL to backend CORS settings
- In `backend/src/server.js`, update CORS configuration

---

## 📞 Quick Help Commands

Test backend health:
```bash
curl https://your-backend-url.com/api/health
```

Check if backend is running:
```bash
curl -I https://your-backend-url.com
```

View logs (Render):
- Go to dashboard → your service → "Logs" tab

View logs (Fly.io):
```bash
fly logs
```

---

## 🎉 You're Done!

Once deployed:
1. Visit your backend URL + `/api/health` to verify
2. Open mobile app (web or phone)
3. Login with admin credentials
4. Go to Tickets tab
5. Login to maintenance system
6. Start managing tickets from anywhere!

No company computer restrictions needed - everything runs in the cloud! 🚀
