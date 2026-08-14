/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Client Supabase finto per la modalità demo locale.
 *
 * NON viene mai incluso nel bundle di produzione: è agganciato solo da
 * `vite.demo.config.ts`, che sostituisce l'import di
 * `@/integrations/supabase/client` con questo modulo. Si avvia con:
 *
 *     npm run dev:demo
 *
 * Serve a vedere e rifinire le schermate dell'area riservata senza avere
 * credenziali reali. I dati sono inventati ma realistici: ruoli edili veri,
 * stati misti (test fatti, in attesa, in ritardo) e punteggi coerenti.
 */

const AZIENDA_ID = 'demo-azienda-0001';
const USER_ID = 'demo-user-0001';

/* Ruolo della sessione demo: `?demo=superadmin` nell'URL per vedere le
   schermate di chi gestisce le aziende, senza riavviare il server. */
const DEMO_PARAM =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') : null;
const RUOLO_DEMO: 'azienda' | 'superadmin' | 'candidato' =
  DEMO_PARAM === 'superadmin' || DEMO_PARAM === 'candidato' ? DEMO_PARAM : 'azienda';

const oggi = new Date();
const giorniFa = (n: number) => new Date(oggi.getTime() - n * 86_400_000).toISOString();

interface Riga { [k: string]: any }

/* ─────────────── dati demo ─────────────── */

const AZIENDE: Riga[] = [
  {
    id: AZIENDA_ID,
    nome: 'Costruzioni Bianchi Srl',
    attiva: true,
    email_contatto: 'amministrazione@costruzionibianchi.it',
    telefono: '0114567890',
    indirizzo: 'Via Nizza 128',
    citta: 'Torino',
    cap: '10126',
    provincia: 'TO',
    partita_iva: '01234567890',
    codice_fiscale: '01234567890',
    codice_sdi: 'M5UXCR1',
    pec: 'costruzionibianchi@pec.it',
    created_at: giorniFa(400),
  },
  {
    id: 'demo-azienda-0002',
    nome: 'Edilnova Costruzioni Spa',
    attiva: true,
    settore: 'Costruzioni generali',
    email_contatto: 'info@edilnova.it',
    telefono: '0295551234',
    citta: 'Milano',
    provincia: 'MI',
    partita_iva: '09876543210',
    created_at: giorniFa(210),
  },
  {
    id: 'demo-azienda-0003',
    nome: 'Impresa Verdi & Figli Snc',
    attiva: true,
    settore: 'Ristrutturazioni',
    email_contatto: 'verdi@impresaverdi.it',
    telefono: '0459998877',
    citta: 'Verona',
    provincia: 'VR',
    created_at: giorniFa(60),
  },
  {
    id: 'demo-azienda-0004',
    nome: 'Cantieri del Sud Srl',
    attiva: false,
    settore: 'Opere pubbliche',
    email_contatto: 'amministrazione@cantieridelsud.it',
    citta: 'Bari',
    provincia: 'BA',
    created_at: giorniFa(520),
  },
];

const PROFILES: Riga[] = [
  {
    id: 'demo-profile-0001',
    user_id: USER_ID,
    email: 'demo@costruzionibianchi.it',
    nome: 'Giulia',
    cognome: 'Bianchi',
    ruolo: RUOLO_DEMO,
    azienda_id: RUOLO_DEMO === 'azienda' ? AZIENDA_ID : null,
    created_at: giorniFa(400),
  },
  {
    id: 'demo-profile-0002',
    user_id: 'demo-user-0002',
    email: 'ufficio@costruzionibianchi.it',
    nome: 'Marta',
    cognome: 'Conti',
    ruolo: 'azienda',
    azienda_id: AZIENDA_ID,
    created_at: giorniFa(120),
  },
];

/** traits verosimili: buon capocantiere, muratore medio, profilo a rischio */
const traits = (over: Record<string, number> = {}) => ({
  ORG: 20, AUT: 30, GP: 25, ADS: 35, DET: 40, VEN: -10, HRM: 15, LDR: 30,
  PRO: 25, COM: 20, ESP: 10, RC: 15, FIN: 5, SUC: 25, PRI: 40, CTRL: 0, ...over,
});

interface Seed {
  nome: string; cognome: string; funzione: string; ruolo_attuale: string;
  eta: number; sesso: string; provincia: string;
  giorniCreato: number; giorniTest?: number; fit?: number; verdict?: string;
  traits?: Record<string, number>; reliability?: string;
}

