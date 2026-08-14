/**
 * Impostazioni.
 *
 * La voce era già nel menu, ma con `show: false` e senza rotta: nessuno
 * poteva cambiare la propria password, aggiornare i dati dell'impresa
 * (che servono per fatturare) o dare un accesso a un collega. Un'azienda
 * era un login solo, condiviso — e con la fase della selezione appena
 * introdotta "chi ha scartato questo candidato?" non aveva risposta.
 */

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Loader2, Mail, Plus, Save, Building2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type DatiAzienda = {
  id: string;
  nome: string;
  email_contatto: string | null;
  telefono: string | null;
  indirizzo: string | null;
  citta?: string | null;
  cap?: string | null;
  provincia?: string | null;
  partita_iva?: string | null;
  codice_fiscale?: string | null;
  codice_sdi?: string | null;
  pec?: string | null;
};

const CAMPI_AZIENDA: { chiave: keyof DatiAzienda; label: string; nota?: string }[] = [
  { chiave: 'nome', label: 'Ragione sociale' },
  { chiave: 'partita_iva', label: 'Partita IVA' },
  { chiave: 'codice_fiscale', label: 'Codice fiscale' },
  { chiave: 'indirizzo', label: 'Indirizzo' },
  { chiave: 'cap', label: 'CAP' },
  { chiave: 'citta', label: 'Città' },
  { chiave: 'provincia', label: 'Provincia' },
  { chiave: 'email_contatto', label: 'Email' },
  { chiave: 'telefono', label: 'Telefono' },
  { chiave: 'pec', label: 'PEC' },
  { chiave: 'codice_sdi', label: 'Codice SDI', nota: 'Per la fattura elettronica' },
];

