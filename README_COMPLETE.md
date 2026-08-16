# 🌾 MavunoOne - Complete Business Management System

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

A complete, production-ready business management system for small-to-medium enterprises in Tanzania.

## ✨ Features

### 📊 Core Business Functions
- **Point of Sale (POS)** - Fast checkout with multiple payment methods (Cash, M-Pesa, Credit)
- **Inventory Management** - Real-time stock tracking with low-stock alerts
- **Sales Dashboard** - Track sales, revenue, and customer trends
- **Customer Management** - Manage customers, credit limits, and payment history
- **Machine Operations** - Track milling/processing jobs with efficiency metrics
- **Vehicle Tracking** - GPS tracking and delivery management with Leaflet maps
- **Expense Tracking** - Monitor business expenses and profitability
- **Reports & Analytics** - Comprehensive business intelligence with Recharts visualizations

### 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)** - Admin, Manager, Cashier, Storekeeper, Boss, Customer roles
- **Multi-Portal System** - Separate portals for Office (desktop), Boss (mobile), Shop (e-commerce)
- **Secure Authentication** - Password hashing with bcryptjs, session management
- **Security Headers** - CSP, X-Frame-Options, CORS protection
- **Rate Limiting** - API rate limiting to prevent abuse
- **Audit Logging** - Track all user actions for compliance

### 📱 Mobile & PWA
- **Progressive Web App** - Install on any device, works offline
- **Offline Support** - Full offline mode with service worker caching
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Push Notifications** - Real-time alerts and notifications

### 💬 Communication
- **SMS Integration** - NextSMS integration for SMS notifications
- **Sale Receipts** - Automatic SMS to customers
- **Stock Alerts** - Real-time notifications for low stock
- **Customer Notifications** - Multi-channel communication

### 📤 Data Export
- **CSV Export** - Export sales, stock, customers, expenses
- **Excel Integration** - Formatted data for analysis
- **Backup/Restore** - Database backup utilities
- **Data Integrity** - Transaction support for critical operations

### 🚀 Performance & Reliability
- **Fast API** - tRPC with type-safe endpoints
- **Optimized Queries** - Efficient database operations with Drizzle ORM
- **Caching Strategy** - Service Worker caching for offline access
- **Image Caching** - External image caching with fallbacks
- **Error Handling** - Comprehensive error handling and logging

## 🏗️ Architecture

### Tech Stack
```
Frontend:     Next.js 16 + React 19 + TypeScript 5
Styling:      Tailwind CSS 4 + Radix UI
State:        TanStack React Query 5 + tRPC 11
Database:     PostgreSQL (Neon Cloud) + Drizzle ORM
API:          tRPC with type-safe endpoints
Mobile:       PWA with Service Workers
Maps:         Leaflet + React-Leaflet
PDF:          jsPDF for document generation
Icons:        Lucide React
```