const SEEDS: Seed[] = [
  { nome: 'Marco', cognome: 'Rossi', funzione: 'Capocantiere', ruolo_attuale: 'Top', eta: 41, sesso: 'M', provincia: 'Torino', giorniCreato: 12, giorniTest: 1, fit: 88, verdict: 'IDONEO', traits: { ADS: 55, GP: 48, LDR: 60, DET: 58, PRI: 50 } },
  { nome: 'Luca', cognome: 'Ferrari', funzione: 'Muratore', ruolo_attuale: 'Operativo', eta: 34, sesso: 'M', provincia: 'Cuneo', giorniCreato: 20, giorniTest: 2, fit: 64, verdict: 'VALUTARE', traits: { ADS: 20, GP: 10, PRI: 30 } },
  { nome: 'Andrea', cognome: 'Toselli', funzione: 'Gruista', ruolo_attuale: 'Operativo', eta: 29, sesso: 'M', provincia: 'Torino', giorniCreato: 9, giorniTest: 3, fit: 71, verdict: 'IDONEO', traits: { ADS: 42, GP: 38, RC: 35 } },
  { nome: 'Sara', cognome: 'Conti', funzione: 'Impiegato amministrativo', ruolo_attuale: 'Intermedio', eta: 37, sesso: 'F', provincia: 'Asti', giorniCreato: 30, giorniTest: 5, fit: 79, verdict: 'IDONEO', traits: { ORG: 55, ADS: 60, PRI: 45, LDR: 5 } },
  { nome: 'Davide', cognome: 'Moretti', funzione: 'Capisquadra', ruolo_attuale: 'Intermedio', eta: 46, sesso: 'M', provincia: 'Torino', giorniCreato: 45, giorniTest: 6, fit: 52, verdict: 'NON_IDONEO', traits: { ADS: -30, GP: -35, COM: -20, LDR: 45 }, reliability: 'CAUTION' },
  { nome: 'Fabio', cognome: 'Greco', funzione: 'Carpentiere', ruolo_attuale: 'Operativo', eta: 31, sesso: 'M', provincia: 'Novara', giorniCreato: 60, giorniTest: 25, fit: 68, verdict: 'VALUTARE', traits: { ADS: 30, GP: 15 } },
  { nome: 'Elena', cognome: 'Vitali', funzione: 'Geometra di cantiere', ruolo_attuale: 'Intermedio', eta: 33, sesso: 'F', provincia: 'Torino', giorniCreato: 70, giorniTest: 40, fit: 84, verdict: 'IDONEO', traits: { ORG: 50, DET: 45, COM: 40, ADS: 48 } },
  { nome: 'Simone', cognome: 'Barone', funzione: 'Preventivista', ruolo_attuale: 'Intermedio', eta: 39, sesso: 'M', provincia: 'Alessandria', giorniCreato: 90, giorniTest: 62, fit: 75, verdict: 'IDONEO', traits: { ORG: 52, ADS: 55, PRI: 40 } },
  // in attesa: due in ritardo (>5 giorni) e uno appena invitato
  { nome: 'Nicola', cognome: 'Ricci', funzione: 'Ferraiolo', ruolo_attuale: 'Operativo', eta: 27, sesso: 'M', provincia: 'Cuneo', giorniCreato: 11 },
  { nome: 'Paolo', cognome: 'De Luca', funzione: 'Muratore', ruolo_attuale: 'Operativo', eta: 44, sesso: 'M', provincia: 'Torino', giorniCreato: 8 },
  { nome: 'Chiara', cognome: 'Fontana', funzione: 'Impiegato amministrativo', ruolo_attuale: 'Intermedio', eta: 26, sesso: 'F', provincia: 'Asti', giorniCreato: 2 },
];

