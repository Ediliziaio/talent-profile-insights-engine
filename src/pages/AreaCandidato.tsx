import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  Building2,
  ClipboardList,
  Eye,
  EyeOff,
  HardHat,
  Loader2,
  LogOut,
  Pencil,
  Trash2,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabaseLazy';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Candidato, ProfiloCandidato, TraitCode } from '@/types/database';
import { getProfiloTipoV5Label, getProfiloTipoV5Description } from '@/lib/scoringV5';
import { RUOLI_V5 } from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached } from '@/lib/roleMatchingV5Cache';
import { TraitScores } from '@/lib/syndromes';
import { RUOLI, ALTRI_RUOLI } from '@/data/ruoli';

const TRAIT_CODES: TraitCode[] = [
  'ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM',
  'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI',
];

const OPZIONI_RUOLO = [...RUOLI.map((r) => r.nome), ...ALTRI_RUOLI, 'Altro'];

function toTraitScores(raw: unknown): TraitScores | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, number>;
  const out = {} as TraitScores;
  for (const code of TRAIT_CODES) out[code] = t[code] ?? 0;
  return out;
}

/**
 * Area riservata del candidato: stato dell'analisi, visibilità piattaforma,
 * dati di contatto. Se la riga candidati non esiste ancora (registrazione con
 * conferma email, o migration applicata dopo il signup) la ricrea dai metadati
 * salvati nell'utente auth (self-heal).
 */
