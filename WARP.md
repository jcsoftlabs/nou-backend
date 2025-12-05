# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a Node.js + Express REST API backed by MySQL, using Sequelize as the ORM. It powers the NOU application with domains like members, payments, referrals, podcasts, quizzes, formations, and donations.

## Setup and environment

- Install dependencies: `npm install`
- Copy environment template and customize: `cp .env.sample .env`
  - Configure MySQL connection (typically XAMPP MySQL) and any JWT/other secrets in `.env`.
- MySQL database: `nou_db` (created automatically by init scripts if not present).

## Common commands

From the project root:

- Start API (production mode): `npm start`
  - Runs `node src/server.js` on `process.env.PORT` or `4000` by default.
- Start API (development with auto-reload): `npm run dev`
  - Uses `nodemon src/server.js`.
- Initialize database schema: `npm run db:init`
  - Executes `src/scripts/initDb.js` to create `nou_db` (if needed), run SQL migrations in `src/migrations/`, and sync Sequelize models.
- Seed database: `npm run db:seed`
  - Executes `src/scripts/seedDb.js` to insert initial/reference data.
- Deploy to Railway (project-specific): `npm run deploy:railway`
  - Runs `scripts/deploy-railway.js` (see that file for details if you need to adjust deployment behavior).

### Testing

- There is currently **no automated test framework configured**. The `npm test` script is a placeholder that exits with an error.
- Before adding tests or using `npm test`, introduce a test runner (e.g. Jest) and update `package.json` accordingly, then document single-test commands here.

## High-level architecture

### Entry point and HTTP layer

- `src/server.js` is the main entry point.
  - Loads environment variables via `dotenv`.
  - Configures global middleware: CORS, `express.json()`, and `express.urlencoded()`.
  - Serves static uploaded files under `/uploads` from `src/uploads/`.
  - Exposes a health check route `GET /` responding with `API NOU OK`.
  - Mounts route modules for each domain under versionless top-level paths:
    - `/auth`, `/membres`, `/cotisations`, `/payments`, `/referrals`, `/parrainage`, `/points`, `/podcasts`, `/quiz`, `/formations`, `/dons`, `/admin` (and optional `/fcm`).
  - Handles process-level errors (`uncaughtException`, `unhandledRejection`) and graceful shutdown signals (`SIGTERM`, `SIGINT`).

### Routing, controllers, services pattern

The API generally follows a **route → controller → service → model** flow per domain:

- `src/routes/*.js`
  - Each file defines Express routers for a specific functional area (e.g. `authRoutes.js`, `membreRoutes.js`, `cotisationRoutes.js`, `podcastRoutes.js`, `quizRoutes.js`, `formationRoutes.js`, `donRoutes.js`, `adminRoutes.js`).
  - Routes:
    - Parse path parameters and query strings.
    - Attach relevant middleware (auth, role checks, validators, upload handlers).
    - Delegate to controller methods.

- `src/controllers/*.js`
  - Controllers are responsible for HTTP-level concerns per domain:
    - Orchestrate request validation (often via Joi validators or middleware).
    - Call corresponding service-layer functions.
    - Map domain/service results to HTTP responses and status codes.
    - Centralize error handling per domain before falling back to global handlers.

- `src/services/*.js`
  - Services implement the core business logic and are the primary consumers of Sequelize models.
  - Typical responsibilities:
    - Enforce domain invariants (e.g. membership rules, payment and referral consistency, quiz scoring, point calculations).
    - Compose multiple model operations into higher-level workflows.
    - Encapsulate external integrations (e.g. Firebase FCM via `fcmService.js`, payment webhooks, configuration).
  - `src/services/index.js` exists as a potential aggregation point but is currently an empty export object.

### Data layer and database