const CANDIDATI: Riga[] = SEEDS.map((s, i) => ({
  id: `demo-cand-${String(i + 1).padStart(4, '0')}`,
  // In modalità candidato la prima riga è l'utente loggato: senza, l'area
  // personale farebbe partire il self-heal e mostrerebbe un profilo vuoto.
  user_id: i === 0 && RUOLO_DEMO === 'candidato' ? USER_ID : null,
  azienda_id: AZIENDA_ID,
  nome: s.nome,
  cognome: s.cognome,
  email: `${s.nome.toLowerCase()}.${s.cognome.toLowerCase().replace(/\s/g, '')}@example.it`,
  telefono: `33${i}1234567`,
  eta: s.eta,
  sesso: s.sesso,
  provincia: s.provincia,
  ruolo_attuale: s.ruolo_attuale,
  funzione: s.funzione,
  test_completato: s.giorniTest !== undefined,
  data_test: s.giorniTest !== undefined ? giorniFa(s.giorniTest) : null,
  test_link_token: null,
  username: null,
  marketplace_visible: i === 0,
  created_at: giorniFa(s.giorniCreato),
  updated_at: giorniFa(s.giorniCreato),
}));

const SBLOCCHI: Riga[] = [
  {
    id: 'demo-sblocco-0001',
    candidato_id: 'demo-cand-0001',
    azienda_id: 'demo-azienda-0002',
    created_at: giorniFa(4),
    aziende: { nome: 'Edilnova Costruzioni Spa' },
  },
  {
    id: 'demo-sblocco-0002',
    candidato_id: 'demo-cand-0001',
    azienda_id: 'demo-azienda-0003',
    created_at: giorniFa(18),
    aziende: { nome: 'Impresa Verdi & Figli Snc' },
  },
];

const PROFILI: Riga[] = SEEDS.flatMap((s, i) => {
  if (s.giorniTest === undefined) return [];
  const t = traits(s.traits);
  const media = (codes: string[]) => Math.round(codes.reduce((a, c) => a + (t[c as keyof typeof t] + 100) / 2, 0) / codes.length);
  return [{
    id: `demo-prof-${i}`,
    candidato_id: `demo-cand-${String(i + 1).padStart(4, '0')}`,
    essere_pct: media(['ORG', 'AUT', 'GP']),
    fare_pct: media(['ADS', 'DET', 'VEN', 'HRM']),
    avere_pct: media(['LDR', 'PRO', 'COM', 'ESP']),
    leadership_pct: media(['LDR']),
    maturita_pct: media(['AUT']),
    potenziale_pct: media(['PRO']),
    traits_v5: t,
    scale_punteggi: t,
    profilo_tipo_v5: s.fit && s.fit >= 80 ? 'LEADER' : s.fit && s.fit >= 65 ? 'EXECUTOR' : 'IN_TRANSIZIONE',
    profilo_tipo: null,
    reliability_index: s.reliability ?? 'YES',
    syndromes_detected: s.reliability === 'CAUTION' ? [{ code: 'S16', severity: 'MEDIA', label: 'BRUTTO CARATTERE' }] : [],
    out_points: [],
    strength_points: [],
    stress_zone: false,
    schematicita: null,
    assessment_version: 'v5',
    created_at: giorniFa(s.giorniTest),
    updated_at: giorniFa(s.giorniTest),
  }];
});

const ANALISI: Riga[] = SEEDS.flatMap((s, i) =>
  s.fit === undefined ? [] : [{
    id: `demo-an-${i}`,
    candidato_id: `demo-cand-${String(i + 1).padStart(4, '0')}`,
    fit_score: s.fit,
    fit_verdict: s.verdict,
  }]
);