function Sezione({
  icona: Icona,
  titolo,
  descrizione,
  children,
}: {
  icona: React.ComponentType<{ className?: string }>;
  titolo: string;
  descrizione: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icona className="h-4 w-4 text-primary" />
          {titolo}
        </CardTitle>
        <CardDescription>{descrizione}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function Impostazioni() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const isAzienda = profile?.ruolo === 'azienda';
  const aziendaId = profile?.azienda_id;

  // ── Il mio account ──────────────────────────────────────────────────
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  useEffect(() => {
    setNome(profile?.nome ?? '');
    setCognome(profile?.cognome ?? '');
  }, [profile?.nome, profile?.cognome]);

  const salvaProfilo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ nome: nome.trim() || null, cognome: cognome.trim() || null })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Dati salvati' });
    },
    onError: () => toast({ title: 'Non è stato possibile salvare', variant: 'destructive' }),
  });

  // ── Password ────────────────────────────────────────────────────────
  const [nuovaPassword, setNuovaPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const passwordTroppoCorta = nuovaPassword.length > 0 && nuovaPassword.length < 8;
  const passwordDiverse = confermaPassword.length > 0 && nuovaPassword !== confermaPassword;

  const cambiaPassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password: nuovaPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      setNuovaPassword('');
      setConfermaPassword('');
      toast({
        title: 'Password cambiata',
        description: 'Usala dal prossimo accesso.',
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Password non cambiata', description: e.message, variant: 'destructive' }),
  });

  // ── La mia azienda ──────────────────────────────────────────────────
  const { data: azienda, isLoading: caricaAzienda } = useQuery({
    queryKey: ['azienda-impostazioni', aziendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('id', aziendaId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as DatiAzienda | null;
    },
    enabled: !!aziendaId,
  });

  const [datiAzienda, setDatiAzienda] = useState<Partial<DatiAzienda>>({});
  useEffect(() => {
    if (azienda) setDatiAzienda(azienda);
  }, [azienda]);

  const salvaAzienda = useMutation({
    mutationFn: async () => {
      const modifiche: Record<string, string | null> = {};
      for (const { chiave } of CAMPI_AZIENDA) {
        const valore = datiAzienda[chiave];
        modifiche[chiave] = typeof valore === 'string' ? valore.trim() || null : null;
      }
      const { error } = await supabase
        .from('aziende')
        .update(modifiche as never)
        .eq('id', aziendaId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['azienda-impostazioni'] });
      toast({ title: 'Dati dell’azienda salvati' });
    },
    onError: (e: Error) =>
      toast({
        title: 'Non è stato possibile salvare',
        description: e.message,
        variant: 'destructive',
      }),
  });

  // ── Chi accede ──────────────────────────────────────────────────────
  const { data: colleghi } = useQuery({
    queryKey: ['colleghi-azienda', aziendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, nome, cognome, email, ruolo')
        .eq('azienda_id', aziendaId!)
        .neq('ruolo', 'candidato')
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!aziendaId,
  });

  const [nuovoAccesso, setNuovoAccesso] = useState<{
    nome: string;
    cognome: string;
    email: string;
  } | null>(null);
  const [credenzialiNuove, setCredenzialiNuove] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const creaAccesso = useMutation({
    mutationFn: async (dati: { nome: string; cognome: string; email: string }) => {
      const { data: sessione } = await supabase.auth.getSession();
      if (!sessione.session) throw new Error('Sessione scaduta: rientra e riprova.');
      const risposta = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-team-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessione.session.access_token}`,
          },
          body: JSON.stringify(dati),
        }
      );
      const esito = await risposta.json();
      if (!risposta.ok) throw new Error(esito.error || 'Creazione non riuscita');
      return esito as { email: string; password: string };
    },
    onSuccess: (esito) => {
      queryClient.invalidateQueries({ queryKey: ['colleghi-azienda'] });
      setNuovoAccesso(null);
      setCredenzialiNuove(esito);
    },
    onError: (e: Error) =>
      toast({ title: 'Accesso non creato', description: e.message, variant: 'destructive' }),
  });

  return (
    <NotionLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Impostazioni</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            I tuoi dati, quelli dell’azienda e chi può entrare.
          </p>
        </div>

        <Sezione
          icona={Mail}
          titolo="Il tuo account"
          descrizione="Come ti chiami e con quale indirizzo entri."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cognome">Cognome</Label>
              <Input id="cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Email di accesso</Label>
              <Input value={user?.email ?? ''} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Per cambiarla scrivici: va rifatta anche l’associazione con l’azienda.
              </p>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => salvaProfilo.mutate()}
            disabled={salvaProfilo.isPending}
          >
            {salvaProfilo.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Salva
          </Button>
        </Sezione>

        <Sezione
          icona={KeyRound}
          titolo="Cambia password"
          descrizione="Almeno 8 caratteri. Vale dal prossimo accesso."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Nuova password</Label>
              <Input
                id="pwd"
                type="password"
                autoComplete="new-password"
                value={nuovaPassword}
                onChange={(e) => setNuovaPassword(e.target.value)}
              />
              {passwordTroppoCorta && (
                <p className="text-xs text-destructive">Servono almeno 8 caratteri.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd2">Ripetila</Label>
              <Input
                id="pwd2"
                type="password"
                autoComplete="new-password"
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
              />
              {passwordDiverse && <p className="text-xs text-destructive">Non coincidono.</p>}
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => cambiaPassword.mutate()}
            disabled={
              cambiaPassword.isPending ||
              nuovaPassword.length < 8 ||
              nuovaPassword !== confermaPassword
            }
          >
            {cambiaPassword.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Cambia password
          </Button>
        </Sezione>

        {isAzienda && aziendaId && (
          <>
            <Sezione
              icona={Building2}
              titolo="La tua azienda"
              descrizione="Servono per la fattura: senza partita IVA e codice SDI non possiamo emetterla."
            >
              {caricaAzienda ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CAMPI_AZIENDA.map(({ chiave, label, nota }) => (
                      <div key={chiave} className="space-y-1.5">
                        <Label htmlFor={chiave}>{label}</Label>
                        <Input
                          id={chiave}
                          value={(datiAzienda[chiave] as string) ?? ''}
                          onChange={(e) =>
                            setDatiAzienda((d) => ({ ...d, [chiave]: e.target.value }))
                          }
                        />
                        {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => salvaAzienda.mutate()}
                    disabled={salvaAzienda.isPending || !datiAzienda.nome?.trim()}
                  >
                    {salvaAzienda.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Salva
                  </Button>
                </>
              )}
            </Sezione>

            <Sezione
              icona={Users}
              titolo="Chi accede"
              descrizione="Dai un accesso a chi lavora con te, invece di passargli il tuo."
            >
              <div className="space-y-2">
                {colleghi?.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {[c.nome, c.cognome].filter(Boolean).join(' ') || c.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                    {c.user_id === user?.id && (
                      <Badge variant="secondary" className="shrink-0 text-[11px]">
                        Sei tu
                      </Badge>
                    )}
                  </div>
                ))}
                {colleghi?.length === 1 && (
                  <p className="text-sm text-muted-foreground">
                    Sei l’unico con un accesso. Se altri in azienda usano il tuo, non si capisce chi
                    ha fatto cosa.
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setNuovoAccesso({ nome: '', cognome: '', email: '' })}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Aggiungi una persona
              </Button>
            </Sezione>
          </>
        )}

        {/* Nuovo accesso */}
        <Dialog open={!!nuovoAccesso} onOpenChange={(v) => !v && setNuovoAccesso(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi una persona</DialogTitle>
              <DialogDescription>
                Avrà il tuo stesso accesso ai candidati dell’azienda. Le generiamo una password che
                potrà cambiare da qui.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="n-nome">Nome</Label>
                  <Input
                    id="n-nome"
                    value={nuovoAccesso?.nome ?? ''}
                    onChange={(e) =>
                      setNuovoAccesso((v) => (v ? { ...v, nome: e.target.value } : v))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="n-cognome">Cognome</Label>
                  <Input
                    id="n-cognome"
                    value={nuovoAccesso?.cognome ?? ''}
                    onChange={(e) =>
                      setNuovoAccesso((v) => (v ? { ...v, cognome: e.target.value } : v))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="n-email">Email</Label>
                <Input
                  id="n-email"
                  type="email"
                  value={nuovoAccesso?.email ?? ''}
                  onChange={(e) =>
                    setNuovoAccesso((v) => (v ? { ...v, email: e.target.value } : v))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNuovoAccesso(null)}>
                Annulla
              </Button>
              <Button
                onClick={() => nuovoAccesso && creaAccesso.mutate(nuovoAccesso)}
                disabled={creaAccesso.isPending || !nuovoAccesso?.email.includes('@')}
              >
                {creaAccesso.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Crea l’accesso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password del nuovo accesso: si vede una volta sola */}
        <Dialog open={!!credenzialiNuove} onOpenChange={(v) => !v && setCredenzialiNuove(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Accesso creato</DialogTitle>
              <DialogDescription>
                Questa password si vede solo adesso. Copiala e passala alla persona.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={credenzialiNuove?.email ?? ''} readOnly className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input value={credenzialiNuove?.password ?? ''} readOnly className="font-mono" />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Accesso a Talenti Edili\nEmail: ${credenzialiNuove?.email}\nPassword: ${credenzialiNuove?.password}\nLink: ${window.location.origin}/auth`
                  );
                  toast({ title: 'Copiato' });
                }}
              >
                Copia tutto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NotionLayout>
  );
}
