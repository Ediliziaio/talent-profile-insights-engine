

# Fix: Show Generated Password One-Time in Candidati.tsx

## Problem
After dropping `password_plain` from the database (Phase 3), the credentials panel still references `accessoAzienda.password_plain`, which is now always `undefined`. The UI shows masked dots (`••••••••••••`) and the copy button is permanently disabled. Users cannot see or copy the password even after generating/regenerating credentials.

## Root Cause
The `credentialsMutation.onSuccess` invalidates the query, which re-fetches from the DB — but the DB no longer has `password_plain`. The generated password from the API response (`result.plainPassword`) is never captured in local state.

## Solution

**File: `src/pages/Candidati.tsx`**

1. Add a `generatedPassword` state variable to temporarily hold the password returned by the edge function after generate/regenerate.

2. In `credentialsMutation.onSuccess`, capture `result.plainPassword` into `generatedPassword` state before invalidating the query.

3. Update the password display section (lines 961-974):
   - If `generatedPassword` exists, show it in the input field (cleartext, copyable)
   - If not, show a placeholder message: "Rigenera per ottenere la password"
   - Enable/disable the copy button based on whether `generatedPassword` is set

4. Update the "Copia tutto" button (line 982) to use `generatedPassword` instead of `accessoAzienda.password_plain`.

5. Clear `generatedPassword` when the user navigates away (changes `currentAziendaId`).

### Behavior After Fix
- **First load**: Shows "Rigenera per ottenere la password" (no password stored in DB)
- **After clicking "Genera" or "Rigenera"**: Shows the actual password in cleartext, copyable
- **After page refresh**: Back to "Rigenera per ottenere la password" (password not persisted)

This matches the security design: passwords are only visible at generation time.

