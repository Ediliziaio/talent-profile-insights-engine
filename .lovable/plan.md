

# Enterprise Audit & Hardening Plan - TalentProfile

## A) Report AS-IS

### Architecture Map

```text
FRONTEND (React + Vite)
├── Auth.tsx ─── 3 tabs: Candidato / Azienda / Registra
├── NotionLayout.tsx ─── Sidebar (Dashboard, Candidati, Aziende, Pagamenti)
├── Candidate Flow: Auth → FormAnagrafico → ConsensoPrivacy → Questionario → TestCompletato
├── HR Flow: Auth → Dashboard → Candidati → CandidatoDettaglio → ConfrontoCandidati
├── Superadmin: + Aziende, Pagamenti, StoricoCandidato
└── Home.tsx ─── Landing page (2000 lines, no auth)

BACKEND (Edge Functions)
├── candidate-login (public, verify_jwt=false)
├── register-candidate (public, verify_jwt=false)
├── create-candidate (auth required)
├── create-company (auth required)
├── manage-company-access (auth required)
├── reset-company-password (auth required)
├── analyze-candidate (auth required)
├── batch-ricalcolo-v5 (auth required)
└── seed-demo-candidates (auth required)

DB Tables: aziende, candidati, risposte, risultati, profili_candidato,
           profiles, accessi_azienda, candidate_sessions, login_attempts,
           domande, analisi_candidato, abbonamenti, pagamenti

ROLES: superadmin | azienda | candidato
```

### Findings Summary

#### P0 - CRITICAL (Block production)

1. **Registration tab publicly visible**: Anyone can create an HR/azienda account via the "Registra" tab in Auth.tsx. This is a critical security issue — only superadmin should provision company accounts. **User explicitly requested removal.**

2. **SHA-256 without salt for candidate passwords**: `manage-company-access` and `candidate-login` use `crypto.subtle.digest('SHA-256')` without salt. Vulnerable to rainbow tables. (Known from prior plan, not yet fixed.)

3. **`password_plain` stored in DB**: The `accessi_azienda` table has a `password_plain` column that stores passwords in cleartext. The column should be nullable and only populated transiently during generation, but current code and UI still reference it for display.

4. **Missing route guards**: `/candidati/:id`, `/candidati/:id/storico`, `/confronto`, `/home` lack `ProtectedRoute` wrappers. Any authenticated user (including candidates) could access candidate detail pages.

#### P1 - IMPORTANT

5. **Dead code**: `registerSchema` in validationSchemas.ts, `handleSignUp` in Auth.tsx, `regEmail`/`regPassword`/`nome`/`cognome` state — all become dead code after removing the "Registra" tab.

6. **Home.tsx is 2000 lines**: Single monolithic component with all landing page logic. No code splitting within.

7. **`password_plain` exposed in Candidati.tsx**: The password is shown in plain text in the credentials panel (line 964). After generation, the password should only be shown once, not persisted.

8. **Dashboard.tsx queries all candidates then filters client-side**: For large datasets, this fetches potentially thousands of records and filters in JS. No server-side pagination.

9. **`/candidati/:id` has no ProtectedRoute**: The route uses a lazy-loaded component but no role guard. Any authenticated user can access any candidate's detail page by knowing the UUID.

10. **Duplicate RLS policies**: Several tables have overlapping policies (e.g., `risultati` has both "Superadmin can manage risultati" and "Superadmin full access risultati"). Redundant policies add confusion.

#### P2 - IMPROVEMENTS

11. **No consistent error tracking**: `ErrorBoundary` logs to console only. No structured error reporting.

12. **Query keys not centralized**: Query keys are hardcoded strings scattered across components. Refactoring risk.

13. **`Candidati.tsx` is 1636 lines**: Very large component mixing list, filters, modals, and CRUD.

14. **Missing loading/error states on some routes**: `/home` has no auth guard or loading state.

---

## Implementation Plan

### Phase 1: Security (P0) — Auth Tab Removal + Route Guards

