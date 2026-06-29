# Firebase Auth + Prisma Single-Project Architecture

This repository is one Next.js 16 App Router project at the root with a strict separation of concerns inside one codebase.

## Why This Split Exists

- Firebase is used only for identity/authentication.
- Prisma + Postgres are used only for business data and application logic.
- Frontend auth helpers (Firebase client SDK) must not import Prisma or use `DATABASE_URL`.
- Backend/business logic code (Prisma + Firebase Admin verification) must not import the Firebase client SDK.

## Project Layout

```text
app/
components/
lib/
  firebase/client.ts
  firebase/session.ts
  firebase/admin.ts
  api.ts
  prisma.ts
prisma/schema.prisma
proxy.ts
```

## Local Development

1. Copy `.env.local.example` to `.env.local` and fill placeholders.
2. Install dependencies from the root.
3. Run from root: `pnpm dev`

## Security Notes

- Do not commit real Firebase service-account credentials.
- Do not commit real database credentials.
- `.env.local` is ignored by Git.