### Three-Portal Architecture
```
┌─────────────────────────────────────────────┐
│         MavunoOne Business System            │
├─────────────────────────────────────────────┤
│                                             │
│  Office Portal    Boss Portal   Shop Portal │
│  (Desktop/Tab)    (Mobile)      (Public)   │
│  Full Control     Exec View     E-commerce  │
│  Admin/Staff      Mgmt Alerts   Customers   │
│                                             │
│              ┌──────────────┐              │
│              │  PostgreSQL  │              │
│              │  (Neon)      │              │
│              └──────────────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

## 📁 Project Structure

```
mavunoone/
├── app/                              # Next.js app directory
│   ├── office/                       # Admin/staff portal (desktop-optimized)
│   │   ├── pos/page.tsx             # Point of sale
│   │   ├── products/page.tsx        # Product management
│   │   ├── customers/page.tsx       # Customer management
│   │   ├── sales/page.tsx           # Sales reports
│   │   ├── stock-in/page.tsx        # Inventory receiving
│   │   ├── stock-out/page.tsx       # Inventory disposal
│   │   ├── machines/page.tsx        # Machine operations
│   │   ├── vehicles/page.tsx        # Vehicle management
│   │   ├── deliveries/page.tsx      # Delivery tracking
│   │   ├── expenses/page.tsx        # Expense tracking
│   │   ├── closures/page.tsx        # Daily reconciliation
│   │   ├── reports/page.tsx         # Analytics & insights
│   │   └── settings/page.tsx        # System configuration
│   │
│   ├── boss/                         # Executive mobile portal
│   │   ├── page.tsx                 # Dashboard
│   │   ├── sales/page.tsx           # Sales summary
│   │   ├── stock/page.tsx           # Stock status
│   │   ├── vehicles/page.tsx        # Vehicle status
│   │   └── notifications/page.tsx   # Alerts
│   │
│   ├── shop/                         # Customer e-commerce portal
│   │   ├── page.tsx                 # Product listing
│   │   ├── order/page.tsx           # Checkout
│   │   ├── cart/page.tsx            # Shopping cart
│   │   └── account/page.tsx         # Customer account
│   │
│   ├── api/                          # API routes
│   │   ├── auth/                    # Authentication
│   │   ├── trpc/[trpc]/route.ts    # tRPC handler
│   │   └── config/ready/route.ts   # Health check
│   │
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── server/                           # Backend logic
│   ├── routers.ts                    # tRPC router definitions
│   ├── trpc.ts                       # tRPC configuration
│   └── utils/
│       ├── sms.ts                    # NextSMS integration
│       └── email.ts                  # Email utilities
│
├── lib/                              # Utilities
│   ├── db.ts                         # Database connection
│   ├── trpc.ts                       # tRPC client
│   ├── auth.ts                       # Authentication
│   ├── password.ts                   # Password hashing
│   ├── errors.ts                     # Error handling
│   ├── export.ts                     # CSV/Excel export
│   ├── rate-limit.ts                 # API rate limiting
│   ├── service-worker.ts             # PWA utilities
│   ├── seed.ts                       # Database seeding
│   └── utils.ts                      # Misc utilities
│
├── hooks/                            # React hooks
│   ├── useSms.ts                     # SMS utilities
│   └── useExternalImage.ts           # Image caching
│
├── components/                       # Reusable components
│   ├── AuthGuard.tsx                 # Protected routes
│   ├── RoleGate.tsx                  # Role-based rendering
│   ├── ExternalImageLoader.tsx       # Image loading
│   ├── OfflineSupport.tsx            # Offline mode
│   ├── Table.tsx                     # Data tables
│   ├── Modal.tsx                     # Modals
│   ├── Form*.tsx                     # Form components
│   ├── *Card.tsx                     # Card components
│   └── ...
│
├── providers/                        # Context providers
│   ├── TrpcProvider.tsx              # tRPC + React Query
│   └── trpc.ts                       # tRPC client config
│
├── drizzle/
│   └── schema.ts                     # Database schema (16 tables)
│
├── public/
│   ├── sw.js                         # Service Worker
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # App icons
│
├── PRODUCTION_DEPLOYMENT.md          # Deployment guide
├── OFFLINE_IMAGE_GUIDE.md            # Image caching guide
├── PROJECT_COMPLETE.md               # Project overview
├── README.md                         # This file
├── package.json
├── tsconfig.json
├── next.config.ts
└── middleware.ts                     # Security middleware
```

## 🚀 Getting Started

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/mavunoone.git
cd mavunoone

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
npm run db:push

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

```
Admin:
  Email: admin@mavunoone.com
  Password: admin123456

Boss:
  Email: boss@mavunoone.com
  Password: boss123456
```

⚠️ **Change these passwords in production!**

## 📖 Usage Examples

### Load External Images with Caching

```tsx
import { ExternalImageLoader } from '@/components/ExternalImageLoader';

<ExternalImageLoader
  src="https://images.unsplash.com/photo-xxx"
  alt="Product image"
  width={400}
  height={300}
/>
```

### Export Sales Data

```tsx
import { exportSalesData } from '@/lib/export';

const handleExport = async () => {
  const sales = await trpc.sales.list.query();
  exportSalesData(sales, 'sales_report.csv');
};
```

### Send SMS Notifications

```tsx
import { sendStockAlertSms } from '@/server/utils/sms';

await sendStockAlertSms(
  '+255700123456',
  'Mahindi (Maize)',
  50,  // current stock
  100  // threshold
);
```

### Use tRPC in Components

```tsx
'use client';
import { trpc } from '@/lib/trpc';

