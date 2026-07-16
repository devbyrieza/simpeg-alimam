# Development Guide - PPDB Al Imam

## 🚀 Quick Start

### Local Development (Recommended for Daily Work)

```bash
# 1. Start local database (optional - atau connect ke staging DB)
docker-compose -f docker-compose.dev.yml up -d

# 2. Copy environment variables
cp .env.example .env.local

# 3. Update .env.local with your settings
# DATABASE_URL="postgresql://ppdb_user:ppdb_password123@localhost:5432/ppdb_alimam_dev"

# 4. Run migrations
pnpm prisma migrate dev

# 5. Seed database (optional)
pnpm prisma db seed

# 6. Start development server
pnpm dev
```

**Access**: http://localhost:3000

**Features**:
- ✅ Hot reload (instant changes)
- ✅ Fast feedback loop
- ✅ No deployment needed
- ✅ Safe to experiment

---

## 🌍 Environments

### 1. Local Development
- **URL**: http://localhost:3000
- **Database**: Local PostgreSQL (via Docker) or connect to staging
- **Deploy**: Not needed (instant)
- **Use**: Daily coding and quick testing

### 2. Staging (Coming Soon)
- **URL**: http://staging.pesantren-alimam.com
- **Database**: Staging database
- **Deploy**: Auto from `staging` branch
- **Use**: Feature testing before production

### 3. Production
- **URL**: https://pesantren-alimam.com
- **Database**: Production database
- **Deploy**: Auto from `main` branch
- **Use**: Real users only

---

## 📝 Development Workflow

### Daily Development
```bash
# 1. Start local dev server
pnpm dev

# 2. Make changes → See results instantly at localhost:3000

# 3. Test locally until satisfied

# 4. Commit changes
git add .
git commit -m "feat: your feature description"

# 5. Push to staging (when ready for testing)
git push origin staging

# 6. Test at staging.pesantren-alimam.com

# 7. Push to production (when everything works)
git checkout main
git merge staging
git push origin main
```

### Quick Testing Without Deploy
```bash
# Just run pnpm dev and test at localhost:3000
# No need to deploy to production anymore!
```

---

## 🗄️ Database Options

### Option A: Local Database (Recommended)
```bash
# Start local PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# Stop when done
docker-compose -f docker-compose.dev.yml down
```

**Pros**: Full control, fast, offline-capable  
**Cons**: Need to manage data yourself

### Option B: Connect to Staging Database
Update `.env.local`:
```env
DATABASE_URL="postgresql://[staging-db-url]"
```

**Pros**: Real data, no setup  
**Cons**: Slower, need internet, shared with staging

---

## 🔧 Common Commands

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter
```

### Database
```bash
pnpm prisma migrate dev       # Run migrations
pnpm prisma db push           # Push schema changes
pnpm prisma studio            # Open database GUI
pnpm prisma generate          # Regenerate Prisma Client
```

### Docker
```bash
# Local database
docker-compose -f docker-compose.dev.yml up -d    # Start
docker-compose -f docker-compose.dev.yml down     # Stop
docker-compose -f docker-compose.dev.yml logs     # View logs

# Production build test
docker build -t pp-alimam:test .
docker run -p 3000:3000 pp-alimam:test
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Or use different port
PORT=3001 pnpm dev
```

### Database connection failed
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps

# Restart database
docker-compose -f docker-compose.dev.yml restart

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres_dev
```

### Prisma Client out of sync
```bash
pnpm prisma generate
```

### Hot reload not working
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

---

## 📦 Environment Variables

### .env.local (Local Development)
```env
# Database
DATABASE_URL="postgresql://ppdb_user:ppdb_password123@localhost:5432/ppdb_alimam_dev"
PRISMA_CLIENT_ENGINE_TYPE="library"

# Wablas (use simulation mode)
WABLAS_DOMAIN="https://jkt.wablas.com"
WABLAS_TOKEN="test_token"
WABLAS_SECRET_KEY="test_secret"
SKIP_WHATSAPP_OTP="true"  # Bypass real OTP

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Staging (Coolify Dashboard)
```env
DATABASE_URL="[staging-database-url]"
WABLAS_TOKEN="52uAU5EigOWgiGE0Iiz0giVET41xuXNvNXKeR2NBJP76AvQ9lRFSyi6"
WABLAS_SECRET_KEY="HCRURtX1"
SKIP_WHATSAPP_OTP="false"
```

### Production (Coolify Dashboard)
```env
DATABASE_URL="[production-database-url]"
WABLAS_TOKEN="52uAU5EigOWgiGE0Iiz0giVET41xuXNvNXKeR2NBJP76AvQ9lRFSyi6"
WABLAS_SECRET_KEY="HCRURtX1"
```

---

## 🎯 Best Practices

### DO ✅
- Test locally first with `pnpm dev`
- Use staging for feature testing
- Only deploy to production when staging works
- Commit often with clear messages
- Use branches for features

### DON'T ❌
- Don't test directly in production
- Don't commit directly to `main`
- Don't skip local testing
- Don't use production database locally
- Don't commit `.env.local`

---

## 🔐 Security Notes

- `.env.local` is gitignored (safe)
- Never commit real credentials
- Use `SKIP_WHATSAPP_OTP=true` for local dev
- Production credentials only in Coolify

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🆘 Need Help?

1. Check this guide
2. Check project README
3. Check deployment logs in Coolify
4. Ask the team

---

**Happy Coding! 🚀**
