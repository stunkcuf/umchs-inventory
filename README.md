# 📦 Inventory Tracking System

A simple, accurate, and easy-to-use inventory management system with web and mobile apps.

## Features

✅ **Easy to Use** - Clean, intuitive interface
✅ **Accurate Tracking** - Real-time stock levels
✅ **Multi-Location** - Manage multiple warehouses/offices
✅ **Purchase Orders** - Track purchasing and budgets
✅ **Item Requests** - Locations can request items from each other
✅ **Stock Alerts** - Low stock and overstock notifications
✅ **Mobile App** - Manage inventory on the go
✅ **Web Dashboard** - Full-featured web interface

## System Components

1. **Backend API** - Node.js/Express server with SQLite database
2. **Web App** - React-based web interface
3. **Mobile App** - React Native mobile application

## Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the repository**
```bash
cd umchs-inventory
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install web dependencies
cd ../web
npm install

# Optional: Install mobile dependencies
cd ../mobile
npm install
```

3. **Set up the database**
```bash
cd backend
npm run init-db
```

4. **Create a default admin user**
You'll need to register the first admin user. We'll provide a script for this.

### Running the Application

**Start the Backend Server:**
```bash
cd backend
npm start
```
The API will run on http://localhost:5000

**Start the Web App (in a new terminal):**
```bash
cd web
npm start
```
The web app will open at http://localhost:3000

**Start the Mobile App (optional, in a new terminal):**
```bash
cd mobile
npm start
```
Follow the Expo instructions to run on your device.

## First-Time Setup

### 1. Create Admin User

After starting the backend, create your first admin user:

**Option A: Using curl**
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

**Option B: Using the web interface**
- Go to http://localhost:3000
- The login page will appear
- First, you need to create an admin account manually via the API (use Option A above)
- Then login with: `admin` / `admin123`

### 2. Create Locations

1. Login to the web app
2. Go to "Locations"
3. Click "+ Add Location"
4. Add your warehouse/office locations (e.g., "Main Warehouse", "Office Storage")

### 3. Add Items

1. Go to "Items"
2. Click "+ Add Item"
3. Fill in:
   - **Name**: Item name (e.g., "Copy Paper")
   - **SKU**: Stock keeping unit (optional)
   - **Category**: Item category (e.g., "Office Supplies")
   - **Unit**: Unit of measurement (box, unit, kg, etc.)
   - **Reorder Point**: When to reorder (e.g., 10)
   - **Unit Price**: Cost per unit

### 4. Set Up Inventory

1. Go to "Stock" (Inventory)
2. Select a location
3. Click "Adjust" on an item
4. Set initial stock quantity

## How to Use

### Managing Stock

**View Stock Levels:**
- Web: Go to "Stock" tab, select location
- Mobile: Tap "Stock" tab, select location

**Adjust Stock:**
- Click/tap "Adjust" on any item
- Enter positive number to add stock (+10)
- Enter negative number to remove stock (-5)
- Add a note explaining why

**Check Low Stock:**
- Dashboard shows low stock alerts
- Items below reorder point are highlighted

### Creating Purchase Orders

1. Go to "Purchases"
2. Click "+ New Purchase Order"
3. Fill in:
   - PO Number
   - Location
   - Vendor name
   - Add items and quantities
   - Optionally link to a budget
4. Click "Create Purchase Order"

**Mark as Received:**
- When items arrive, click "Mark Received"
- This automatically adds items to inventory

### Requesting Items Between Locations

**Location A needs items from Location B:**

1. Go to "Requests"
2. Click "+ New Request"
3. Select:
   - Item needed
   - Requesting location
   - Quantity
   - Priority (low/normal/high/urgent)
   - Reason
4. Submit request

**Approving Requests (Manager/Admin):**
1. View pending requests
2. Click "Approve" or "Reject"
3. For approved requests, click "Fulfill"
4. Enter source location ID
5. Items automatically transfer

### Managing Budgets

1. Go to "Purchases" section
2. Create budgets for locations/departments
3. Link purchase orders to budgets
4. Track spending against budget

## User Roles

- **Admin**: Full access to everything
- **Manager**: Can manage inventory, approve requests, create POs
- **User**: Can view inventory, create requests

## Mobile App Features

The mobile app provides:
- Quick stock viewing and adjustments
- Item requests on the go
- Low stock alerts
- Simple, touch-friendly interface
- (Coming soon: Barcode scanning)

## Database Structure

The system tracks:
- **Items**: Products/supplies in your catalog
- **Inventory**: Stock quantities by location
- **Locations**: Warehouses, offices, storage areas
- **Purchase Orders**: Orders for new stock
- **Item Requests**: Transfer requests between locations
- **Budgets**: Spending budgets by location/department
- **Transactions**: Complete audit trail of all stock movements

## Configuration

### Backend Configuration

Edit `backend/.env`:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
DB_PATH=./data/inventory.db
```

### Mobile App Configuration

Edit `mobile/src/services/api.js`:
```javascript
const API_URL = 'http://YOUR-SERVER-IP:5000/api';
```
Replace with your backend server's IP address.

## Tips for Accuracy

1. **Always use the adjustment feature** - Don't manually edit the database
2. **Add notes when adjusting stock** - Helps with auditing
3. **Set reorder points correctly** - Get alerts before running out
4. **Use SKUs** - Makes items easier to find
5. **Regular stock counts** - Verify physical inventory matches system

## Troubleshooting

**Can't login:**
- Make sure backend is running
- Check you created an admin user
- Verify username/password

**Items not showing:**
- Make sure you added items first
- Check correct location is selected

**Mobile app can't connect:**
- Update API_URL in mobile/src/services/api.js
- Use your computer's IP address, not localhost
- Make sure backend is running

**Database errors:**
- Run `npm run init-db` in backend folder
- Check backend/data/ folder exists

## Support

For issues or questions:
- Check this README
- Review the code comments
- The system is designed to be simple and self-explanatory

## Future Enhancements

- Barcode/QR scanning
- Export reports (CSV, PDF)
- Email notifications
- Multi-currency support
- Supplier management
- Advanced analytics

---

**Made with ❤️ for simple, accurate inventory tracking**
