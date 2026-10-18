import { z } from 'zod';
import type { DepartmentId } from './types';

/**
 * Tool contracts from the brief. The offline concierge and the live Claude
 * function both have to produce inputs that pass these schemas before a ticket
 * is created, so staff never receive malformed requests.
 */

export const DEPARTMENT_IDS = [
  'frontoffice',
  'housekeeping',
  'laundry',
  'engineering',
  'ird',
  'restaurants',
  'spa',
  'recreation',
  'concierge',
  'security',
  'it',
  'dutymanager',
] as const satisfies readonly DepartmentId[];

const text = (max: number) => z.string().trim().max(max);
const timeLike = z
  .string()
  .trim()
  .regex(/^(now|asap|tonight|([01]?\d|2[0-3]):[0-5]\d)$/i, 'Use HH:MM, "now" or "tonight"');
const dateLike = z
  .string()
  .trim()
  .regex(/^(today|tomorrow|\d{4}-\d{2}-\d{2})$/i, 'Use YYYY-MM-DD, "today" or "tomorrow"');

export const PrioritySchema = z.enum(['normal', 'high', 'urgent']);

export const toolSchemas = {
  create_service_request: z.object({
    department: z.enum(DEPARTMENT_IDS),
    category: text(60).min(1),
    item: text(80).min(1),
    quantity: z.number().int().min(1).max(20).optional(),
    details: text(500).optional(),
    preferred_time: text(40).optional(),
    priority: PrioritySchema.default('normal'),
  }),
  create_dining_order: z.object({
    items: z
      .array(
        z.object({
          name: text(80).min(1),
          qty: z.number().int().min(1).max(20),
          modifiers: z.array(text(60)).max(6).default([]),
        }),
      )
      .min(1)
      .max(20),
    allergies: text(200).optional(),
    delivery_time: text(40).optional(),
    notes: text(300).optional(),
  }),
  create_reservation: z.object({
    outlet: text(80).min(1),
    date: dateLike,
    time: timeLike,
    party_size: z.number().int().min(1).max(20),
    occasion: text(80).optional(),
    notes: text(300).optional(),
  }),
  create_spa_booking: z.object({
    treatment: text(80).min(1),
    date: dateLike,
    time: timeLike,
    therapist_preference: z.enum(['none', 'female', 'male']).default('none'),
    notes: text(300).optional(),
  }),
  request_transport: z.object({
    type: z.enum(['airport_arrival', 'airport_departure', 'taxi', 'limousine', 'chauffeur']),
    date: dateLike,
    time: timeLike,
    pickup: text(120).min(1),
    destination: text(120).min(1),
    passengers: z.number().int().min(1).max(12),
    luggage: z.number().int().min(0).max(20).default(0),
  }),
  get_my_requests: z.object({}).strict(),
  cancel_request: z.object({ ticket_id: z.string().regex(/^T-\d{4,}$/) }),
  handover_to_human: z.object({
    reason: text(300).min(1),
    urgency: z.enum(['normal', 'high', 'urgent']),
  }),
} as const;

export type ToolName = keyof typeof toolSchemas;
export type ToolInput<N extends ToolName> = z.infer<(typeof toolSchemas)[N]>;

export function validateTool<N extends ToolName>(
  name: N,
  input: unknown,
): { ok: true; data: ToolInput<N> } | { ok: false; error: string } {
  const result = toolSchemas[name].safeParse(input);
  if (result.success) return { ok: true, data: result.data as ToolInput<N> };
  return {
    ok: false,
    error: result.error.issues.map((i) => `${i.path.join('.') || name}: ${i.message}`).join('; '),
  };
}