**1.1 Remove "Registra" tab from Auth.tsx**
- Remove the third tab trigger and `TabsContent value="register"` block
- Change `grid-cols-3` to `grid-cols-2` in the TabsList
- Remove all registration state variables: `regEmail`, `regPassword`, `nome`, `cognome`
- Remove `handleSignUp` function
- Remove `registerSchema` import (keep in validationSchemas.ts for potential future admin use)

**1.2 Add ProtectedRoute guards to unprotected routes**
- `/candidati/:id` → `ProtectedRoute allowedRoles={['superadmin', 'azienda']}`
- `/candidati/:id/storico` → `ProtectedRoute allowedRoles={['superadmin', 'azienda']}`
- `/confronto` → `ProtectedRoute allowedRoles={['superadmin', 'azienda']}`
- `/home` → remains public (landing page), no change needed
- `/` (CandidatoRedirect) → add `ProtectedRoute` wrapper to ensure auth

### Phase 2: Cleanup (P1) — Dead Code + Simplification

**2.1 Clean Auth.tsx dead code**
- After removing the "Registra" tab, remove unused imports (`registerSchema`, `RegisterInput`)
- Remove unused state variables for registration form

**2.2 Clear `password_plain` after credential generation**
- In `manage-company-access` edge function: after returning the password in the response, set `password_plain = NULL` in the DB (or remove the column entirely)
- In `Candidati.tsx` credentials panel: show "Rigenera per ottenere la password" instead of displaying stored `password_plain`

### Phase 3: Route Security Hardening

**3.1 Ensure all admin pages have ProtectedRoute**
Verify and fix the route guards in `App.tsx`:

```text
/              → ProtectedRoute (any authenticated)
/aziende       → ProtectedRoute superadmin ✓ (already done)
/candidati     → ProtectedRoute superadmin|azienda ✓ (already done)
/candidati/:id → ProtectedRoute superadmin|azienda ← FIX
/candidati/:id/storico → ProtectedRoute superadmin|azienda ← FIX
/confronto     → ProtectedRoute superadmin|azienda ← FIX
/pagamenti     → ProtectedRoute superadmin ✓ (already done)
/test/*        → various guards ✓ (already done)
```

### Phase 4: Multi-Tenancy Verification

**4.1 Tenant isolation check**
- RLS policies already enforce `azienda_id` scoping for `candidati`, `risposte`, `risultati`, `profili_candidato`
- Edge functions use `service_role` with explicit `azienda_id` filtering
- No changes needed; document verification

### Phase 5: Performance Quick Wins

**5.1 No immediate DB index changes needed**
- Current query patterns are covered by existing indexes
- Candidate listing uses `.order('created_at')` which is indexed by default
- `candidate_sessions` already has `idx_candidate_sessions_token`

### Phase 6: UX Consistency

**6.1 Auth page simplification**
- With "Registra" removed, the auth page becomes cleaner: 2 tabs (Candidato / Azienda)
- No other UX changes needed in this iteration

---

## Technical Details

### Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/pages/Auth.tsx` | Remove "Registra" tab, dead code cleanup | Low — behavior-preserving removal |
| `src/App.tsx` | Add ProtectedRoute to 3 unguarded routes | Low — adds restrictions only |

### What Is NOT Changed (and why)
- **SHA-256 hashing**: Requires coordinated migration of all existing `password_hash` values. Deferred to a dedicated security sprint.
- **Home.tsx refactor**: 2000-line landing page works correctly. Splitting is a P2 cosmetic improvement.
- **Candidati.tsx refactor**: 1636-line component works. Splitting is a P2 improvement.
- **Dashboard pagination**: Works for current data volumes. Optimize when > 500 candidates per company.
- **Duplicate RLS policies**: Functional redundancy, not a security risk. Cleanup deferred.

### Acceptance Criteria
- "Registra" tab no longer visible at `/auth`
- Registration endpoint `signUp()` no longer callable from UI
- All candidate detail routes require authentication + correct role
- No regression in existing flows: candidate login, HR login, questionnaire, analysis

