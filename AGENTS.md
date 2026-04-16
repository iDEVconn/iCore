# iCore Starter — Agent Instructions

## Architecture

Nx monorepo with three packages:
- `apps/client` — Vite + React 19 + TanStack Router + React Query + Zustand
- `apps/api` — NestJS 11 (all Supabase interaction goes through here)
- `libs/shared` — shared types and utilities

Frontend does NOT know about Supabase. All data flows through NestJS API.

```mermaid
graph TD
  subgraph shared ["libs/shared"]
    SharedTypes["types.ts\n(UserRole, AuthUser, AiParseResult, AiSkillConfig)"]
  end

  subgraph api ["apps/api (NestJS)"]
    AppModule["AppModule"]
    ConfigModule["ConfigModule\n(global)"]
    SupabaseModule["SupabaseModule\n(@Global)"]
    SupabaseService["SupabaseService\n(admin + anon clients)"]
    AuthModule["AuthModule"]
    AuthController["AuthController\n(/auth/*)"]
    AuthService["AuthService"]
    AuthGuard["AuthGuard\n(APP_GUARD)"]
    RolesGuard["RolesGuard\n(APP_GUARD)"]
    StorageModule["StorageModule"]
    StorageController["StorageController\n(/storage/*)"]
    StorageService["StorageService"]

    AppModule --> ConfigModule
    AppModule --> SupabaseModule
    AppModule --> AuthModule
    AppModule --> StorageModule
    AppModule --> AiConnectorsModule
    AppModule --> WebhooksModule

    SupabaseModule --> SupabaseService

    AuthModule --> AuthController
    AuthModule --> AuthService
    AuthModule --> AuthGuard
    AuthModule --> RolesGuard
    AuthService --> SupabaseService
    AuthGuard --> SupabaseService
    RolesGuard --> AuthService

    StorageModule --> StorageController
    StorageModule --> StorageService
    StorageService --> SupabaseService

    AiConnectorsModule["AiConnectorsModule"]
    AiConnectorsSvc["AiConnectorsService\n(Gemini + Skills)"]
    AiConnectorsCtrl["AiConnectorsController\n(/ai-connectors/*)"]
    AiConnectorsModule --> AiConnectorsCtrl
    AiConnectorsModule --> AiConnectorsSvc
    AiConnectorsModule -->|"imports"| StorageModule
    AiConnectorsSvc -->|"Gemini SDK"| Gemini["Google Gemini AI"]

    WebhooksModule["WebhooksModule"]
    WebhooksSvc["WebhooksService"]
    WebhooksCtrl["WebhooksController\n(/webhooks/*)"]
    WebhooksModule --> WebhooksCtrl
    WebhooksModule --> WebhooksSvc
    WebhooksModule -->|"imports"| StorageModule
    WebhooksModule -->|"imports"| AiConnectorsModule
    WebhooksSvc --> AiConnectorsSvc
    WebhooksSvc --> StorageService
  end

  N8N["n8n / Automation"] -->|"x-webhook-secret"| WebhooksCtrl

  subgraph client ["apps/client (React)"]
    MainTsx["main.tsx\n(QueryClient + Router)"]
    RootRoute["__root.tsx\n(ThemeProvider + Toaster)"]
    LandingRoute["/ Landing Page"]
    LoginRoute["/login\n(Sign In / Sign Up)"]
    DashboardRoute["/dashboard\n(protected layout)"]
    DashboardIndex["Dashboard Home"]
    AuthStore["stores/auth.ts\n(Zustand persist)"]
    QueriesAuth["queries/auth.ts\n(useLogin, useLogout, authQueryOptions)"]
    QueriesAi["queries/ai-connectors.ts\n(useParseDocument, useUploadDocument)"]
    ApiClient["api/client.ts\n(fetch + Bearer + refresh)"]
    UIComponents["components/ui/*\n(shadcn primitives)"]
    LayoutComponents["Sidebar + Header"]

    MainTsx --> RootRoute
    RootRoute --> LandingRoute
    RootRoute --> LoginRoute
    RootRoute --> DashboardRoute
    DashboardRoute --> DashboardIndex
    DashboardRoute --> LayoutComponents
    DashboardRoute --> QueriesAuth
    LoginRoute --> QueriesAuth
    LoginRoute --> UIComponents
    QueriesAuth --> ApiClient
    QueriesAuth --> AuthStore
    QueriesAi --> ApiClient
    ApiClient --> AuthStore
  end

  SupabaseService -->|"Supabase JS SDK"| Supabase["Supabase\n(Auth + DB + Storage)"]
  ApiClient -->|"HTTP /api/*"| AppModule
  AuthService --> SharedTypes
  RolesGuard --> SharedTypes
  QueriesAuth -.-> SharedTypes
```