export default function AreaCandidato() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [editContatti, setEditContatti] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [provincia, setProvincia] = useState('');
  /* Il ruolo cercato è il campo su cui le imprese filtrano: era l'unico dato
     importante che il candidato non poteva più toccare dopo l'iscrizione. */
  const [funzione, setFunzione] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['area-candidato', user?.id],
    enabled: !!user && profile?.ruolo === 'candidato',
    queryFn: async () => {
      const supabase = await getSupabase();

      let { data: candidato } = await supabase
        .from('candidati')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      // Self-heal: riga assente → la creo dai metadati del signup
      if (!candidato) {
        const meta = (user!.user_metadata ?? {}) as Record<string, unknown>;
        const base = {
          user_id: user!.id,
          nome: String(meta.nome ?? '').trim() || 'Candidato',
          cognome: String(meta.cognome ?? '').trim() || '',
          email: user!.email ?? null,
          telefono: (meta.telefono as string) ?? null,
          funzione: (meta.funzione as string) ?? null,
          ruolo_attuale: 'Candidato',
        };
        const optin = meta.marketplace_optin === true;
        let { error } = await supabase.from('candidati').insert({
          ...base,
          provincia: (meta.provincia as string) ?? null,
          marketplace_visible: optin,
          marketplace_consenso_at: optin ? new Date().toISOString() : null,
        } as never);
        if (error) {
          ({ error } = await supabase.from('candidati').insert(base as never));
        }
        if (!error) {
          ({ data: candidato } = await supabase
            .from('candidati')
            .select('*')
            .eq('user_id', user!.id)
            .maybeSingle());
        }
      }

      let profiloCandidato: ProfiloCandidato | null = null;
      if (candidato?.test_completato) {
        const { data: p } = await supabase
          .from('profili_candidato')
          .select('*')
          .eq('candidato_id', candidato.id)
          .maybeSingle();
        profiloCandidato = p as ProfiloCandidato | null;
      }

      return { candidato: candidato as Candidato | null, profiloCandidato };
    },
  });

  const candidato = data?.candidato;
  const profiloCandidato = data?.profiloCandidato;
  // Colonna assente = migration non applicata: il toggle non viene mostrato
  const marketplaceDisponibile = candidato ? 'marketplace_visible' in candidato : false;

  /* Chi ha sbloccato il profilo. Il candidato decide di mettersi in vetrina
     e poi non sa più niente: non è trasparente, ed è anche il dato che gli
     dice se la scelta sta funzionando. */
  const { data: sblocchi } = useQuery({
    queryKey: ['sblocchi-candidato', candidato?.id],
    enabled: !!candidato?.id,
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data: righe, error } = await supabase
        .from('marketplace_sblocchi' as never)
        .select('created_at, aziende(nome)')
        .eq('candidato_id' as never, candidato!.id)
        .order('created_at', { ascending: false });
      // Tabella assente = migration non applicata: la sezione resta nascosta.
      if (error) return null;
      return righe as unknown as { created_at: string; aziende: { nome: string } | null }[];
    },
  });

  const eliminaProfilo = useMutation({
    mutationFn: async () => {
      const supabase = await getSupabase();
      const { data: sessione } = await supabase.auth.getSession();
      if (!sessione.session) throw new Error('Sessione scaduta');
      const risposta = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-my-account`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessione.session.access_token}` },
        }
      );
      if (!risposta.ok) {
        const esito = await risposta.json().catch(() => ({}));
        throw new Error(esito.error ?? 'Cancellazione non riuscita');
      }
    },
    onSuccess: async () => {
      toast({
        title: 'Profilo cancellato',
        description: 'I tuoi dati sono stati eliminati. Grazie e in bocca al lupo.',
      });
      await signOut();
    },
    onError: (e: Error) =>
      toast({ title: 'Cancellazione non riuscita', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('candidati')
        .update(patch as never)
        .eq('id', candidato!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area-candidato'] });
    },
    onError: () => {
      toast({ title: 'Errore', description: 'Modifica non salvata, riprova.', variant: 'destructive' });
    },
  });

  const toggleMarketplace = (visibile: boolean) => {
    updateMutation.mutate(
      {
        marketplace_visible: visibile,
        marketplace_consenso_at: visibile ? new Date().toISOString() : null,
      },
      {
        onSuccess: () =>
          toast({
            title: visibile ? 'Profilo visibile' : 'Profilo nascosto',
            description: visibile
              ? 'Le imprese ora possono trovarti in forma anonima.'
              : 'Non compari più sulla piattaforma.',
          }),
      }
    );
  };

  const salvaContatti = () => {
    updateMutation.mutate(
      {
        telefono: telefono.trim() || null,
        provincia: provincia.trim() || null,
        funzione: funzione.trim() || null,
      },
      { onSuccess: () => setEditContatti(false) }
    );
  };

  /* Cosa il candidato riceve indietro. Finora: tre percentuali chiamate
     "Essere / Fare / Avere" e un'etichetta. Per 242 domande è poco, e a chi
     si iscrive spontaneamente chiediamo di mettersi in vetrina in cambio di
     niente. I mestieri più adatti si calcolano dagli stessi tratti che già
     abbiamo, senza chiedere altro. */
  const mestieriAdatti = useMemo(() => {
    const traits = toTraitScores(profiloCandidato?.traits_v5);
    if (!traits) return [];
    return RUOLI_V5.map((ruolo) => {
      const m = calculateRoleMatchingV5Cached(ruolo, traits, candidato?.eta ?? undefined);
      return { ruolo, compatibilita: m.compatibilitaPct, configurato: m.ruoloConfigurato };
    })
      .filter((m) => m.configurato)
      .sort((a, b) => b.compatibilita - a.compatibilita)
      .slice(0, 3);
  }, [profiloCandidato?.traits_v5, candidato?.eta]);

  if (!authLoading && (!user || profile?.ruolo !== 'candidato')) {
    return <Navigate to={user ? '/dashboard' : '/auth'} replace />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4f0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  const testFatto = !!candidato?.test_completato;

  return (
    <div className="min-h-screen bg-[#f7f4f0]">
      <header className="bg-white border-b border-[#e5e0db]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Talenti Edili — home">
            <img src="/talenti-edili-logo.svg" alt="Talenti Edili" className="h-9" />
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-[#6b7280]">
            <LogOut className="h-4 w-4" /> Esci
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Ciao{candidato?.nome ? ` ${candidato.nome}` : ''}
          </h1>
          <p className="text-[#6b7280] mt-1">La tua area personale su Talenti Edili.</p>
        </div>

        {/* ─── Stato analisi ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-primary" />
              La tua analisi psicoattitudinale
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testFatto ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Analisi completata</span>
                  {candidato?.data_test && (
                    <span className="text-sm text-muted-foreground">
                      il {new Date(candidato.data_test).toLocaleDateString('it-IT')}
                    </span>
                  )}
                </div>
                {profiloCandidato && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      /* "Essere / Fare / Avere" sono i nomi interni delle
                         macro-aree: a chi ha fatto il test non dicono niente. */
                      { label: 'Come ti gestisci', v: profiloCandidato.essere_pct },
                      { label: 'Come lavori', v: profiloCandidato.fare_pct },
                      { label: 'Come stai in squadra', v: profiloCandidato.avere_pct },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-[#f7f4f0] p-3 text-center">
                        <div className="text-xl font-bold text-[#1e3a5f]">
                          {m.v !== null ? `${Math.round(m.v)}%` : '—'}
                        </div>
                        <div className="text-[11px] leading-tight text-muted-foreground mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {profiloCandidato?.profilo_tipo_v5 && (
                  <div className="rounded-lg border border-[#e5e0db] p-3">
                    <Badge variant="secondary" className="mb-1.5">
                      {getProfiloTipoV5Label(profiloCandidato.profilo_tipo_v5)}
                    </Badge>
                    <p className="text-sm text-[#3d3935] leading-relaxed">
                      {getProfiloTipoV5Description(profiloCandidato.profilo_tipo_v5)}
                    </p>
                  </div>
                )}

                {mestieriAdatti.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                      <Trophy className="h-4 w-4 text-[#f09133]" />
                      I mestieri che ti calzano di più
                    </h3>
                    <ul className="space-y-1.5">
                      {mestieriAdatti.map((m) => (
                        <li
                          key={m.ruolo}
                          className="flex items-center justify-between gap-3 text-sm rounded-lg bg-[#f7f4f0] px-3 py-2"
                        >
                          <span>{m.ruolo}</span>
                          <span className="font-bold text-[#1e3a5f]">{m.compatibilita}%</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Calcolato sulle tue risposte. Se uno di questi ti interessa, mettilo come
                      ruolo cercato qui sotto: è il campo su cui le imprese cercano.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  242 domande, circa 15 minuti, anche dal telefono. Senza l’analisi il tuo profilo
                  non può comparire sulla piattaforma.
                </p>
                <Button asChild className="bg-[#f09133] hover:bg-[#e07a1f] text-white">
                  <Link to="/test/privacy">Inizia l’analisi</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Visibilità piattaforma ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardHat className="h-5 w-5 text-primary" />
              Visibilità sulla piattaforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!marketplaceDisponibile ? (
              <p className="text-sm text-muted-foreground">
                La piattaforma sarà disponibile a breve: torna a controllare qui.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {candidato?.marketplace_visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {candidato?.marketplace_visible
                        ? 'Visibile alle imprese (in forma anonima)'
                        : 'Non visibile alle imprese'}
                    </span>
                  </div>
                  <Switch
                    checked={!!candidato?.marketplace_visible}
                    onCheckedChange={toggleMarketplace}
                    disabled={updateMutation.isPending || !testFatto}
                    aria-label="Visibilità sulla piattaforma"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {testFatto
                    ? 'Le imprese vedono ruolo, zona e profilo psicoattitudinale — mai il tuo nome o i tuoi contatti. Quelli diventano visibili solo all’impresa che sblocca il tuo profilo. Puoi disattivare quando vuoi.'
                    : 'Completa prima l’analisi: sulla piattaforma compaiono solo profili con analisi completata.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Dati di contatto ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pencil className="h-5 w-5 text-primary" />
                I tuoi dati
              </CardTitle>
              {!editContatti && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTelefono(candidato?.telefono ?? '');
                    setProvincia(candidato?.provincia ?? '');
                    setFunzione(candidato?.funzione ?? '');
                    setEditContatti(true);
                  }}
                >
                  Modifica
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editContatti ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ac-telefono">Telefono</Label>
                    <Input
                      id="ac-telefono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ac-provincia">Provincia</Label>
                    <Input
                      id="ac-provincia"
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="ac-funzione">Ruolo cercato</Label>
                    <Select value={funzione} onValueChange={setFunzione}>
                      <SelectTrigger id="ac-funzione" className="mt-1.5">
                        <SelectValue placeholder="Che lavoro cerchi?" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {OPZIONI_RUOLO.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={salvaContatti} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditContatti(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{candidato?.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Telefono</dt>
                  <dd className="font-medium">{candidato?.telefono ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Provincia</dt>
                  <dd className="font-medium">{candidato?.provincia ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ruolo cercato</dt>
                  <dd className="font-medium">{candidato?.funzione ?? '—'}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* ─── Chi ti ha sbloccato ─── */}
        {sblocchi && sblocchi.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                Chi ha visto il tuo profilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sblocchi.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm border-b border-[#e5e0db] last:border-0 pb-2 last:pb-0"
                  >
                    <span className="font-medium">{s.aziende?.nome ?? 'Un’impresa'}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(s.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Queste imprese hanno il tuo nome e i tuoi contatti. Se non ti hanno ancora
                scritto, puoi contattarle tu.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── Cancellazione ─── */}
        <Card className="border-[#e5e0db]">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Cancella il profilo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Spariscono i tuoi dati, le risposte al test e l’analisi. Non si torna indietro.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive shrink-0">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Cancella
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancellare il tuo profilo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Eliminiamo i tuoi dati, le risposte al test e l’analisi. Sparisci anche dalla
                    piattaforma. Non si può tornare indietro: per rientrare dovrai rifare il test.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Lascia stare</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => eliminaProfilo.mutate()}
                  >
                    {eliminaProfilo.isPending && (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    )}
                    Sì, cancella tutto
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
