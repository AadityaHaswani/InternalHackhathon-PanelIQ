import { z } from 'zod';

// PostgreSQL counts Unicode characters, not JavaScript UTF-16 code units.
const optionalText = (max) => z.string().trim().min(1)
  .refine((value) => [...value].length <= max && !value.includes('\0')).nullable().optional();

export const profilePatchSchema = z.object({
  displayName: optionalText(80),
  domain: z.enum(['computer_science']).nullable().optional(),
  experienceLevel: z.enum(['junior', 'intermediate']).nullable().optional(),
  targetRole: optionalText(120),
}).strict().refine((value) => Object.keys(value).length > 0);
