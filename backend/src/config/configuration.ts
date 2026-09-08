// Fallback secret for local development only — must be overridden in production
// (enforced at bootstrap; see main.ts).
export const DEFAULT_AUTH_SECRET = 'dev-only-insecure-secret';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  corsOrigin: string[];
  authSecret: string;
  authTokenTtl: number;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  authSecret: process.env.AUTH_SECRET ?? DEFAULT_AUTH_SECRET,
  // Access token lifetime in seconds (default: 1 hour).
  authTokenTtl: parseInt(process.env.AUTH_TOKEN_TTL ?? '3600', 10),
});
