import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Azienda, Abbonamento, StatoAbbonamento } from '@/types/database';

interface NuovoAbbonamentoDialogProps {
  aziende: Azienda[];
  abbonamenti: Abbonamento[];
  onClose: () => void;
  onSave: (data: {
    azienda_id: string;
    stato: string;
    importo_mensile: number;
    data_inizio: string;
    data_scadenza: string;
    note: string | null;
  }) => void;
  loading: boolean;
}

export function NuovoAbbonamentoDialog({ aziende, abbonamenti, onClose, onSave, loading }: NuovoAbbonamentoDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultScadenza = nextMonth.toISOString().slice(0, 10);

  const [aziendaId, setAziendaId] = useState('');
  const [stato, setStato] = useState<StatoAbbonamento>('trial');
  const [importo, setImporto] = useState('97.00');
  const [dataInizio, setDataInizio] = useState(today);
  const [dataScadenza, setDataScadenza] = useState(defaultScadenza);
  const [note, setNote] = useState('');

  const availableAziende = useMemo(() => {
    const withSub = new Set(abbonamenti.map(a => a.azienda_id));
    return aziende.filter(az => !withSub.has(az.id));
  }, [aziende, abbonamenti]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo Abbonamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Azienda</Label>
            <Select value={aziendaId} onValueChange={setAziendaId}>
              <SelectTrigger><SelectValue placeholder="Seleziona azienda..." /></SelectTrigger>
              <SelectContent>
                {availableAziende.length === 0 ? (
                  <SelectItem value="__none" disabled>Tutte le aziende hanno già un abbonamento</SelectItem>
                ) : (
                  availableAziende.map(az => (
                    <SelectItem key={az.id} value={az.id}>{az.nome}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stato</Label>
            <Select value={stato} onValueChange={v => setStato(v as StatoAbbonamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
                <SelectItem value="sospeso">Sospeso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Importo mensile (€)</Label>
            <Input type="number" step="0.01" value={importo} onChange={e => setImporto(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data inizio</Label>
              <Input type="date" value={dataInizio} onChange={e => setDataInizio(e.target.value)} />
            </div>
            <div>
              <Label>Data scadenza</Label>
              <Input type="date" value={dataScadenza} onChange={e => setDataScadenza(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button
            disabled={loading || !aziendaId}
            onClick={() => onSave({
              azienda_id: aziendaId,
              stato,
              importo_mensile: Number(importo),
              data_inizio: new Date(dataInizio).toISOString(),
              data_scadenza: new Date(dataScadenza).toISOString(),
              note: note || null,
            })}
          >
            {loading ? 'Salvataggio...' : 'Crea Abbonamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
