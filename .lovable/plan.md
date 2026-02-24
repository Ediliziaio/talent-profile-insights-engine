

# Enterprise Production Hardening Plan - Phase 3

## Current State Summary

Previous phases completed:
- Phase 1: Removed "Registra" tab from Auth.tsx, added ProtectedRoute guards
- Phase 2: Added RLS to candidate_sessions/login_attempts, NULLed password_plain

## Remaining Issues Found

### P0 - CRITICAL

1. **`signUp` still exposed in useAuth**: The `signUp` function remains in `AuthProvider` and is publicly callable via `useAuth()`. With the "Registra" tab removed, this is dead code that still exposes a public registration endpoint via `supabase.auth.signUp()`. Any developer or attacker importing `useAuth` can call `signUp()` directly from the browser console.

2. **`registerSchema` + `RegisterInput` dead code**: Still exported from `validationSchemas.ts`, unused anywhere in the codebase.

3. **Leaked Password Protection disabled**: The linter confirms this is still a warning. This is a Supabase Auth setting that must be enabled manually by the user in their backend settings.

### P1 - IMPORTANT

4. **Dashboard fetches ALL candidates client-side**: `Dashboard.tsx` line 51-53 fetches all candidates with nested joins, then filters in JS (lines 64-73). For 500+ candidates this will degrade.

5. **`password_plain` column still exists**: The column in `accessi_azienda` is NULLed but not dropped. It should be removed entirely.

6. **Console warnings**: Two `forwardRef` warnings from ProtectedRoute rendering `<Navigate>` and App rendering `<Auth>`. These are React 18 cosmetic warnings, not bugs.

7. **Home.tsx 1998 lines**: Monolithic landing page, no code splitting.

8. **Candidati.tsx 1636 lines**: Large component mixing UI, business logic, and data access.

### P2 - IMPROVEMENTS

9. **Query keys not centralized**: Hardcoded strings across components.
10. **Duplicate RLS policies**: Multiple overlapping SELECT/ALL policies on several tables.
11. **No structured error tracking**: ErrorBoundary logs to console only.

---

## Implementation Plan (This Phase)

### 3.1 Remove `signUp` from useAuth (P0 - Security)

**File: `src/hooks/useAuth.tsx`**
- Remove `signUp` from `AuthContextType` interface
- Remove `signUp` function implementation (lines 71-91)
- Remove `signUp` from the context provider value
- This prevents any client-side code from triggering `supabase.auth.signUp()`

### 3.2 Clean dead registration code (P1 - Cleanup)

**File: `src/lib/validationSchemas.ts`**
- Remove `registerSchema` (lines 34-54)
- Remove `RegisterInput` type export (line 146)
- Keep all other schemas intact

### 3.3 Drop `password_plain` column (P0 - Security)

**Database migration:**
```sql
ALTER TABLE public.accessi_azienda DROP COLUMN IF EXISTS password_plain;
```
- All values are already NULLed from Phase 2
- Edge function already sets `password_plain: null` on insert
- UI already shows "Rigenera per ottenere la password"

### 3.4 Update `manage-company-access` edge function

**File: `supabase/functions/manage-company-access/index.ts`**
- Remove `password_plain: null` from the INSERT (column no longer exists)
- Keep the response-only password return behavior

---

## What Is NOT Changed (and why)

| Item | Reason |
|------|--------|
| Dashboard client-side filtering | Works for current volumes (<200 candidates per company). Optimize at P1 when needed. |
| Home.tsx refactor (1998 lines) | Works correctly, landing page rarely changes. P2 cosmetic. |
| Candidati.tsx refactor (1636 lines) | Already uses `useCandidateManagement` hook per memory. P2. |
| Duplicate RLS policies | Functional redundancy, not a security risk. P2 cleanup. |
| Console forwardRef warnings | React 18 cosmetic, no functional impact. |
| Leaked Password Protection | Requires user action in backend settings; cannot be automated. Will document. |
| Query key centralization | No functional impact, P2 improvement. |

## Acceptance Criteria

- `signUp()` no longer callable from client code
- `registerSchema` removed from validation schemas
- `password_plain` column dropped from database
- Edge function deploys and works without `password_plain`
- All existing flows (candidate login, HR login, questionnaire, analysis) unaffected
- Zero new runtime errors

## Multi-Tenancy Verification (Checklist)

| Entity | Tenant Scope | RLS | Status |
|--------|-------------|-----|--------|
| candidati | azienda_id | Yes, per-azienda + superadmin | VERIFIED |
| risposte | via candidato_id→azienda_id | Yes | VERIFIED |
| risultati | via candidato_id→azienda_id | Yes | VERIFIED |
| profili_candidato | via candidato_id→azienda_id | Yes | VERIFIED |
| accessi_azienda | azienda_id | Yes, superadmin + own | VERIFIED |
| analisi_candidato | via candidato_id→azienda_id | Yes | VERIFIED |
| candidate_sessions | azienda_id | Yes, deny all + superadmin view | VERIFIED |
| login_attempts | N/A | Yes, deny all + superadmin view | VERIFIED |
| abbonamenti | azienda_id | Yes, superadmin only | VERIFIED |
| pagamenti | azienda_id | Yes, superadmin only | VERIFIED |

## Backup & Restore

Lovable Cloud provides automatic daily backups with point-in-time recovery. The database is managed by the platform with:
- **Frequency**: Continuous WAL archiving + daily snapshots
- **Retention**: Platform-managed (typically 7 days)
- **RTO**: Minutes (automated restore)
- **RPO**: Near-zero (WAL-based)

## Security Report Summary

| Area | Status |
|------|--------|
| Registration disabled | DONE (Phase 1) |
| Route guards | DONE (Phase 1) |
| RLS on all tables | DONE (Phase 2) |
| password_plain NULLed | DONE (Phase 2) |
| signUp removed | THIS PHASE |
| password_plain column dropped | THIS PHASE |
| Dead code removed | THIS PHASE |
| Leaked password protection | PENDING (user action required) |
| SHA-256 → bcrypt migration | DEFERRED (requires coordinated migration) |

