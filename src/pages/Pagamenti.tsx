import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, AlertTriangle, TrendingUp, Eye, Edit, Plus, Search, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Abbonamento, Pagamento, StatoAbbonamento, StatoPagamento, MetodoPagamento } from '@/types/database';

const STATO_BADGE: Record<StatoAbbonamento, { label: string; className: string }> = {
  attivo: { label: 'Attivo', className: 'bg-green-100 text-green-800 border-green-200' },
  trial: { label: 'Trial', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  scaduto: { label: 'Scaduto', className: 'bg-red-100 text-red-800 border-red-200' },
  sospeso: { label: 'Sospeso', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATO_PAGAMENTO_BADGE: Record<StatoPagamento, { label: string; className: string }> = {
  completato: { label: 'Completato', className: 'bg-green-100 text-green-800 border-green-200' },
  fallito: { label: 'Fallito', className: 'bg-red-100 text-red-800 border-red-200' },
  in_attesa: { label: 'In attesa', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  rimborsato: { label: 'Rimborsato', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export default function Pagamenti() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filtroStato, setFiltroStato] = useState<string>('tutti');
  const [selectedAbbonamento, setSelectedAbbonamento] = useState<Abbonamento | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Abbonamento | null>(null);
  const [nuovoPagamentoDialog, setNuovoPagamentoDialog] = useState(false);

  // Fetch abbonamenti with azienda name
  const { data: abbonamenti = [], isLoading } = useQuery({
    queryKey: ['abbonamenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abbonamenti')
        .select('*, aziende(nome)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(a => ({ ...a, stato: a.stato as StatoAbbonamento })) as Abbonamento[];
    },
  });

  // Fetch pagamenti for selected abbonamento
  const { data: pagamenti = [] } = useQuery({
    queryKey: ['pagamenti', selectedAbbonamento?.id],
    queryFn: async () => {
      if (!selectedAbbonamento) return [];
      const { data, error } = await supabase
        .from('pagamenti')
        .select('*')
        .eq('abbonamento_id', selectedAbbonamento.id)
        .order('data_pagamento', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(p => ({
        ...p,
        stato: p.stato as StatoPagamento,
        metodo: p.metodo as MetodoPagamento,
      })) as Pagamento[];
    },
    enabled: !!selectedAbbonamento,
  });

  // Fetch last month payments for metrics
  const { data: pagamentiUltimoMese = [] } = useQuery({
    queryKey: ['pagamenti-ultimo-mese'],
    queryFn: async () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const { data, error } = await supabase
        .from('pagamenti')
        .select('importo, stato')
        .gte('data_pagamento', oneMonthAgo.toISOString())
        .eq('stato', 'completato');
      if (error) throw error;
      return data || [];
    },
  });

  // Update abbonamento stato
  const updateStatoMutation = useMutation({
    mutationFn: async ({ id, stato, note }: { id: string; stato: string; note?: string }) => {
      const { error } = await supabase
        .from('abbonamenti')
        .update({ stato, note } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abbonamenti'] });
      toast({ title: 'Stato aggiornato' });
      setEditDialog(null);
    },
  });

  // Insert pagamento manuale
  const insertPagamentoMutation = useMutation({
    mutationFn: async (pagamento: Omit<Pagamento, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('pagamenti').insert(pagamento as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamenti'] });
      queryClient.invalidateQueries({ queryKey: ['pagamenti-ultimo-mese'] });
      toast({ title: 'Pagamento registrato' });
      setNuovoPagamentoDialog(false);
    },
  });

  // Metrics
  const metrics = useMemo(() => {
    const attivi = abbonamenti.filter(a => a.stato === 'attivo');
    const scaduti = abbonamenti.filter(a => a.stato === 'scaduto');
    const entrateMensili = attivi.reduce((sum, a) => sum + Number(a.importo_mensile), 0);
    const incassiMese = pagamentiUltimoMese.reduce((sum, p) => sum + Number(p.importo), 0);
    return { entrateMensili, attiviCount: attivi.length, scadutiCount: scaduti.length, incassiMese };
  }, [abbonamenti, pagamentiUltimoMese]);

  // Filter
  const filtered = useMemo(() => {
    return abbonamenti.filter(a => {
      const nomeAzienda = a.aziende?.nome?.toLowerCase() || '';
      const matchSearch = !search || nomeAzienda.includes(search.toLowerCase());
      const matchStato = filtroStato === 'tutti' || a.stato === filtroStato;
      return matchSearch && matchStato;
    });
  }, [abbonamenti, search, filtroStato]);

  const formatDate = (d: string | null) => d ? format(new Date(d), 'dd MMM yyyy', { locale: it }) : '—';

  return (
    <NotionLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Pagamenti</h1>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entrate Mensili</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{metrics.entrateMensili.toLocaleString('it-IT')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abbonamenti Attivi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.attiviCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scaduti / In Ritardo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.scadutiCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Incassi Ultimo Mese</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{metrics.incassiMese.toLocaleString('it-IT')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca azienda..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroStato} onValueChange={setFiltroStato}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">Tutti gli stati</SelectItem>
              <SelectItem value="attivo">Attivo</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="scaduto">Scaduto</SelectItem>
              <SelectItem value="sospeso">Sospeso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Data Inizio</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Caricamento...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nessun abbonamento trovato</TableCell></TableRow>
                ) : filtered.map(abb => {
                  const badge = STATO_BADGE[abb.stato];
                  return (
                    <TableRow key={abb.id}>
                      <TableCell className="font-medium">{abb.aziende?.nome || '—'}</TableCell>
                      <TableCell>
                        <Badge className={badge.className} variant="outline">{badge.label}</Badge>
                      </TableCell>
                      <TableCell>€{Number(abb.importo_mensile).toFixed(2)}</TableCell>
                      <TableCell>{formatDate(abb.data_inizio)}</TableCell>
                      <TableCell>{formatDate(abb.data_scadenza)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditDialog(abb)} title="Modifica stato">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setSelectedAbbonamento(abb); setDrawerOpen(true); }} title="Storico pagamenti">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Stato Dialog */}
        {editDialog && (
          <EditStatoDialog
            abbonamento={editDialog}
            onClose={() => setEditDialog(null)}
            onSave={(stato, note) => updateStatoMutation.mutate({ id: editDialog.id, stato, note })}
            loading={updateStatoMutation.isPending}
          />
        )}

        {/* Storico Pagamenti Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Storico Pagamenti — {selectedAbbonamento?.aziende?.nome}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <Button size="sm" onClick={() => setNuovoPagamentoDialog(true)} className="gap-1">
                <Plus className="h-4 w-4" /> Registra Pagamento
              </Button>
              {pagamenti.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Nessun pagamento registrato.</p>
              ) : (
                <div className="space-y-2">
                  {pagamenti.map(p => {
                    const pBadge = STATO_PAGAMENTO_BADGE[p.stato];
                    return (
                      <Card key={p.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">€{Number(p.importo).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(p.data_pagamento)} · {p.metodo}</p>
                            {p.note && <p className="text-xs text-muted-foreground mt-1">{p.note}</p>}
                          </div>
                          <Badge className={pBadge.className} variant="outline">{pBadge.label}</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Nuovo Pagamento Dialog */}
        {nuovoPagamentoDialog && selectedAbbonamento && (
          <NuovoPagamentoDialog
            abbonamento={selectedAbbonamento}
            onClose={() => setNuovoPagamentoDialog(false)}
            onSave={p => insertPagamentoMutation.mutate(p)}
            loading={insertPagamentoMutation.isPending}
          />
        )}
      </div>
    </NotionLayout>
  );
}

// --- Sub-components ---

function EditStatoDialog({ abbonamento, onClose, onSave, loading }: {
  abbonamento: Abbonamento;
  onClose: () => void;
  onSave: (stato: string, note?: string) => void;
  loading: boolean;
}) {
  const [stato, setStato] = useState(abbonamento.stato);
  const [note, setNote] = useState(abbonamento.note || '');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Abbonamento — {abbonamento.aziende?.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Stato</Label>
            <Select value={stato} onValueChange={v => setStato(v as StatoAbbonamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
                <SelectItem value="sospeso">Sospeso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={() => onSave(stato, note)} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NuovoPagamentoDialog({ abbonamento, onClose, onSave, loading }: {
  abbonamento: Abbonamento;
  onClose: () => void;
  onSave: (p: Omit<Pagamento, 'id' | 'created_at'>) => void;
  loading: boolean;
}) {
  const [importo, setImporto] = useState(String(abbonamento.importo_mensile));
  const [metodo, setMetodo] = useState<MetodoPagamento>('manuale');
  const [note, setNote] = useState('');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registra Pagamento — {abbonamento.aziende?.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Importo (€)</Label>
            <Input type="number" value={importo} onChange={e => setImporto(e.target.value)} />
          </div>
          <div>
            <Label>Metodo</Label>
            <Select value={metodo} onValueChange={v => setMetodo(v as MetodoPagamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manuale">Manuale</SelectItem>
                <SelectItem value="bonifico">Bonifico</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button disabled={loading} onClick={() => onSave({
            abbonamento_id: abbonamento.id,
            azienda_id: abbonamento.azienda_id,
            importo: Number(importo),
            stato: 'completato' as StatoPagamento,
            data_pagamento: new Date().toISOString(),
            metodo,
            stripe_payment_id: null,
            note: note || null,
          })}>
            {loading ? 'Salvataggio...' : 'Registra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
