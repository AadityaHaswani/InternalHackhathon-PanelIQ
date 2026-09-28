import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend root (relative to src/config/)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Also load from current working directory as fallback
dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url().refine((value) => {
    const url = URL.parse(value);
    return url !== null && ['https:', 'http:'].includes(url.protocol) && !url.username &&
      !url.password && !url.search && !url.hash && url.pathname === '/';
  }),
  SUPABASE_PUBLISHABLE_KEY: z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter((origin) => origin.length > 0)
    ),
  AI_MODE: z
    .enum(['bank_only', 'mock', 'live'])
    .default('bank_only'),
  PRIMARY_AI_PROVIDER: z.string().default('groq'),
  SECONDARY_AI_PROVIDER: z.string().default('gemini'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z
    .string()
    .optional()
    .default('llama-3.3-70b-versatile')
    .transform((val) => val || 'llama-3.3-70b-versatile'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z
    .string()
    .optional()
    .default('gemini-3.5-flash-lite')
    .transform((val) => val || 'gemini-3.5-flash-lite'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const variables = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))];
  console.error(`Invalid environment configuration: ${variables.join(', ')}`);
  process.exit(1);
}

export const env = parsed.data;
