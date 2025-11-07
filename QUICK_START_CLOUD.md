# 🚀 Quick Start - Cloud Deployment (No PC Installation!)

**Perfect for company computers with restricted access!**

## Fastest Option: GitHub Codespaces (2 Minutes)

### Step 1: Open Codespace in Your Browser

1. Go to: https://github.com/stunkcuf/umchs-inventory
2. Click the green **"Code"** button
3. Click **"Codespaces"** tab
4. Click **"Create codespace on claude/build-maintenance-data-app-011CUscmjmvnUx5whbekWWGb"**

Wait 30 seconds for the environment to load...

### Step 2: Start the Backend

In the terminal that appears at the bottom, copy and paste these commands:

```bash
cd backend
npm install
npm run init-db
npm run create-admin
npm start
```

**Done!** The backend is now running!

Look for a popup in the bottom right that says "Your application running on port 5000 is available" - click **"Open in Browser"** to get your backend URL.

### Step 3: Start the Mobile App (In Browser)

Open a **new terminal** (click the + icon in the terminal tab), then run:

```bash
cd mobile
npm install
npx expo start --web
```

**Done!** The app will open in a new browser tab!

### Step 4: Login and Use

1. In the app, login with:
   - Username: `admin`
   - Password: `admin123`

2. Click the **Tickets** tab (🔧 icon at bottom)

3. Enter your maintenance credentials:
   - Username: `mbert`
   - Password: `Mbert2025!`

4. **You're done!** View and respond to tickets right in your browser!

---

## Use on Your Phone

From the Codespace:

1. Make sure `npx expo start` is running (not `--web`)
2. Look for the QR code in the terminal
3. Install "Expo Go" app on your phone
4. Scan the QR code
5. App loads on your phone!

---

## Alternative: Render.com (One-Click Deploy)

### Even easier - deploy directly from GitHub:

1. Go to: https://render.com
2. Sign up with your GitHub account
3. Click **"New +"** → **"Web Service"**
4. Connect `umchs-inventory` repo
5. Use these settings:
   - **Branch**: `claude/build-maintenance-data-app-011CUscmjmvnUx5whbekWWGb`
   - **Build Command**: `cd backend && npm install && npm run init-db && npm run create-admin`
   - **Start Command**: `cd backend && npm start`
   - **Environment**:
     ```
     NODE_ENV = production
     PORT = 5000
     JWT_SECRET = make-this-a-random-string
     ```
6. Click **"Create Web Service"**

Wait 3-5 minutes... **Your backend is deployed!**

You'll get a URL like: `https://umchs-maintenance.onrender.com`

### Then use the mobile app:

1. Go to GitHub Codespace (from option 1 above)
2. Create a file: `mobile/.env`
   ```
   EXPO_PUBLIC_API_URL=https://your-render-url.onrender.com/api
   ```
3. Run:
   ```bash
   cd mobile
   npm install
   npx expo start --web
   ```

Now your app connects to the cloud backend!

---

## 🎉 That's It!

You now have a fully functional maintenance ticket app running in the cloud, accessible from:
- Your company computer browser
- Your personal phone
- Any device with internet access

**No installation required on your PC!**

---

## Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend` directory
- Try: `npm install` again

**Mobile app can't connect:**
- Check the API URL in `mobile/src/services/api.js`
- Make sure backend is running (visit `/api/health`)

**Need help?**
- Check the full guide: `CLOUD_DEPLOYMENT.md`
- View logs in Codespace terminal
- Check Render.com dashboard for logs

---

## Next Steps

- **Bookmark your Codespace URL** for easy access
- **Save your Render backend URL**
- **Install Expo Go on your phone** for mobile access
- Share the app with your team!
