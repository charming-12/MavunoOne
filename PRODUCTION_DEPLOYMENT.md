# MavunoOne - Production Deployment Guide

## 🚀 Quick Start

This guide helps you deploy MavunoOne to production environments.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (use Neon for managed database)
- Render, Vercel, or similar hosting platform
- Environment variables configured

## Environment Variables

Create a `.env.production` file with these variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# NextSMS Configuration
NEXTSMS_USERNAME=your_username
NEXTSMS_PASSWORD=your_password
NEXTSMS_TOKEN=your_token
NEXTSMS_API_URL=https://api.nextsms.com/sms/send
NEXTSMS_SENDER_ID=MAVUNO

# Authentication
MAVUNO_SUPER_ADMIN_EMAIL=admin@example.com
MAVUNO_SUPER_ADMIN_PASSWORD=secure_password_here
MAVUNO_BOSS_EMAIL=boss@example.com
MAVUNO_BOSS_PASSWORD=secure_password_here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_specific_password

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Database Setup

### 1. Create Database on Neon

```bash
# Visit https://console.neon.tech
# Create new project
# Copy DATABASE_URL from connection string
```

### 2. Run Migrations

```bash
# Install dependencies
npm install

# Run migrations
npm run db:push

# Seed initial data (optional)
npm run seed
```

## Deployment Options

### Option 1: Deploy on Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure**
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add all variables from `.env.production`
   - Render will automatically pick up `render.yaml`

4. **Deploy**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

### Option 2: Deploy on Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub project

2. **Configure**
   - Add environment variables
   - Set Node version to 18+

3. **Deploy**
   - Vercel automatically builds and deploys on push

### Option 3: Deploy with Docker

```dockerfile
# Create Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t mavunoone .
docker run -p 3000:3000 -e DATABASE_URL=... mavunoone
```

## Post-Deployment Checklist

- [ ] Database migrations successful
- [ ] Initial admin account created
- [ ] Email/SMS notifications working
- [ ] All API endpoints responding
- [ ] File uploads working
- [ ] PWA installed on test device
- [ ] Offline mode functioning
- [ ] Performance monitoring set up
- [ ] Error logging configured
- [ ] Security headers active

## Monitoring & Maintenance

### Health Checks

```bash
# Check API endpoint
curl https://your-domain.com/api/config/ready

# View logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → Logs
```

### Database Backups

**Neon Auto-Backups:**
- Automatically backs up every 24 hours
- Available in Neon console

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup.sql
```

### Performance Optimization

```bash
# Enable compression in next.config.ts
// Compression enabled by default in Next.js 13+

# Optimize images
# Use next/image component
# Enable WebP format
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update
npm update

# Test
npm run build
npm run test

# Deploy
git push origin main
```

## Security Hardening

### 1. Enable HTTPS
- Render/Vercel provide free SSL
- Enforce redirect: Add to `next.config.ts`

```typescript
redirects: async () => [
  {
    source: '/:path*',
    destination: 'https://your-domain.com/:path*',
    permanent: true,
  },
]
```

### 2. Add Rate Limiting
- Already configured in `lib/rate-limit.ts`
- Configure redis for production distribution

### 3. Set Security Headers
- Configured in `middleware.ts`
- CSP, X-Frame-Options, etc.

### 4. Rotate Credentials
```bash
# Change default passwords in .env
MAVUNO_SUPER_ADMIN_PASSWORD=new_secure_password
MAVUNO_BOSS_PASSWORD=new_secure_password
```

### 5. Enable 2FA (Future)
- Planned feature for admin accounts

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### SMS Not Sending
```bash
# Check NextSMS credentials
# Verify account balance
# Check phone number format (+255 for Tanzania)
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### High Memory Usage
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Or in platform config:
# Render: Increase Plan tier
# Vercel: Increase function memory
```

## Performance Targets

- **Page Load**: < 2 seconds
- **API Response**: < 200ms
- **Database Query**: < 100ms
- **Lighthouse Score**: > 85

## Backup Strategy

**Daily Backups:**
```bash
# Automated via Neon (free tier)
# Or schedule via cron:
0 2 * * * pg_dump $DATABASE_URL > /backups/backup-$(date +%Y%m%d).sql
```

**Retention Policy:**
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

## Disaster Recovery

**Restore from Backup:**
```bash
# Connect to backup database
psql backup_url < backup.sql

# Verify data
psql backup_url -c "SELECT COUNT(*) FROM users;"

# Switch DNS to backup URL
```

## Cost Optimization

| Service | Free Tier | Pro Tier |
|---------|-----------|----------|
| Render | 0.5GB RAM | $7+/month |
| Neon DB | 3GB storage | $20+/month |
| NextSMS | Pay-per-SMS | Volume discounts |
| **Total** | ~$20-40/month | ~$50-100/month |

## Getting Help

- GitHub Issues: [MavunoOne Issues](https://github.com/your-repo/issues)
- Email: support@mavunoone.com
- WhatsApp: Contact number from app

---

**Last Updated:** 2026-08-16
