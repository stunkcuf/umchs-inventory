# Quick Deploy to Fly.io

## Step 1: Create Volume (ONE TIME ONLY)

```bash
fly volumes create umchs_inventory_data --size 1 --region ams --app umchs-inventory-goypog
```

## Step 2: Set JWT Secret (ONE TIME ONLY)

Generate a secure secret:
```bash
openssl rand -base64 32
```

Set it:
```bash
fly secrets set JWT_SECRET="paste-the-generated-secret-here" --app umchs-inventory-goypog
```

## Step 3: Deploy

```bash
fly deploy --app umchs-inventory-goypog
```

## Step 4: Verify

```bash
# Check status
fly status --app umchs-inventory-goypog

# View logs
fly logs --app umchs-inventory-goypog

# Test health endpoint
curl https://umchs-inventory-goypog.fly.dev/api/health
```

## Default Login

Once deployed, login with:
- Username: `admin`
- Password: `admin123`

**Change this password immediately!**

## Troubleshooting

If deployment fails:

1. **Check logs:**
   ```bash
   fly logs --app umchs-inventory-goypog
   ```

2. **Verify volume exists:**
   ```bash
   fly volumes list --app umchs-inventory-goypog
   ```

3. **Check secrets:**
   ```bash
   fly secrets list --app umchs-inventory-goypog
   ```

4. **SSH into machine:**
   ```bash
   fly ssh console --app umchs-inventory-goypog
   ```

## Update App

After making code changes:

```bash
git add -A
git commit -m "Your changes"
git push
fly deploy --app umchs-inventory-goypog
```

## Your API URL

Your inventory API is available at:
```
https://umchs-inventory-goypog.fly.dev/api
```

Update web and mobile apps to use this URL!
