import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  ClipboardList,
  Eye,
  EyeOff,
  HardHat,
  Loader2,
  LogOut,
  Pencil,
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
import { Candidato, ProfiloCandidato } from '@/types/database';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';

/**
 * Area riservata del candidato: stato dell'analisi, visibilità Banca Talenti,
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
              : 'Non compari più nella Banca Talenti.',
          }),
      }
    );
  };

  const salvaContatti = () => {
    updateMutation.mutate(
      { telefono: telefono.trim() || null, provincia: provincia.trim() || null },
      { onSuccess: () => setEditContatti(false) }
    );
  };

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
                      { label: 'Essere', v: profiloCandidato.essere_pct },
                      { label: 'Fare', v: profiloCandidato.fare_pct },
                      { label: 'Avere', v: profiloCandidato.avere_pct },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-[#f7f4f0] p-3 text-center">
                        <div className="text-xl font-bold text-[#1e3a5f]">
                          {m.v !== null ? `${Math.round(m.v)}%` : '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {profiloCandidato?.profilo_tipo_v5 && (
                  <p className="text-sm text-muted-foreground">
                    Profilo:{' '}
                    <Badge variant="secondary">
                      {getProfiloTipoV5Label(profiloCandidato.profilo_tipo_v5)}
                    </Badge>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  242 domande, circa 15 minuti, anche dal telefono. Senza l’analisi il tuo profilo
                  non può comparire nella Banca Talenti.
                </p>
                <Button asChild className="bg-[#f09133] hover:bg-[#e07a1f] text-white">
                  <Link to="/test/privacy">Inizia l’analisi</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Visibilità Banca Talenti ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardHat className="h-5 w-5 text-primary" />
              Visibilità nella Banca Talenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!marketplaceDisponibile ? (
              <p className="text-sm text-muted-foreground">
                La Banca Talenti sarà disponibile a breve: torna a controllare qui.
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
                    aria-label="Visibilità nella Banca Talenti"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {testFatto
                    ? 'Le imprese vedono ruolo, zona e profilo psicoattitudinale — mai il tuo nome o i tuoi contatti. Quelli diventano visibili solo all’impresa che sblocca il tuo profilo. Puoi disattivare quando vuoi.'
                    : 'Completa prima l’analisi: nella Banca Talenti compaiono solo profili con analisi completata.'}
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

        <p className="text-xs text-muted-foreground text-center">
          Per cancellare il profilo scrivi a{' '}
          <a href="mailto:privacy@talentiedili.it" className="underline">
            privacy@talentiedili.it
          </a>
          .
        </p>
      </main>
    </div>
  );
}
