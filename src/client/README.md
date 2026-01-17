# Client-Side Code Directory

**Client-side only — no server secrets or database access here**

This directory contains all frontend/client-side code that runs in the browser.

## Structure

- **`components/`** - All React UI components (client components)
- **`hooks/`** - Custom React hooks
- **`api/`** - Client-side API client for making HTTP requests from browser
- **`utils/`** - Client-side utility functions (browser-only helpers)
- **`icons/`** - Icon components
- **`constants/`** - Client-side constants

## Rules

✅ **DO:**
- Place all React components here
- Place all custom hooks here
- Place browser-only utilities here
- Place client-side API clients here
- Use `"use client"` directive for client components

❌ **DON'T:**
- Never import server-side code (services, database, server auth)
- Never use Drizzle ORM here
- Never access environment secrets here
- Never perform database queries here

## Import Paths

Use these import paths:
- `@/client/components` - UI components
- `@/client/hooks` - React hooks
- `@/client/api` - API client
- `@/client/utils` - Client utilities
- `@/client/constants` - Constants
- `@/client/icons` - Icons

## Server-Side Code

Server-side code lives in:
- `src/lib/services/` - Business logic services
- `src/db/` - Database schema and access
- `src/lib/auth/` - Authentication (JWT-based)
- `src/app/api/` - API route handlers
- `src/actions/` - Server actions

