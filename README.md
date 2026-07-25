# MotoHippi — Frontend

Standalone React + Vite SPA. No monorepo or workspace required.  
Builds with plain npm. Deploy to Vercel, Netlify, or any static host.

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set VITE_API_BASE_URL to your backend URL
npm run dev
```

Open http://localhost:3000

## Production build

```bash
npm install
npm run build
# Output is in ./dist — serve it as a static site
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in [vercel.com](https://vercel.com).
3. Vercel auto-detects Vite — no extra settings needed.
4. Add environment variables in **Project → Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend REST API |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID for "Sign in with Google" |

## Stack

- **React 19** + TypeScript
- **Vite 7** with `@vitejs/plugin-react`
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **TanStack Query v5** for data fetching
- **Wouter** for client-side routing
- **Radix UI** / **shadcn-ui** components
- **Framer Motion** for animations
- **Lottie** animations via `@lottiefiles/dotlottie-react`

## Project structure

```
src/
  pages/          — All route-level pages
  components/     — Shared UI components + shadcn/ui primitives
  contexts/       — React context (Auth, App)
  hooks/          — Custom hooks
  lib/
    api-client/   — Inlined API client (generated fetch wrappers + Zod schemas)
    utils.ts      — Utility helpers
public/           — Static assets (logos, Lottie files, images)
```
