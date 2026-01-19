-- Creare il record azienda Teknofinestre
INSERT INTO aziende (nome, settore, email_contatto, telefono, attiva)
VALUES ('Teknofinestre', 'Serramenti', 'info@teknofinestre.it', '', true);

-- Aggiornare il profilo utente con ruolo azienda e collegamento
UPDATE profiles 
SET ruolo = 'azienda',
    nome = 'Admin',
    cognome = 'Teknofinestre',
    azienda_id = (SELECT id FROM aziende WHERE email_contatto = 'info@teknofinestre.it')
WHERE email = 'info@teknofinestre.it';