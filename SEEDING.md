# MavunoOne Database Seeding Guide

This guide explains how to seed the MavunoOne database with test credentials and sample data.

## Quick Start

### Local Development

```bash
# Load environment variables and seed database
npm run seed
```

This will:
- ✓ Create database tables (if not exist)
- ✓ Seed admin user: `admin@mavunoone.co.tz` / `Admin@Mavuno2026!`
- ✓ Seed boss user: `boss@mavunoone.co.tz` / `Boss@Mavuno2026!`
- ✓ Add sample data (products, customers, vehicles, sales, etc.)

---

## Production (Render.com)

### Step 1: Ensure DATABASE_URL is Set
Check your Render environment variables include `DATABASE_URL` pointing to your Neon database.

### Step 2: Run Seed via API (Recommended)

Use PowerShell on Windows:
```powershell
$url = "https://your-mavunoone-render-url.com"
Invoke-WebRequest -Uri "$url/api/seed" -Method POST
```

Or use curl:
```bash
curl -X POST https://your-mavunoone-render-url.com/api/seed
```

**Note:** The `/api/seed` endpoint is only available if `NODE_ENV !== 'production'` OR can be protected with authentication.

### Step 3: Verify Seeding

Open your app and login with:

**Admin Account:**
- Email: `admin@mavunoone.co.tz`
- Password: `Admin@Mavuno2026!`
- Role: Admin
- Access: `/office` (office dashboard)

**Boss Account:**
- Email: `boss@mavunoone.co.tz`
- Password: `Boss@Mavuno2026!`
- Role: Boss
- Access: `/boss` (boss dashboard)

---

## Seeding Multiple Times

**WARNING:** Running seed multiple times will:
- Delete existing data
- Recreate test users
- Reset all sample data

Only re-seed if you want to reset your database.

---

## Custom Credentials

To use custom credentials, update `.env`:

```bash
MAVUNO_SUPER_ADMIN_EMAIL=your-admin@example.com
MAVUNO_SUPER_ADMIN_PASSWORD=YourSecurePassword123!
MAVUNO_BOSS_EMAIL=your-boss@example.com
MAVUNO_BOSS_PASSWORD=BossPassword456!
```

Then re-seed:
```bash
npm run seed
```

---

## Environment Variables Required

For seeding to work, you need:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Admin credentials (used by seed)
MAVUNO_SUPER_ADMIN_EMAIL=admin@mavunoone.co.tz
MAVUNO_SUPER_ADMIN_PASSWORD=Admin@Mavuno2026!

# Boss credentials (used by seed)
MAVUNO_BOSS_EMAIL=boss@mavunoone.co.tz
MAVUNO_BOSS_PASSWORD=Boss@Mavuno2026!
```

---

## What Gets Seeded?

When you run the seed, the following data is created:

| Table | Records | Purpose |
|-------|---------|---------|
| users | 8 | Admin, Boss, and other roles |
| categories | 7 | Product categories (Mahindi, Alizeti, etc.) |
| products | 7 | Sample products with pricing |
| customers | 5 | Wholesale and retail customers |
| vehicles | 4 | Delivery vehicles |
| sales | 3 | Sample sales transactions |
| sale_items | 8 | Items within sales |
| stock_in | 3 | Inventory received records |
| deliveries | 3 | Delivery records |
| machine_jobs | 2 | Equipment maintenance |
| expenses | 4 | Operational expenses |
| notifications | 4 | System notifications |

---

## Troubleshooting

### Error: "DATABASE_URL is not set"
**Solution:** Ensure `.env` file exists with `DATABASE_URL` or set it in environment:
```bash
$env:DATABASE_URL='your-connection-string'
npm run seed
```

### Error: "relation does not exist"
**Solution:** Database tables haven't been created. Run migrations:
```bash
npx drizzle-kit push
```

### Error: "Failed to connect to database"
**Solution:** Verify:
1. DATABASE_URL is correct
2. Database server is accessible
3. Network allows connection (check Render firewall)

---

## API Seeding

The app exposes a seed endpoint:

**POST** `/api/seed`

### Response (Success):
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "users": 8,
    "products": 7,
    "customers": 5,
    ...
  }
}
```

### Response (Error):
```json
{
  "success": false,
  "message": "Failed to seed database",
  "error": "Error details..."
}
```

**Note:** This endpoint should be secured in production!

---

## Security Notes

⚠️ **Important for Production:**

1. **Change Default Passwords:** After seeding, immediately change default credentials
2. **Secure /api/seed:** Disable or protect the seed endpoint in production
3. **Use Strong Passwords:** Replace test passwords with strong, unique ones
4. **Environment Variables:** Store sensitive data in Render environment variables, NOT in code

---

## Support

For issues with seeding, check:
1. `.env` file has correct DATABASE_URL
2. Database is accessible and running
3. Node.js version is 18+ (`node --version`)
4. All dependencies installed (`npm install`)

Need help? Check the logs:
```bash
npm run seed 2>&1 | tail -50
```