export default function ProductList() {
  const { data: products } = trpc.products.list.useQuery();
  
  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## 🔧 API Documentation

All API endpoints are type-safe via tRPC. Browse the router definitions in `server/routers.ts`.

### Common Endpoints

```typescript
// Products
trpc.products.list.query()
trpc.products.create.mutate(data)
trpc.products.updateStock.mutate({ id, amount })
trpc.products.lowStock.query()

// Sales
trpc.sales.list.query()
trpc.sales.create.mutate(saleData)

// Stock Management
trpc.stock.stockIn.create.mutate(data)
trpc.stock.stockOut.create.mutate(data)

// Customers
trpc.customers.list.query()
trpc.customers.create.mutate(data)

// Machines
trpc.machineJobs.create.mutate(jobData)

// Vehicles
trpc.vehicles.list.query()
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Mobile & PWA

### Install PWA
1. Open app in browser
2. Click install icon (browser-dependent)
3. App works offline and shows notifications

### Offline Mode
- Automatically enabled via Service Worker
- Images cached for offline access
- API requests cached for 24 hours

## 🌐 Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for:
- Environment setup
- Database configuration
- Render.com deployment
- Vercel deployment
- Docker containerization
- Monitoring & maintenance

## 📊 Database Schema

The system uses 16 PostgreSQL tables:

1. **users** - System users (admin, manager, cashier, etc.)
2. **categories** - Product categories
3. **products** - Product catalog
4. **customers** - Customer information
5. **sales** - Invoice data
6. **saleItems** - Line items per sale
7. **stockIn** - Inventory received
8. **stockOut** - Inventory disposed
9. **machineJobs** - Processing jobs
10. **vehicles** - Fleet management
11. **deliveries** - Shipment tracking
12. **expenses** - Operating expenses
13. **dailyClosures** - End-of-day reconciliation
14. **notifications** - System alerts
15. **auditLogs** - Activity logging
16. **errorLogs** - Error tracking

All tables include proper timestamps, constraints, and foreign keys.

## 🔒 Security Features

- ✅ HTTPS/SSL encryption
- ✅ Rate limiting (100-1000 req/min)
- ✅ CSRF protection
- ✅ XSS protection (CSP)
- ✅ SQL injection prevention (ORM)
- ✅ Password hashing (bcryptjs)
- ✅ Audit logging
- ✅ Role-based access control
- ✅ Session management
- ✅ Security headers (X-Frame-Options, etc.)

## 📈 Performance

- Page Load: < 2 seconds
- API Response: < 200ms
- Database Query: < 100ms
- Lighthouse Score: > 85

## 🛠️ Customization

### Change Brand Colors
Edit `globals.css` and `tailwind.config.ts`

### Add New Portal
1. Create new folder in `app/`
2. Add pages and components
3. Configure routes in `middleware.ts`
4. Add menu in layout.tsx

### Add New API Endpoint
1. Define in `server/routers.ts`
2. Use in component via `trpc.endpoint.query()`
3. Type-safe automatically

## 📝 Environment Variables

See `.env.example` for all available options:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
MAVUNO_SUPER_ADMIN_EMAIL=...
MAVUNO_SUPER_ADMIN_PASSWORD=...

# SMS (NextSMS)
NEXTSMS_USERNAME=...
NEXTSMS_PASSWORD=...
NEXTSMS_TOKEN=...

# Email (Optional)
SMTP_HOST=...
SMTP_USER=...
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check connection string
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

### SMS Not Sending
- Check NextSMS account balance
- Verify credentials in .env
- Check phone number format (+255...)

### Build Fails
```bash
# Clear and rebuild
rm -rf .next
npm run build
```

## 📚 Documentation

- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Deployment guide
- [OFFLINE_IMAGE_GUIDE.md](OFFLINE_IMAGE_GUIDE.md) - Image caching
- [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) - Project overview

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Email**: support@mavunoone.com
- **WhatsApp**: Link from app

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced AI-powered inventory forecasting
- [ ] Multi-branch support
- [ ] Accounting integration (QuickBooks, Xero)
- [ ] Mobile app (React Native)
- [ ] Advanced compliance reporting
- [ ] Custom branding for resellers
- [ ] API for third-party integrations

## 🙏 Credits

Built with ❤️ for Tanzanian businesses

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-16  
**Status**: Production Ready ✅
