# Labor Marketplace Backend — Phase 1

Express + TypeScript + Prisma + PostgreSQL backend for a daily-labor worker booking marketplace.

## Quick Start

```bash
cp .env.example .env
# edit .env with your DATABASE_URL and secrets

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev