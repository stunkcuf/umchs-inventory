# Deployment Guide - Fly.io

## Prerequisites

- Fly.io account (sign up at https://fly.io)
- Fly CLI installed (`brew install flyctl` or visit https://fly.io/docs/hands-on/install-flyctl/)

## Initial Setup

### 1. Login to Fly.io

```bash
fly auth login
```

### 2. Create the app (if not already created)

```bash
fly apps create umchs-inventory-goypog
```

### 3. Create a persistent volume for the database

```bash
fly volumes create umchs_inventory_data --size 1 --region ams
```

### 4. Set environment secrets

Set a strong JWT secret (IMPORTANT for security):

```bash
fly secrets set JWT_SECRET="your-very-secure-random-secret-key-here"
```

Generate a secure secret with:
```bash
openssl rand -base64 32
```

## Deploy

### Deploy the application

```bash
fly deploy
```

This will:
1. Build the Docker container
2. Initialize the database (via release_command)
3. Create the default admin user
4. Start the API server

### Check deployment status

```bash
fly status
fly logs
```

## Access Your Application

Your API will be available at:
```
https://umchs-inventory-goypog.fly.dev
```

Test the health endpoint:
```bash
curl https://umchs-inventory-goypog.fly.dev/api/health
```

## Default Login

After deployment, you can login with:
- Username: `admin`
- Password: `admin123`

**IMPORTANT**: Change the admin password immediately after first login!

## Database Management

### View the database

SSH into the machine:
```bash
fly ssh console
cd /data
ls -la
```

### Backup the database

```bash
fly ssh sftp get /data/inventory.db ./backup-inventory.db
```

### Restore a backup

```bash
fly ssh sftp shell
put ./backup-inventory.db /data/inventory.db
```

## Monitoring

### View logs

```bash
fly logs
```

### Monitor metrics

```bash
fly dashboard
```

### Scale the application

```bash
# Increase memory
fly scale memory 512

# Add more machines
fly scale count 2
```

## Updating the Application

1. Make changes to your code
2. Commit changes
3. Deploy:

```bash
git add -A
git commit -m "Your update message"
fly deploy
```

## Environment Variables

Current environment variables set in fly.toml:
- `PORT=8080`
- `NODE_ENV=production`
- `DB_PATH=/data/inventory.db`

Secrets (set via `fly secrets`):
- `JWT_SECRET` - Your JWT secret key

## Troubleshooting

### App won't start

Check logs:
```bash
fly logs
```

Common issues:
- Missing JWT_SECRET: Set it with `fly secrets set JWT_SECRET="your-key"`
- Database not initialized: Check release_command ran successfully
- Port mismatch: Ensure PORT=8080 in environment

### Database issues

Reset database:
```bash
fly ssh console
rm /data/inventory.db
exit
fly deploy --strategy immediate
```

### Connection issues

Check app status:
```bash
fly status
```

Verify health endpoint:
```bash
curl https://umchs-inventory-goypog.fly.dev/api/health
```

## Connecting the Web/Mobile Apps

### Web App

Update `web/src/services/api.js`:

```javascript
const API_URL = 'https://umchs-inventory-goypog.fly.dev/api';
```

### Mobile App

Update `mobile/src/services/api.js`:

```javascript
const API_URL = 'https://umchs-inventory-goypog.fly.dev/api';
```

Deploy the web app to:
- Netlify
- Vercel
- Fly.io (separate app)

## Security Recommendations

1. **Change default admin password immediately**
2. **Set a strong JWT_SECRET**
3. **Enable CORS only for your frontend domains**
4. **Regular database backups**
5. **Monitor access logs**
6. **Keep dependencies updated**

## Cost Optimization

Free tier includes:
- Up to 3 shared-cpu-1x 256mb VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

To stay within free tier:
- Set `auto_stop_machines = true` (already configured)
- Set `min_machines_running = 0` (already configured)
- Machines will auto-stop when idle

## Support

For Fly.io specific issues:
- Documentation: https://fly.io/docs/
- Community: https://community.fly.io/

For app issues:
- Check the main README.md
- Review application logs
