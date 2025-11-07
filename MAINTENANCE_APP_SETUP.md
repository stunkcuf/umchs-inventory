# Maintenance Ticket App - Setup Guide

This app integrates with the IMESD Maintenance System (https://maintenance.imesd.k12.or.us/) to provide a mobile-friendly interface for viewing and responding to maintenance tickets.

## Features

- View all maintenance tickets in a user-friendly mobile interface
- View detailed ticket information including status, priority, and comments
- Respond to tickets directly from your phone
- Push notifications for new tickets (checks every 5 minutes)
- Secure credential storage
- Automatic authentication with the maintenance system

## Prerequisites

- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device with Expo Go app)
- IMESD Maintenance System credentials

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Create an admin user:
   ```bash
   npm run create-admin
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:5000

## Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `mobile/src/services/api.js`:
   - For local development, use: `http://localhost:5000/api`
   - For production, replace with your deployed backend URL

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Scan the QR code with:
   - iOS: Camera app (will open in Expo Go)
   - Android: Expo Go app

## First Time Usage

1. **Login to the App**
   - Use your inventory system credentials (default: admin / admin123)
   - This authenticates you with the inventory backend

2. **Login to Maintenance System**
   - Navigate to the "Tickets" tab
   - You'll be prompted to enter your IMESD maintenance credentials
   - Your credentials:
     - Username: `mbert`
     - Password: `Mbert2025!`
   - These credentials are stored securely and will be used for automatic authentication

3. **View Tickets**
   - After logging in, you'll see all your maintenance tickets
   - Pull down to refresh the list
   - Tap any ticket to view details

4. **Respond to Tickets**
   - Open a ticket detail page
   - Type your response in the text field at the bottom
   - Tap "Send Response" to submit

5. **Receive Notifications**
   - The app will prompt you for notification permissions
   - Grant permissions to receive alerts for new tickets
   - The app checks for new tickets every 5 minutes

## Architecture

### Backend Components

- **MaintenanceService** (`backend/src/services/maintenanceService.js`)
  - Handles authentication with the IMESD maintenance system
  - Scrapes ticket data from the maintenance portal
  - Posts responses to tickets

- **MaintenanceController** (`backend/src/controllers/maintenanceController.js`)
  - API endpoints for the mobile app
  - Manages user credentials
  - Auto-authentication with stored credentials

- **Routes** (`backend/src/routes/maintenance.js`)
  - `/api/maintenance/login` - Login to maintenance system
  - `/api/maintenance/auth/status` - Check authentication status
  - `/api/maintenance/tickets` - Get all tickets
  - `/api/maintenance/tickets/:id` - Get ticket details
  - `/api/maintenance/tickets/:id/respond` - Post a response

### Mobile Components

- **API Service** (`mobile/src/services/api.js`)
  - Axios client for backend communication
  - Handles authentication tokens

- **Notification Service** (`mobile/src/services/notificationService.js`)
  - Manages push notifications
  - Polls for new tickets
  - Schedules notifications

- **Screens**
  - `MaintenanceTicketsScreen` - Lists all tickets
  - `MaintenanceTicketDetailScreen` - Shows ticket details and response form
  - `MaintenanceLoginScreen` - Login form for maintenance credentials

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
DATABASE_PATH=./inventory.db
```

### Mobile API Configuration

Update `mobile/src/services/api.js`:

```javascript
const API_URL = 'YOUR_BACKEND_URL/api';
```

## Troubleshooting

### Backend Issues

1. **Database not initialized**
   ```bash
   cd backend && npm run init-db
   ```

2. **Port already in use**
   - Change PORT in `.env` file
   - Kill the process using port 5000: `lsof -ti:5000 | xargs kill`

3. **Maintenance login fails**
   - Verify credentials are correct
   - Check network connectivity to https://maintenance.imesd.k12.or.us/
   - Review backend logs for detailed error messages

### Mobile Issues

1. **Cannot connect to backend**
   - Ensure backend is running
   - For physical devices, use your computer's IP address instead of localhost
   - Check that both devices are on the same network

2. **Notifications not working**
   - Ensure app has notification permissions
   - Check that Expo Go app has permissions in device settings
   - Notifications work differently on iOS vs Android

3. **App crashes on startup**
   - Clear Expo cache: `expo start -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## Security Considerations

- Maintenance credentials are stored in the backend database (consider encryption for production)
- All API requests require JWT authentication
- Credentials are transmitted over HTTPS (ensure backend uses SSL in production)
- Session cookies are managed securely by the MaintenanceService

## Future Enhancements

- [ ] Implement credential encryption in database
- [ ] Add ticket filtering and search
- [ ] Support for creating new tickets
- [ ] File attachment support
- [ ] Offline mode with data synchronization
- [ ] Real-time notifications using WebSockets
- [ ] Biometric authentication
- [ ] Dark mode support

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs: `cd backend && npm start`
- Review mobile logs in Expo Dev Tools

## License

MIT License - See LICENSE file for details
