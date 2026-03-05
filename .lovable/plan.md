

# Rimuovere la sezione "Sicurezza"

## Cosa cambiare

**File**: `src/pages/Home.tsx`, righe 1826-1861

Eliminare l'intera sezione "Trust / Sicurezza" che include il titolo "I tuoi dati sono al sicuro", i 5 badge (GDPR, Server EU, Dati crittografati, ISO 27001, Nessuna installazione) e la nota di conformità.

Rimuovere anche la costante `TRUST_BADGES` se presente tra i dati statici.

Nessun impatto su altre sezioni — la sezione Pricing che segue resta invariata.

