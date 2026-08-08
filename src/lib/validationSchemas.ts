/**
 * Schema di validazione Zod per form
 * Centralizza la validazione input per sicurezza e coerenza
 */
import { z } from 'zod';
import { VALIDATION, AGE_THRESHOLDS } from './constants';

// ============ AUTH SCHEMAS ============

export const loginEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email obbligatoria')
    .email('Email non valida')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email troppo lunga (max ${VALIDATION.EMAIL_MAX_LENGTH} caratteri)`),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Minimo ${VALIDATION.PASSWORD_MIN_LENGTH} caratteri`),
});

export const loginCandidateSchema = z.object({
  // Accetta sia lo username assegnato dall'azienda sia l'email di chi si è
  // registrato dalla piattaforma (il limite più largo serve alle email lunghe).
  username: z
    .string()
    .trim()
    .min(1, 'Email o username obbligatori')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Valore troppo lungo')
    .transform(val => val.toLowerCase()),
  password: z
    .string()
    .min(1, 'Password obbligatoria'),
});

export const registrazioneCandidatoSchema = z.object({
  nome: z.string().trim().min(1, 'Nome obbligatorio').max(VALIDATION.NAME_MAX_LENGTH, 'Nome troppo lungo'),
  cognome: z.string().trim().min(1, 'Cognome obbligatorio').max(VALIDATION.NAME_MAX_LENGTH, 'Cognome troppo lungo'),
  email: z
    .string()
    .trim()
    .min(1, 'Email obbligatoria')
    .email('Email non valida')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email troppo lunga'),
  password: z
    .string()
    .min(8, 'Minimo 8 caratteri')
    .max(72, 'Massimo 72 caratteri'),
  telefono: z
    .string()
    .trim()
    .min(1, 'Telefono obbligatorio')
    .regex(VALIDATION.PHONE_REGEX, 'Numero non valido'),
  provincia: z.string().trim().min(2, 'Provincia obbligatoria').max(60, 'Provincia troppo lunga'),
  funzione: z.string().trim().min(1, 'Indica il ruolo che cerchi'),
  consensoPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Il consenso privacy è necessario per registrarsi' }),
  }),
  consensoMarketplace: z.boolean(),
});

export type RegistrazioneCandidatoInput = z.infer<typeof registrazioneCandidatoSchema>;

// ============ CANDIDATO SCHEMAS ============

export const createCandidatoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Nome obbligatorio')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Nome troppo lungo'),
  cognome: z
    .string()
    .trim()
    .min(1, 'Cognome obbligatorio')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Cognome troppo lungo'),
  email: z
    .string()
    .trim()
    .email('Email non valida')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email troppo lunga')
    .optional()
    .or(z.literal('')),
  eta: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : undefined)
    .pipe(
      z.number()
        .int('Età deve essere un numero intero')
        .min(AGE_THRESHOLDS.MIN, `Età minima: ${AGE_THRESHOLDS.MIN} anni`)
        .max(AGE_THRESHOLDS.MAX, `Età massima: ${AGE_THRESHOLDS.MAX} anni`)
        .optional()
    ),
  telefono: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || VALIDATION.PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Formato telefono non valido'
    ),
  ruolo_attuale: z.string().optional(),
  funzione: z.string().optional(),
  azienda_id: z.string().uuid('Azienda non valida').optional(),
});

// ============ FORM ANAGRAFICO SCHEMA ============

export const formAnagraficoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Nome obbligatorio')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Nome troppo lungo'),
  cognome: z
    .string()
    .trim()
    .min(1, 'Cognome obbligatorio')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Cognome troppo lungo'),
  eta: z
    .string()
    .min(1, 'Età obbligatoria')
    .transform(val => parseInt(val, 10))
    .pipe(
      z.number()
        .int('Età deve essere un numero intero')
        .min(AGE_THRESHOLDS.MIN, `Età minima: ${AGE_THRESHOLDS.MIN} anni`)
        .max(AGE_THRESHOLDS.MAX, `Età massima: ${AGE_THRESHOLDS.MAX} anni`)
    ),
  sesso: z.enum(['M', 'F'], { required_error: 'Seleziona il genere' }),
  ruolo_attuale: z.string().min(1, 'Ruolo obbligatorio'),
  funzione: z.string().min(1, 'Funzione obbligatoria'),
  email: z
    .string()
    .trim()
    .min(1, 'Email obbligatoria')
    .email('Email non valida')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email troppo lunga'),
  telefono: z
    .string()
    .trim()
    .min(1, 'Telefono obbligatorio')
    .refine(
      val => VALIDATION.PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Formato telefono non valido'
    ),
});

// ============ TYPES ============

export type LoginEmailInput = z.infer<typeof loginEmailSchema>;
export type LoginCandidateInput = z.infer<typeof loginCandidateSchema>;
export type CreateCandidatoInput = z.infer<typeof createCandidatoSchema>;
export type FormAnagraficoInput = z.infer<typeof formAnagraficoSchema>;
