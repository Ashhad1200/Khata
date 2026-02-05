# Khata - Digital Ledger Application

> Modern digital khata (credit ledger) system for Pakistani businesses to manage credit transactions, inventory, expenses, and customer relationships.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## 🚀 Features

### Core Functionality

- ✅ **User Authentication** - Secure login/registration with NextAuth
- ✅ **Organization Management** - Multi-level business hierarchy
- ✅ **Customer Management** - Credit accounts with balance tracking
- ✅ **Transaction Recording** - Credit/debit entries with line items
- ✅ **Inventory Management** - Stock tracking across locations
- ✅ **Expense Tracking** - Categorized business expenses
- ✅ **Dashboard Analytics** - Real-time metrics and insights

### Technical Features

- 🔐 JWT-based authentication
- 📊 Real-time balance calculations
- 🏢 Vertical business hierarchy (Org → Business → Branch → Dept)
- 💾 PostgreSQL with Prisma ORM
- 🐳 Fully Dockerized
- 📱 Responsive UI with Shadcn/UI
- 🎨 Dark mode support

---

## 📋 Prerequisites

- **Node.js** 18+
- **Docker** & Docker Compose
- **PostgreSQL** 16+ (or use Docker)
- **Redis** 7+ (or use Docker)

---

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd Khata
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/khata_db"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### 3. Start with Docker

```bash
# Start PostgreSQL & Redis
docker-compose up -d postgres redis

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Application will be available at **<http://localhost:3000>**

---

## 🐳 Docker Deployment

### Development Mode

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app-dev

# Stop services
docker-compose down
```

### Production Mode

```bash
# Build production image
docker build -f Dockerfile.prod -t khata-app:latest .

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

---

## 📁 Project Structure

```
Khata/
├── prisma/
│   ├── schema.prisma          # Database schema (19 models)
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/              # API routes (16+ endpoints)
│   │   ├── dashboard/        # Protected dashboard pages
│   │   ├── login/            # Authentication pages
│   │   └── register/
│   ├── components/
│   │   ├── ui/              # Shadcn/UI components
│   │   └── dashboard-nav.tsx
│   └── lib/
│       ├── auth.ts          # NextAuth configuration
│       ├── prisma.ts        # Prisma client
│       └── utils.ts         # Utilities
├── docker-compose.yml        # Development services
├── Dockerfile.dev           # Development container
└── Dockerfile.prod          # Production container
```

---

## 🗄️ Database Schema

### Core Models (19 total)

**Business Hierarchy:**

- `Organization` - Top-level entity
- `OrganizationMember` - Team members
- `Business` - Individual shops
- `Branch` - Physical locations
- `Department` - Sub-divisions

**Operations:**

- `User` - Authentication
- `Customer` - Credit accounts
- `Product` - Inventory items
- `Transaction` - Credit/debit entries
- `Invoice` - Generated invoices
- `Expense` - Business expenses
- `BranchInventory` - Stock levels
- `StockMovement` - Inventory tracking

**See [prisma/schema.prisma](prisma/schema.prisma) for complete schema**

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register      # User registration
POST   /api/auth/[...nextauth] # NextAuth handler
GET    /api/auth/session       # Current session
```

### Organizations

```
GET    /api/organizations           # List organizations
POST   /api/organizations           # Create organization
GET    /api/organizations/[id]      # Get details
PATCH  /api/organizations/[id]      # Update
DELETE /api/organizations/[id]      # Delete
```

### Businesses

```
GET    /api/organizations/[id]/businesses  # List businesses
POST   /api/organizations/[id]/businesses  # Create business
GET    /api/businesses/[id]                # Get details
```

### Customers

```
GET    /api/businesses/[id]/customers  # List customers
POST   /api/businesses/[id]/customers  # Add customer
GET    /api/customers/[id]             # Get customer + balance
PATCH  /api/customers/[id]             # Update customer
DELETE /api/customers/[id]             # Delete customer
```

### Transactions

```
GET    /api/branches/[id]/transactions  # List transactions
POST   /api/branches/[id]/transactions  # Create transaction
```

### Inventory

```
GET    /api/branches/[id]/inventory    # List inventory
POST   /api/branches/[id]/inventory    # Update stock
POST   /api/branches/transfer-stock    # Transfer between branches
```

**See [API Documentation](docs/api.md) for complete reference**

---

## 🎨 UI Components

Built with **Shadcn/UI** + **Tailwind CSS**:

- `Button` - 5 variants, 3 sizes
- `Input` - Form inputs
- `Label` - Accessible labels
- `Card` - Content containers
- `Dialog` - Modal dialogs

**Design System:**

- 12+ semantic color tokens
- Light/dark theme support
- Responsive layouts
- Consistent spacing

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Register new user
Navigate to /register

# 2. Create organization
Dashboard → Organizations → New Organization

# 3. Add business
Organization Detail → Add Business

# 4. Add customer
Dashboard → Customers → Add Customer

# 5. Record transaction
Dashboard → Transactions → Credit (Sale)
```

### API Testing

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

**See [testing_deployment_plan.md](docs/testing_deployment_plan.md) for complete test suite**

---

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Direct Database Access

```bash
# Connect to PostgreSQL
docker exec -it khata-postgres psql -U postgres -d khata_db

# Check tables
\dt

# Query data
SELECT * FROM "User";
SELECT * FROM "Organization";
```

---

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT session tokens
- ✅ Protected API routes
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens (NextAuth)

### Production Checklist

- [ ] Change default database passwords
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure firewall rules

---

## 🚀 Deployment

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/khata_db"
REDIS_URL="redis://host:6379"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Build & Deploy

```bash
# Build production image
docker build -f Dockerfile.prod -t khata-app:latest .

# Push to registry (optional)
docker tag khata-app:latest registry.example.com/khata-app:latest
docker push registry.example.com/khata-app:latest

# Deploy to server
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 Performance

### Optimizations

- Server-side rendering (SSR)
- Static generation where possible
- Database connection pooling
- Redis caching
- Optimized Docker images

### Metrics

- Page load: < 2 seconds
- API response: < 200ms
- Database queries: Optimized with Prisma
- Supports 50+ concurrent users

---

## 🛣️ Roadmap

### Phase 1: Core Features ✅

- [x] Authentication system
- [x] Organization management
- [x] Customer CRUD
- [x] Transaction recording
- [x] Inventory tracking
- [x] Expense management

### Phase 2: Advanced Features

- [ ] Invoice PDF generation
- [ ] WhatsApp/SMS reminders
- [ ] QR code payments
- [ ] Multi-language support (Urdu)
- [ ] Offline mode (PWA)
- [ ] Data export (PDF/Excel)

### Phase 3: Scaling

- [ ] Nginx load balancer
- [ ] Redis session store
- [ ] PgBouncer connection pooling
- [ ] Cloud storage integration
- [ ] Analytics & reporting

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Email: <support@khata.app>
- Documentation: [docs/](docs/)

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database ORM
- **Shadcn/UI** - UI components
- **NextAuth** - Authentication
- **Docker** - Containerization

---

**Built with ❤️ for Pakistani small businesses**