- `src/models/`
  - Each file defines a Sequelize model for a specific table (e.g. `Membre`, `Cotisation`, `Referral`, `Podcast`, `Quiz`, `QuizQuestion`, `QuizResultat`, `AuditLog`, `ConfigPoints`, `FCMToken`, `Formation`, `FormationModule`, `Don`).
  - `src/models/index.js` is the central model registry:
    - Imports `sequelize` from `src/config/sequelize.js`.
    - Registers all models and defines their associations, including:
      - Member ↔ Cotisations, Member ↔ Dons, Member ↔ Referrals, Quiz ↔ Questions, Quiz ↔ Results, Member ↔ Quiz results, Member ↔ Audit logs, Member ↔ FCM Tokens, Formation ↔ Modules ↔ Quiz.
    - Exports the `sequelize` instance and all model classes for use in services and scripts.

- `src/config/sequelize.js` (imported in `models/index.js`)
  - Encapsulates Sequelize initialization and connection configuration using environment variables.

- `src/migrations/`
  - Contains versioned SQL files that define schema evolution:
    - Initial members and related tables, additional tables, new columns (e.g. `username`, `statuts`), formations/modules, module content fields, donations, and schema fixes.
  - Each SQL migration often has a corresponding JS runner (e.g. `run_003_migration.js`, `run_004_formations_modules_migration.js`, etc.) that can be used by scripts to apply specific changes.
  - `src/migrations/index.js` consolidates or sequences migration utilities for use in `initDb.js`.

- `src/scripts/`
  - `initDb.js`: Orchestrates database initialization combining schema creation, Sequelize sync, and migrations.
  - `seedDb.js`: Inserts baseline data (e.g. initial admin user, configuration values, demo content) for local development or staging.
  - `migrateCodeAdhesion.js`: Performs targeted data migration or transformation related to adhesion codes; check this file when modifying membership/referral logic.

### Validation, middleware, and utilities

- `src/validators/`
  - Joi-based schemas encapsulate request validation rules.
  - `authValidators.js` contains comprehensive schemas for registration, login, OTP sending, and OTP verification.
  - Other validators (e.g. for cotisations, membres, podcasts) follow similar patterns and are consumed in route definitions.

- `src/middleware/`
  - `auth.js`: Authentication middleware (likely verifies JWTs and attaches the authenticated member/admin to `req`).
  - `checkRole.js`: Role/permission enforcement based on the authenticated user.
  - `rateLimiter.js`: Express-rate-limit configuration protecting specific routes (e.g. auth, OTP, or sensitive admin paths).
  - `index.js`: Present as a potential central export but currently empty.

- `src/config/`
  - `db.js` / `sequelize.js`: Low-level DB and ORM connection logic.
  - `firebase.js` and `firebase-service-account.example.json`: Firebase Admin SDK initialization and example service account configuration for FCM or other Firebase features.
  - `multer.js`, `multerDon.js`, `multerPodcast.js`, `multerProfile.js`, `upload.js`: Centralized file-upload and storage configuration using Multer; each variant targets a specific domain (e.g. donation proofs, podcast media, profile photos).

- `src/utils/`
  - `jwt.js`: Helper functions to issue and verify JWT tokens used in authentication and possibly internal services.
  - `otp.js`: One-time-password generation/validation logic for SMS or similar flows.
  - `index.js`: Empty aggregation point for future shared utilities.

- `src/uploads/`
  - Runtime destination for uploaded files, served statically via `/uploads` in `src/server.js`.
  - `index.js` is a placeholder to allow clean module resolution or future upload helpers.

## How to extend or modify functionality

- To add or modify an API feature for a given domain (e.g. podcasts, members, quiz):
  1. Update or create a **Sequelize model** under `src/models/` and wire associations in `src/models/index.js`.
  2. Create or update the **service** under `src/services/` to implement business rules and data access.
  3. Create or update the **controller** under `src/controllers/` to handle HTTP concerns.
  4. Register endpoints in the appropriate **route module** under `src/routes/`, attaching validators, auth, and upload middleware as needed.
  5. If new tables or columns are required, add an SQL file under `src/migrations/` and integrate it in the init/migration scripts.

- For changes that touch authentication, authorization, or user identity, review **auth-related middleware and validators** (`src/middleware/auth.js`, `src/middleware/checkRole.js`, `src/validators/authValidators.js`, and `src/utils/jwt.js`) to keep behavior consistent across the API.