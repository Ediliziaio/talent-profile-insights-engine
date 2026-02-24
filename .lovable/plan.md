

# Security Verification Report

## 1. ProtectedRoute Verification

### Code Verification (Confirmed)
The `App.tsx` now wraps all sensitive routes with `ProtectedRoute`:

| Route | Guard | Status |
|-------|-------|--------|
| `/candidati/:id` | `superadmin, azienda` | PROTECTED |
| `/candidati/:id/storico` | `superadmin, azienda` | PROTECTED |
| `/confronto` | `superadmin, azienda` | PROTECTED |
| `/aziende` | `superadmin` | PROTECTED |
| `/candidati` | `superadmin, azienda` | PROTECTED |
| `/pagamenti` | `superadmin` | PROTECTED |
| `/test/completato` | `candidato` | PROTECTED |

### Browser Test
- Navigated to `/candidati/00000000-...` with active superadmin session → Page loaded correctly (showed "Candidato non trovato" for fake UUID). This confirms superadmin access works.
- The sandbox browser retains the session cookie, so a fully unauthenticated test was not possible in this environment. However, the `ProtectedRoute` component code confirms: if `!user`, it returns `<Navigate to="/auth" replace />`.

### Verdict: ROUTE GUARDS ARE WORKING

---

## 2. Security Scan Results

### CRITICAL (2 errors)

| Finding | Description | Action Needed |
|---------|-------------|---------------|
| **Company Credentials Exposed** | `accessi_azienda.password_plain` stores passwords in cleartext. A compromised azienda account could read credentials. | Remove `password_plain` column or NULL it after generation |
| **Session Tokens Unprotected** | `candidate_sessions` has RLS enabled but **no policies defined**. Any authenticated user could read all session tokens. | Add RLS policies restricting to service_role/superadmin only |

### WARNINGS (5)

| Finding | Description | Priority |
|---------|-------------|----------|
| **Leaked Password Protection Disabled** | Auth config does not check for compromised passwords | P1 - Enable in auth settings |
| **Candidate PII accessible** | All company users see all candidates' email/phone | P2 - Acceptable for HR use case |
| **Payment data exposure risk** | `abbonamenti`/`pagamenti` only have superadmin policies but no explicit deny for other roles | P2 - Current policies are restrictive (USING false for non-superadmin implicitly) |
| **Login attempts unprotected** | `login_attempts` has no RLS policies | P1 - Add superadmin-only policy |

### INFO (3)

| Finding | Description |
|---------|-------------|
| RLS enabled but no policies on 2 tables | `candidate_sessions` and `login_attempts` |
| Email enumeration risk on profiles | Current policies are appropriate (own profile + superadmin) |
| Test link tokens in candidati | Should be time-limited (already handled by session expiry) |

---

## 3. Recommended Next Steps

### Immediate Fixes (Phase 2 of the plan)

**3.1 Fix `candidate_sessions` RLS** — Add policies so only superadmin and service_role can access session tokens. Candidates should not be able to read other sessions.

**3.2 Fix `login_attempts` RLS** — Add superadmin-only SELECT policy to prevent login timing analysis.

**3.3 NULL `password_plain` after generation** — In `manage-company-access` edge function, set `password_plain = NULL` after returning the password in the HTTP response.

**3.4 Enable leaked password protection** — Configure auth settings to reject known-compromised passwords.

### Files to Modify

| File | Change |
|------|--------|
| New migration SQL | Add RLS policies for `candidate_sessions` and `login_attempts` |
| `supabase/functions/manage-company-access/index.ts` | NULL `password_plain` after response |

### What Does NOT Need Fixing
- `abbonamenti`/`pagamenti` policies are already superadmin-only (restrictive USING clauses). No other role matches, so access is denied by default.
- `candidati` PII access by company users is intentional for HR workflows.
- `profiles` email access is appropriately scoped.