## Key Patterns

- **Auth**: Supabase Auth via NestJS. Client sends credentials to `/api/auth/login`, gets JWT. Every request includes `Authorization: Bearer <token>`. Global `AuthGuard` + `RolesGuard` on API.
- **Data fetching**: React Query hooks in `apps/client/src/queries/`. API client in `apps/client/src/api/client.ts` with auto token refresh.
- **Global state**: Zustand store in `apps/client/src/stores/auth.ts` (persist middleware, key `starter-auth`).
- **Routing**: TanStack Router file-based routes. `dashboard.tsx` is the protected layout with `beforeLoad` auth check. Landing page at `/` is public.
- **Styling**: Tailwind CSS 4 with `@tailwindcss/vite` plugin. Dark mode by default. shadcn/ui components.
- **File uploads**: Storage module handles upload to Supabase Storage with signed URLs for private buckets.
- **AI connectors**: Gemini-powered document parsing with a skill system. Default "document" skill extracts structured data from any PDF/image. Register custom skills at runtime.
- **Webhooks**: Public endpoints for external automation (n8n). Secured by `x-webhook-secret` header instead of JWT.

## NestJS tsconfig

The API tsconfig overrides `module: CommonJS` and `moduleResolution: node` (required for NestJS decorators). `baseUrl: ../../` resolves `@starter/shared` path.

## Important

- `@Public()` decorator exempts routes from AuthGuard (login, register)
- `@Roles("admin")` restricts to admin users
- Service role client bypasses RLS for all DB operations
- Anon client used only for `signInWithPassword` and `refreshSession`
- Private storage buckets use `storage://` URI scheme. Client resolves via `GET /api/storage/signed-url`.
- `GEMINI_API_KEY` and `GEMINI_MODEL` env vars control AI parsing. Default model: `gemini-2.0-flash`.
- `N8N_WEBHOOK_SECRET` env var secures webhook endpoints.
- Build artifacts (`dist/`, `.vite/`) are gitignored — do not commit them

## Route Structure

- `/` — Public landing page
- `/login` — Auth page (sign in / sign up toggle)
- `/dashboard` — Protected dashboard (requires auth)

## AI Connectors — Skill System

The `AiConnectorsModule` provides a skill-based document parsing system powered by Google Gemini.

### Default skill: "document"

Ships out of the box. Extracts generic structured data (title, date, amount, currency, parties, line items) from any PDF or image.

### API endpoints

- `POST /api/ai-connectors/parse` — parse a file (body: `file` + optional `skill` name). Returns `AiParseResult[]`.
- `POST /api/ai-connectors/upload` — upload file to storage + parse. Returns `{ url, userId, results, count }`.
- `GET /api/ai-connectors/skills` — list registered skills.

### Creating a custom skill

Register a new `AiSkillConfig` in `AiConnectorsService`:

```typescript
// In your feature module's onModuleInit or service constructor:
this.aiConnectors.registerSkill({
  name: "invoice",
  prompt: "You are an invoice parser. Extract products, prices, dates...",
  expectedFields: ["product_name", "price", "date", "store"],
});
```

Then call `POST /api/ai-connectors/parse` with `skill=invoice`.

### Extending for new use cases

1. Define a new `AiSkillConfig` with a domain-specific prompt
2. Register it via `AiConnectorsService.registerSkill()`
3. Optionally create a dedicated controller endpoint that uses the skill
4. Add domain-specific types to `libs/shared/src/types.ts`

## Webhooks

Public endpoints for external automation tools (n8n, Zapier, etc.). Secured by `x-webhook-secret` header.

- `POST /api/webhooks/n8n` — generic action dispatcher (body: `{ action, data }`)
- `POST /api/webhooks/n8n/upload` — file upload + AI parse (body: `file`, `user_id`, optional `skill`)

## Adding New Features

1. Create a new NestJS module in `apps/api/src/<feature>/`
2. Add module, controller, service files
3. Import module in `app.module.ts`
4. Add shared types in `libs/shared/src/`
5. Create React Query hooks in `apps/client/src/queries/<feature>.ts`
6. Add routes under `apps/client/src/routes/dashboard/`
