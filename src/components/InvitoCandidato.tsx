/**
 * Invito e sollecito al test.
 *
 * Prima il flusso si fermava a metà: la piattaforma generava utente e
 * password e li mostrava in un riquadro, poi il messaggio da mandare al
 * candidato te lo scrivevi tu, ogni volta, a mano. Stessa cosa per i
 * solleciti: la dashboard ti diceva "2 fermi da oltre 5 giorni" e ti
 * lasciava lì.
 *
 * Qui il messaggio è già pronto e parte su WhatsApp o via email con un
 * click. L'invio automatico e programmato richiede un servizio di posta
 * (Resend, SendGrid…): quando ci sarà, basterà sostituire `apri()` con la
 * chiamata alla edge function — il testo del messaggio è già qui.
 */

import { useMemo, useState } from 'react';
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export type CandidatoDaInvitare = {
  id: string;
  nome: string | null;
  cognome: string | null;
  email: string | null;
  telefono: string | null;
  username: string | null;
  funzione: string | null;
  ruolo_attuale: string | null;
};

/**
 * Normalizza il numero per wa.me: solo cifre, con prefisso internazionale.
 * I numeri italiani salvati a mano arrivano nei modi più vari
 * ("+39 331 1234567", "331-1234567", "0039331…").
 */
export function numeroWhatsapp(telefono: string | null): string | null {
  if (!telefono) return null;
  let cifre = telefono.replace(/\D/g, '');
  if (cifre.startsWith('00')) cifre = cifre.slice(2);
  // Cellulare italiano senza prefisso: 3xx xxxxxxx, 9 o 10 cifre.
  if (/^3\d{8,9}$/.test(cifre)) cifre = `39${cifre}`;
  return cifre.length >= 11 && cifre.length <= 15 ? cifre : null;
}

export function componiMessaggio({
  candidato,
  password,
  sollecito,
  linkTest,
}: {
  candidato: CandidatoDaInvitare;
  password?: string | null;
  sollecito: boolean;
  linkTest: string;
}): string {
  const nome = candidato.nome?.trim() || '';
  const posizione = candidato.funzione || candidato.ruolo_attuale;
  const per = posizione ? ` per la posizione di ${posizione.toLowerCase()}` : '';

  const apertura = sollecito
    ? `Ciao${nome ? ` ${nome}` : ''}, ti ricordo il test online${per}.`
    : `Ciao${nome ? ` ${nome}` : ''}, ti chiediamo di fare un test online${per}.`;

  const righe = [
    apertura,
    '',
    'Sono domande sul modo di lavorare: non c’è da studiare niente e non si può sbagliare.',
    'Servono circa 20 minuti e si fa anche dal telefono.',
    '',
    `Link: ${linkTest}`,
  ];

  if (candidato.username) righe.push(`Utente: ${candidato.username}`);
  if (password) righe.push(`Password: ${password}`);

  righe.push('', 'Quando hai finito ci arriva tutto in automatico. Grazie!');
  return righe.join('\n');
}

export function InvitoCandidato({
  candidato,
  password,
  sollecito = false,
  open,
  onOpenChange,
  onInviato,
}: {
  candidato: CandidatoDaInvitare | null;
  password?: string | null;
  sollecito?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviato?: (candidatoId: string) => void;
}) {
  const [copiato, setCopiato] = useState(false);

  const linkTest = typeof window !== 'undefined' ? `${window.location.origin}/auth` : '/auth';

  const [testo, setTesto] = useState('');
  const testoIniziale = useMemo(
    () => (candidato ? componiMessaggio({ candidato, password, sollecito, linkTest }) : ''),
    [candidato, password, sollecito, linkTest]
  );

  // Il testo è modificabile: chi assume conosce la persona e vuole poterlo
  // aggiustare prima di mandarlo.
  const messaggio = testo || testoIniziale;

  const numero = numeroWhatsapp(candidato?.telefono ?? null);

  const segnaInviato = () => {
    if (candidato) onInviato?.(candidato.id);
    onOpenChange(false);
  };

  const apriWhatsapp = () => {
    if (!numero) return;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`, '_blank', 'noopener');
    segnaInviato();
  };

  const apriEmail = () => {
    if (!candidato?.email) return;
    const oggetto = sollecito ? 'Promemoria: il test da fare' : 'Il test da fare';
    window.location.href = `mailto:${candidato.email}?subject=${encodeURIComponent(
      oggetto
    )}&body=${encodeURIComponent(messaggio)}`;
    segnaInviato();
  };

  const copia = async () => {
    await navigator.clipboard.writeText(messaggio);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
    toast({ title: 'Messaggio copiato', description: 'Incollalo dove preferisci.' });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTesto('');
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {sollecito ? 'Ricorda il test a' : 'Invita al test'}{' '}
            {candidato?.nome} {candidato?.cognome}
          </DialogTitle>
          <DialogDescription>
            Il messaggio è già pronto. Puoi modificarlo prima di mandarlo.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={messaggio}
          onChange={(e) => setTesto(e.target.value)}
          rows={12}
          className="text-sm leading-relaxed"
        />

        {!password && (
          <p className="text-xs text-muted-foreground">
            La password non compare: è visibile solo al momento in cui viene creata. Se il candidato
            non ce l’ha più, rigenerala dalla sua scheda.
          </p>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={copia} className="sm:mr-auto">
            {copiato ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            Copia
          </Button>
          <Button variant="outline" onClick={apriEmail} disabled={!candidato?.email}>
            <Mail className="h-4 w-4 mr-1.5" />
            Email
          </Button>
          <Button onClick={apriWhatsapp} disabled={!numero}>
            <MessageCircle className="h-4 w-4 mr-1.5" />
            WhatsApp
          </Button>
        </DialogFooter>

        {!numero && !candidato?.email && (
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Questa persona non ha né telefono né email: copia il messaggio e mandaglielo tu.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
