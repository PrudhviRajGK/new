# Kraya-AI - WhatsApp-First AI Sales Automation Platform

## Overview
Production-ready multi-tenant SaaS platform for AI-powered lead management and sales automation via WhatsApp.

## Architecture
- **Backend**: Node.js + Express with strict layering
- **Frontend**: React + TypeScript + Tailwind CSS
- **Databases**: PostgreSQL, MongoDB, Redis (local installations)
- **AI**: OpenAI GPT-4 with custom orchestration
- **Workflow**: Built-in workflow engine + N8N webhook support

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- OpenAI API Key

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb kraya

# MongoDB will auto-create collections
# Ensure MongoDB is running on localhost:27017

# Ensure Redis is running on localhost:6379
```

### 3. Environment Configuration
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
cp .env.example .env
```

### 4. Initialize Database
```bash
cd backend
npm run migrate
npm run seed
```

### 5. Start Services
```bash
# Terminal 1 - Backend (port 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm start
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs

## Default Credentials
- **Email**: admin@kraya.ai
- **Password**: Admin@123
- **Tenant**: demo-tenant

## Features
- Multi-tenant architecture with complete isolation
- AI-powered lead qualification (BANT framework)
- All 25+ WhatsApp APIs implemented
- Visual workflow engine with drag-drop
- Real-time analytics dashboard
- N8N webhook integration with HMAC signing
- Role-based access control (Admin/Manager/Agent)
- Complete audit logging
- GDPR/CCPA compliance tools

## Testing
```bash
# Backend tests (80%+ coverage)
cd backend
npm test
npm run test:integration
npm run test:load

# Frontend tests
cd frontend
npm test
```

## Project Structure
```
kraya-ai/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tenant/
│   │   │   ├── lead/
│   │   │   ├── conversation/
│   │   │   ├── ai-orchestrator/
│   │   │   ├── workflow/
│   │   │   ├── webhook/
│   │   │   ├── analytics/
│   │   │   └── whatsapp/
│   │   ├── database/
│   │   ├── config/
│   │   └── shared/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Success Criteria
- Lead messages on WhatsApp → AI responds instantly
- Lead qualification runs automatically
- Follow-ups trigger based on workflows
- Leads move through pipeline stages
- Analytics update in real-time
- N8N webhooks fire correctly
- Everything runs locally

## Support
For detailed documentation, see `/backend/docs` and `/frontend/docs`.
