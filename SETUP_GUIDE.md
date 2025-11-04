# 📋 Complete Setup Guide

## Step-by-Step Installation

### Step 1: Install Node.js

If you don't have Node.js installed:
- Visit https://nodejs.org/
- Download and install the LTS version (16.x or higher)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize the database
npm run init-db

# You should see: "Database initialized successfully"
```

### Step 3: Create Admin User

With the backend still in the same terminal:

```bash
# Start the backend server
npm start
```

Open a NEW terminal window and run:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Or use a tool like Postman/Insomnia to make the POST request.

### Step 4: Set Up Web App

Open a NEW terminal window:

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start the web app
npm start
```

The web app will open automatically at http://localhost:3000

### Step 5: Login and Configure

1. **Login**
   - Username: `admin`
   - Password: `admin123`

2. **Add Locations**
   - Click "Locations" in the navigation
   - Click "+ Add Location"
   - Example locations:
     - Main Warehouse
     - Office Storage
     - Retail Floor

3. **Add Items**
   - Click "Items"
   - Click "+ Add Item"
   - Example items:
     ```
     Name: Copy Paper
     SKU: PAPER-001
     Category: Office Supplies
     Unit: box
     Reorder Point: 10
     Unit Price: 45.00
     ```

4. **Set Initial Stock**
   - Click "Stock"
   - Select a location
   - Click "Adjust" on an item
   - Enter quantity (e.g., +50)
   - Add note: "Initial inventory"

## Mobile App Setup (Optional)

### Step 1: Install Expo

```bash
npm install -g expo-cli
```

### Step 2: Set Up Mobile App

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install
```

### Step 3: Configure Backend URL

Edit `mobile/src/services/api.js`:

```javascript
// Change this line:
const API_URL = 'http://localhost:5000/api';

// To your computer's IP address:
const API_URL = 'http://192.168.1.100:5000/api';
```

To find your IP address:
- **Windows**: Run `ipconfig` in Command Prompt
- **Mac/Linux**: Run `ifconfig` or `ip addr`

### Step 4: Run Mobile App

```bash
npm start
```

Then:
- Scan QR code with Expo Go app (iOS/Android)
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator (Mac only)

## Common Issues and Solutions

### Backend won't start
- **Error**: Port 5000 in use
  - Solution: Change PORT in `backend/.env`
- **Error**: Database not found
  - Solution: Run `npm run init-db` in backend folder

### Web app won't connect
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify http://localhost:5000/api/health returns `{"status":"ok"}`

### Mobile app can't connect
- Use computer's IP address, not `localhost`
- Make sure phone and computer are on same WiFi
- Check firewall isn't blocking port 5000

### Can't create admin user
- Make sure backend is running first
- Check the command syntax carefully
- Verify the response shows success

## Next Steps

1. **Create more users**
   - Go to API and use register endpoint
   - Set role to "manager" or "user"

2. **Set up budgets**
   - Go to Purchases section
   - Create budgets for departments

3. **Configure reorder points**
   - Edit items to set appropriate reorder levels
   - System will alert when stock is low

4. **Train your team**
   - Show them how to adjust stock
   - Explain how to create requests
   - Demonstrate purchase orders

## Production Deployment

When deploying to production:

1. **Change JWT_SECRET** in backend/.env
2. **Use PostgreSQL or MySQL** instead of SQLite
3. **Enable HTTPS**
4. **Set strong passwords**
5. **Regular database backups**
6. **Set up proper user roles**

## Getting Help

- Read the main README.md
- Check API documentation in backend/README.md
- Review the code - it's designed to be readable
- All functions have clear names and comments