/* Profili pubblici della piattaforma (candidati auto-registrati, altra azienda) */
const MARKETPLACE: Riga[] = [
  { id: 'demo-mp-1', funzione: 'Capocantiere', ruolo_attuale: 'Candidato', eta: 38, provincia: 'Torino', anni_esperienza: 12, created_at: giorniFa(4), profilo_tipo_v5: 'LEADER', essere_pct: 74, fare_pct: 81, avere_pct: 69, traits_v5: traits({ ADS: 50, GP: 44, PRI: 46, RC: 30 }), reliability_index: 'YES', sbloccato: false },
  { id: 'demo-mp-2', funzione: 'Muratore', ruolo_attuale: 'Candidato', eta: 34, provincia: 'Cuneo', anni_esperienza: 8, created_at: giorniFa(7), profilo_tipo_v5: 'EXECUTOR', essere_pct: 66, fare_pct: 71, avere_pct: 58, traits_v5: traits({ ADS: 58, GP: 40, PRI: 52 }), reliability_index: 'YES', sbloccato: true },
  { id: 'demo-mp-3', funzione: 'Gruista', ruolo_attuale: 'Candidato', eta: 45, provincia: 'Asti', anni_esperienza: 20, created_at: giorniFa(12), profilo_tipo_v5: 'EXECUTOR', essere_pct: 70, fare_pct: 64, avere_pct: 55, traits_v5: traits({ ADS: 36, GP: 30, RC: 40 }), reliability_index: 'CAUTION', sbloccato: false },
  { id: 'demo-mp-4', funzione: 'Geometra di cantiere', ruolo_attuale: 'Candidato', eta: 30, provincia: 'Torino', anni_esperienza: 5, created_at: giorniFa(18), profilo_tipo_v5: 'STRATEGIST', essere_pct: 68, fare_pct: 77, avere_pct: 72, traits_v5: traits({ ORG: 48, DET: 42, COM: 38 }), reliability_index: 'YES', sbloccato: false },
  { id: 'demo-mp-5', funzione: 'Preventivista', ruolo_attuale: 'Candidato', eta: 36, provincia: 'Novara', anni_esperienza: 10, created_at: giorniFa(25), profilo_tipo_v5: 'EXECUTOR', essere_pct: 62, fare_pct: 79, avere_pct: 51, traits_v5: traits({ ORG: 55, ADS: 60 }), reliability_index: 'YES', sbloccato: false },
  { id: 'demo-mp-6', funzione: 'Carpentiere', ruolo_attuale: 'Candidato', eta: 28, provincia: 'Torino', anni_esperienza: 6, created_at: giorniFa(31), profilo_tipo_v5: 'EXECUTOR', essere_pct: 59, fare_pct: 68, avere_pct: 60, traits_v5: traits({ ADS: 22, GP: -25 }), reliability_index: 'YES', sbloccato: false },
];

const TABELLE: Record<string, Riga[]> = {
  aziende: AZIENDE,
  profiles: PROFILES,
  candidati: CANDIDATI,
  profili_candidato: PROFILI,
  analisi_candidato: ANALISI,
  marketplace_profili: MARKETPLACE,
  marketplace_sblocchi: SBLOCCHI,
  risultati: [],
  risposte: [],
  leads: [],
  accessi_azienda: [],
  domande: [],
};

/* ─────────────── query builder finto ─────────────── */

/** Innesta le relazioni richieste nella select (`*, aziende(nome), profili_candidato(*)`). */
function innesta(riga: Riga, tabella: string, select: string): Riga {
  const out = { ...riga };
  if (tabella === 'candidati') {
    if (select.includes('aziende')) {
      out.aziende = AZIENDE.find((a) => a.id === riga.azienda_id) ?? null;
    }
    if (select.includes('profili_candidato')) {
      const p = PROFILI.find((x) => x.candidato_id === riga.id) ?? null;
      // one-to-one lato Supabase: oggetto, non array
      out.profili_candidato = p;
    }
    if (select.includes('analisi_candidato')) {
      out.analisi_candidato = ANALISI.filter((x) => x.candidato_id === riga.id);
    }
  }
  if (tabella === 'aziende' && select.includes('candidati')) {
    out.candidati = CANDIDATI.filter((c) => c.azienda_id === riga.id).map((c) => ({
      id: c.id, test_completato: c.test_completato,
    }));
  }
  return out;
}

class FintaQuery implements PromiseLike<any> {
  private righe: Riga[];
  private conta = false;
  constructor(private tabella: string, private select = '*') {
    this.righe = [...(TABELLE[tabella] ?? [])];
  }
  withCount(c: boolean) { this.conta = c; return this; }

