# KRUSANT Monorepo

This monorepo contains the frontend (React) and backend (NestJS) applications, as well as a shared package for common code.

## Structure
- `packages/frontend` — React frontend
- `packages/backend` — NestJS backend
- `packages/shared` — Shared code (types, DTOs, utils)

## Getting Started
1. Install dependencies:
   ```sh
   yarn install
   ```
2. Run frontend:
   ```sh
   yarn dev:frontend
   ```
3. Run backend:
   ```sh
   yarn dev:backend
   ```

## Adding Shared Code
Place shared types, DTOs, or utilities in `packages/shared` and import them in frontend/backend as needed.
