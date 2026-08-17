# MavunoOne - Premium African Agribusiness Platform

A modern SaaS platform built with Next.js 16 for managing agribusiness operations across East Africa. Features include inventory management, sales tracking, vehicle logistics, equipment maintenance, and financial reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL/Neon database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/charming-12/MavunoOne.git
cd MavunoOne

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and credentials
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Database Setup

```bash
# Run migrations
npx drizzle-kit push

# Seed with test data and credentials
npm run seed
```

**Default Credentials:**
- **Admin:** `admin@mavunoone.co.tz` / `Admin@Mavuno2026!` → `/office`
- **Boss:** `boss@mavunoone.co.tz` / `Boss@Mavuno2026!` → `/boss`

See [SEEDING.md](./SEEDING.md) for detailed seeding instructions.

---

## 📦 Features

### Core Modules
- **Boss Dashboard** - Executive overview and quick actions
- **Office Portal** - Full administrative control
  - Inventory management (stock in/out)
  - Product catalog and categories
  - Customer management (wholesale & retail)
  - Sales transactions and POS
  - Expense tracking
  - Vehicle fleet management
  - Equipment/machine maintenance
  - Farmer networks
- **Shop Portal** - Customer-facing store
  - Product browsing and search
  - Shopping cart
  - Order management
  - Account settings

### Technical Features
- 🎨 **Dark Theme UI** with Tailwind CSS
- 🔐 **Role-Based Access Control** (8 user roles)
- 📊 **Real-time Analytics** with Charts
- 🗄️ **PostgreSQL Database** with Drizzle ORM
- 🔄 **tRPC APIs** for type-safe backend
- 📱 **Mobile-Responsive** Design
- 🌍 **Swahili Localization**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Dark Theme |
| **Backend** | Next.js API Routes, tRPC |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **Authentication** | Custom JWT-based (localStorage) |
| **Forms** | React Hook Form, Zod |
| **UI Components** | Radix UI, Lucide Icons |
| **Charts** | Recharts |
| **Deployment** | Render.com |

---

## 📋 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/database

# Authentication
MAVUNO_SUPER_ADMIN_EMAIL=admin@mavunoone.co.tz
MAVUNO_SUPER_ADMIN_PASSWORD=Admin@Mavuno2026!
MAVUNO_BOSS_EMAIL=boss@mavunoone.co.tz
MAVUNO_BOSS_PASSWORD=Boss@Mavuno2026!

# External Services
RESEND_API_KEY=your_resend_key
NEXTSMS_USERNAME=your_nextsms_username
NEXTSMS_PASSWORD=your_nextsms_password
NEXTSMS_TOKEN=your_nextsms_token

# Hardware Integration (Optional)
LIPA_NUMBER=your_m_pesa_number
LIPA_API_KEY=your_api_key
CCTV_IP=192.168.x.x
CCTV_USERNAME=camera_user
CCTV_PASSWORD=camera_pass
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run ESLint
npm run seed         # Seed database with test data
npm run seed:api     # Seed via API (Windows PowerShell)
```

---

## 📱 Access Points

| Route | Role | Purpose |
|-------|------|---------|
| `/` | Public | Landing page & marketing |
| `/login` | Public | Authentication |
| `/boss` | Boss/Owner | Executive dashboard |
| `/office` | Admin/Staff | Operations portal |
| `/shop` | Customer | E-commerce storefront |
| `/api/seed` | Admin | Database seeding |

---

## 🔄 Deployment (Render.com)

1. **Connect Repository:** Link your GitHub repo to Render
2. **Set Environment Variables:** Add all `.env` variables in Render dashboard
3. **Database:** Create PostgreSQL database (Neon recommended)
4. **Deploy:** Push to master branch or manually trigger

### First-Time Setup on Render:

```bash
# After deployment, seed the database
curl -X POST https://your-app.onrender.com/api/seed
```

See [SEEDING.md](./SEEDING.md) for production seeding details.

---

## 📚 Project Structure

```
mavunoone/
├── app/                    # Next.js app directory
│   ├── api/               # Backend APIs & endpoints
│   ├── boss/              # Boss dashboard routes
│   ├── office/            # Office portal routes
│   ├── shop/              # Customer shop routes
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
├── drizzle/              # Database schema (Drizzle ORM)
├── lib/                  # Utility functions & helpers
├── public/               # Static assets
├── scripts/              # Utility scripts (seeding, etc.)
├── server/               # tRPC server setup
├── providers/            # Context providers
└── drizzle.config.ts     # Drizzle configuration
```

---

## 🔐 Security Considerations

- ⚠️ **Change default passwords** after first deployment
- 🔒 **Use environment variables** for sensitive data
- 🛡️ **Enable HTTPS** in production
- 🚫 **Disable /api/seed** in production (or add authentication)
- 🔑 **Rotate API keys** regularly
- 🔐 **Store passwords securely** with bcryptjs hashing

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL
echo $env:DATABASE_URL  # PowerShell

# Test connection
psql $DATABASE_URL
```

### Seeding Fails
See [SEEDING.md](./SEEDING.md) troubleshooting section.

### Build Errors
```bash
npm install
npm run build
```

---

## 📝 License

Proprietary - MavunoOne Platform

---

## 👨‍💻 Development

### Making Changes
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: Add new feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Open a Pull Request

### Database Migrations
```bash
# Generate new migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push
```

---

## 🤝 Support

For issues or questions:
1. Check [SEEDING.md](./SEEDING.md) for database setup
2. Review environment variables in `.env`
3. Check Render deployment logs
4. Verify database connectivity

---

**Built with ❤️ for African agribusiness** 🌾🚜
