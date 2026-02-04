import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_NAME: z.string().default('sinaesta'),
    DB_USER: z.string().default('postgres'),
    DB_PASSWORD: z.string().default('postgres'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    JWT_SECRET: z.string().min(16).default('your-secret-key'),
    JWT_REFRESH_SECRET: z.string().min(16).default('your-refresh-secret-key'),
    STORAGE_PROVIDER: z.string().default('local'),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    CDN_URL: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.NODE_ENV === 'production') {
      if (values.JWT_SECRET === 'your-secret-key') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_SECRET must be set in production.',
          path: ['JWT_SECRET'],
        });
      }
      if (values.JWT_REFRESH_SECRET === 'your-refresh-secret-key') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_REFRESH_SECRET must be set in production.',
          path: ['JWT_REFRESH_SECRET'],
        });
      }
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const validateEnv = () => env;
