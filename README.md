# Money Cycle

Money Cycle is a salary-cycle based personal finance app. Each cycle starts from the salary you enter, allocations are made per account, and remaining balances do not carry into the next cycle.

## Stack

- Frontend: Vite, Vue 3, TypeScript, Vuetify, Pinia
- Backend: Express, TypeScript, MongoDB Atlas
- Auth: Google OAuth 2.0 with JWT in an httpOnly cookie

## Setup

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Deploy

Recommended setup:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### 1. Backend on Render

Use the root `render.yaml` blueprint, or create a Render Web Service manually:

- Build command: `npm install && npm run build -w backend`
- Start command: `npm start -w backend`
- Health check path: `/health`

Set these Render environment variables:

```bash
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<strong secret, at least 32 characters>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
GOOGLE_CALLBACK_URL=https://<your-render-service>.onrender.com/auth/google/callback
```

After deploy, check:

```text
https://<your-render-service>.onrender.com/health
```

### 2. Frontend on Vercel

Create a Vercel project with:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set this Vercel environment variable:

```bash
VITE_API_URL=https://<your-render-service>.onrender.com
```

The frontend includes `frontend/vercel.json` so direct refreshes on routes such as `/dashboard` work.

### 3. Google OAuth

In Google Cloud Console, add:

Authorized JavaScript origins:

```text
https://<your-vercel-app>.vercel.app
```

Authorized redirect URIs:

```text
https://<your-render-service>.onrender.com/auth/google/callback
```

## Pay Cycle

The default pay day is the 21st. If it falls on Saturday, the cycle starts on Friday. If it falls on Sunday, the cycle starts on Friday. The cycle ends one day before the next adjusted pay day.
