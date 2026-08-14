/**
 * Richieste arrivate dal sito.
 *
 * Il form pubblico scriveva in `leads` e prometteva "ti contattiamo entro 24
 * ore lavorative". Poi nessuno leggeva quella tabella: niente pagina, niente
 * notifica. Tutto il traffico del sito finiva su un contatto che restava lì.
 *
 * Qui le richieste diventano una lista di lavoro: chi aspetta da più tempo
 * sta in cima, si telefona o si scrive con un click, e lo stato resta
 * scritto così due persone non chiamano lo stesso contatto.
 */

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { numeroWhatsapp } from '@/components/InvitoCandidato';
import {
  STATI_RICHIESTA,
  StatoRichiesta,
  oreDaArrivo,
  statoDi,
  statoRichiestaInfo,
} from '@/lib/statoRichiesta';

type Richiesta = {
  id: string;
  nome: string;
  email: string;
  azienda: string | null;
  num_dipendenti: string | null;
  telefono?: string | null;
  origine?: string | null;
  note?: string | null;
  stato?: string | null;
  created_at: string;
};

/** Oltre questa soglia la promessa del sito ("entro 24 ore") è già saltata. */
const ORE_LIMITE = 24;

export default function Richieste() {
  const queryClient = useQueryClient();
  const [filtroStato, setFiltroStato] = useState<string>('nuova');
  const [ricerca, setRicerca] = useState('');
  const [noteAperte, setNoteAperte] = useState<string | null>(null);
  const [testoNote, setTestoNote] = useState('');

  const { data: richieste, isLoading, error } = useQuery({
    queryKey: ['richieste'],
    queryFn: async () => {
      // Le più vecchie in cima: chi aspetta da più tempo è il problema,
      // non l'ultima arrivata.
      const { data, error: err } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);
      if (err) throw err;
      return (data ?? []) as unknown as Richiesta[];
    },
  });

  const aggiorna = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error: err } = await supabase.from('leads').update(patch as never).eq('id', id);
      if (err) throw err;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['richieste'] }),
    onError: () =>
      toast({
        title: 'Non salvato',
        description: 'Riprova. Se insiste, la migration delle richieste non è applicata.',
        variant: 'destructive',
      }),
  });

  const filtrate = useMemo(() => {
    if (!richieste) return [];
    const termine = ricerca.trim().toLowerCase();
    return richieste.filter((r) => {
      if (filtroStato !== 'tutte' && statoDi(r) !== filtroStato) return false;
      if (!termine) return true;
      return [r.nome, r.email, r.azienda, r.origine]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(termine));
    });
  }, [richieste, filtroStato, ricerca]);

  const inRitardo = useMemo(
    () =>
      (richieste ?? []).filter(
        (r) => statoDi(r) === 'nuova' && oreDaArrivo(r.created_at) > ORE_LIMITE
      ).length,
    [richieste]
  );

  const nuove = useMemo(
    () => (richieste ?? []).filter((r) => statoDi(r) === 'nuova').length,
    [richieste]
  );

  return (
    <NotionLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" /> Richieste dal sito
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chi ha compilato il modulo sul sito. Il modulo promette una risposta entro 24 ore
            lavorative.
          </p>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Richieste non leggibili</p>
              <p>
                Serve il ruolo superadmin, e la migration{' '}
                <code>20260814150000_richieste.sql</code> dev’essere applicata.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {inRitardo > 0 && (
              <Card className="border-red-300 bg-red-50/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <p className="text-sm">
                    <strong>{inRitardo}</strong>{' '}
                    {inRitardo === 1 ? 'richiesta aspetta' : 'richieste aspettano'} da più di 24
                    ore. Il sito ha promesso una risposta.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca nome, email, azienda…"
                  value={ricerca}
                  onChange={(e) => setRicerca(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroStato} onValueChange={setFiltroStato}>
                <SelectTrigger className="sm:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuova">Da contattare ({nuove})</SelectItem>
                  {STATI_RICHIESTA.filter((s) => s.valore !== 'nuova').map((s) => (
                    <SelectItem key={s.valore} value={s.valore}>
                      {s.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="tutte">Tutte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : filtrate.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">
                    {filtroStato === 'nuova'
                      ? 'Nessuna richiesta da contattare'
                      : 'Nessuna richiesta con questi filtri'}
                  </p>
                  {filtroStato === 'nuova' && (
                    <p className="text-sm mt-1">Sei in pari: le hai prese tutte in carico.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtrate.map((r) => {
                  const stato = statoDi(r);
                  const ore = oreDaArrivo(r.created_at);
                  const ritardo = stato === 'nuova' && ore > ORE_LIMITE;
                  const numero = numeroWhatsapp(r.telefono ?? null);

                  return (
                    <Card key={r.id} className={cn(ritardo && 'border-red-200')}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="font-semibold">{r.nome}</h2>
                              <Badge
                                variant="outline"
                                className={cn('text-[11px]', statoRichiestaInfo(stato).classe)}
                              >
                                {statoRichiestaInfo(stato).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                              {r.azienda && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {r.azienda}
                                </span>
                              )}
                              {r.num_dipendenti && <span>· {r.num_dipendenti} dipendenti</span>}
                              {r.origine && <span>· da {r.origine}</span>}
                            </p>
                          </div>
                          <p
                            className={cn(
                              'text-xs whitespace-nowrap',
                              ritardo ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                            )}
                          >
                            {ore < 1
                              ? 'Arrivata adesso'
                              : ore < 48
                                ? `${Math.round(ore)} ore fa`
                                : `${Math.round(ore / 24)} giorni fa`}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${r.email}`}>
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              {r.email}
                            </a>
                          </Button>
                          {r.telefono && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${r.telefono}`}>
                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                {r.telefono}
                              </a>
                            </Button>
                          )}
                          {numero && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://wa.me/${numero}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                WhatsApp
                              </a>
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={stato}
                            onValueChange={(v) =>
                              aggiorna.mutate({ id: r.id, patch: { stato: v as StatoRichiesta } })
                            }
                          >
                            <SelectTrigger className="h-8 w-[190px] text-xs">
                              <span className="truncate">{statoRichiestaInfo(stato).label}</span>
                            </SelectTrigger>
                            <SelectContent>
                              {STATI_RICHIESTA.map((s) => (
                                <SelectItem key={s.valore} value={s.valore}>
                                  <span className="font-medium">{s.label}</span>
                                  <span className="block text-[11px] text-muted-foreground">
                                    {s.descrizione}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setNoteAperte(noteAperte === r.id ? null : r.id);
                              setTestoNote(r.note ?? '');
                            }}
                          >
                            {r.note ? 'Modifica note' : 'Aggiungi una nota'}
                          </Button>
                        </div>

                        {noteAperte === r.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={testoNote}
                              onChange={(e) => setTestoNote(e.target.value)}
                              rows={3}
                              placeholder="Cosa vi siete detti, cosa aspetta…"
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  aggiorna.mutate(
                                    { id: r.id, patch: { note: testoNote.trim() || null } },
                                    { onSuccess: () => setNoteAperte(null) }
                                  )
                                }
                                disabled={aggiorna.isPending}
                              >
                                Salva
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setNoteAperte(null)}>
                                Annulla
                              </Button>
                            </div>
                          </div>
                        ) : (
                          r.note && (
                            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 whitespace-pre-wrap">
                              {r.note}
                            </p>
                          )
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </NotionLayout>
  );
}