  eq(col: string, val: any) {
    // filtro su colonna innestata (es. "analisi_candidato.fit_verdict")
    if (col.includes('.')) {
      const [rel, campo] = col.split('.');
      this.righe = this.righe.filter((r) => {
        const src = rel === 'analisi_candidato' ? ANALISI.filter((a) => a.candidato_id === r.id) : [];
        return src.some((x) => x[campo] === val);
      });
      return this;
    }
    this.righe = this.righe.filter((r) => r[col] === val);
    return this;
  }
  neq(col: string, val: any) { this.righe = this.righe.filter((r) => r[col] !== val); return this; }
  gte(col: string, val: any) { this.righe = this.righe.filter((r) => r[col] != null && r[col] >= val); return this; }
  lte(col: string, val: any) { this.righe = this.righe.filter((r) => r[col] != null && r[col] <= val); return this; }
  ilike(col: string, pattern: string) {
    const rx = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.righe = this.righe.filter((r) => rx.test(String(r[col] ?? '')));
    return this;
  }
  or(expr: string) {
    const clausole = expr.split(',').map((c) => {
      const [col, , val] = c.split('.');
      return { col, rx: new RegExp(String(val ?? '').replace(/%/g, '.*'), 'i') };
    });
    this.righe = this.righe.filter((r) => clausole.some((c) => c.rx.test(String(r[c.col] ?? ''))));
    return this;
  }
  in(col: string, vals: any[]) { this.righe = this.righe.filter((r) => vals.includes(r[col])); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending ?? true;
    const chiave = col.includes('(') ? null : col;
    this.righe.sort((a, b) => {
      const av = chiave ? a[chiave] ?? '' : (ANALISI.find((x) => x.candidato_id === a.id)?.fit_score ?? -1);
      const bv = chiave ? b[chiave] ?? '' : (ANALISI.find((x) => x.candidato_id === b.id)?.fit_score ?? -1);
      if (av === bv) return 0;
      return (av < bv ? -1 : 1) * (asc ? 1 : -1);
    });
    return this;
  }
  limit(n: number) { this.righe = this.righe.slice(0, n); return this; }
  range(da: number, a: number) {
    const totale = this.righe.length;
    const pagina = this.righe.slice(da, a + 1).map((r) => innesta(r, this.tabella, this.select));
    return Promise.resolve({ data: pagina, error: null, count: totale });
  }
  maybeSingle() {
    const r = this.righe[0];
    return Promise.resolve({ data: r ? innesta(r, this.tabella, this.select) : null, error: null });
  }
  single() { return this.maybeSingle(); }
  then<T1 = any, T2 = never>(
    onOk?: ((v: any) => T1 | PromiseLike<T1>) | null,
    onErr?: ((r: any) => T2 | PromiseLike<T2>) | null
  ): PromiseLike<T1 | T2> {
    const data = this.righe.map((r) => innesta(r, this.tabella, this.select));
    return Promise.resolve({ data, error: null, count: this.conta ? data.length : null }).then(onOk, onErr);
  }
}

const sessioneDemo = {
  access_token: 'demo-token',
  user: { id: USER_ID, email: 'demo@costruzionibianchi.it', user_metadata: {} },
};

export const supabase: any = {
  from(tabella: string) {
    return {
      select: (sel = '*', opts?: { count?: string }) =>
        new FintaQuery(tabella, sel).withCount(!!opts?.count),
      insert: (righe: any) => {
        const arr = Array.isArray(righe) ? righe : [righe];
        (TABELLE[tabella] ??= []).push(...arr.map((r, i) => ({ id: `demo-new-${Date.now()}-${i}`, ...r })));
        return Promise.resolve({ data: arr, error: null });
      },
      upsert: (righe: any) => {
        const arr = Array.isArray(righe) ? righe : [righe];
        (TABELLE[tabella] ??= []).push(...arr);
        return Promise.resolve({ data: arr, error: null });
      },
      update: (patch: any) => ({
        eq: (col: string, val: any) => {
          (TABELLE[tabella] ?? []).forEach((r) => { if (r[col] === val) Object.assign(r, patch); });
          return Promise.resolve({ data: null, error: null });
        },
      }),
      delete: () => ({
        eq: (col: string, val: any) => {
          TABELLE[tabella] = (TABELLE[tabella] ?? []).filter((r) => r[col] !== val);
          return Promise.resolve({ data: null, error: null });
        },
        in: (col: string, vals: any[]) => {
          TABELLE[tabella] = (TABELLE[tabella] ?? []).filter((r) => !vals.includes(r[col]));
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };
  },
  auth: {
    getSession: () => Promise.resolve({ data: { session: sessioneDemo }, error: null }),
    getUser: () => Promise.resolve({ data: { user: sessioneDemo.user }, error: null }),
    onAuthStateChange: (cb: any) => {
      setTimeout(() => cb('SIGNED_IN', sessioneDemo), 0);
      return { data: { subscription: { unsubscribe() {} } } };
    },
    signInWithPassword: () => Promise.resolve({ data: { session: sessioneDemo }, error: null }),
    signUp: () => Promise.resolve({ data: { session: sessioneDemo, user: sessioneDemo.user }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: { user: sessioneDemo.user }, error: null }),
  },
};
