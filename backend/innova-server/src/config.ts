import 'dotenv/config';

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

const secret = requireEnv(
  'JWT_SECRET',
  'InnovaDevSecretKey_ChangeInProduction_Min32Chars!',
);

if (secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

requireEnv('DATABASE_URL');

export const config = {
  port: Number(process.env.PORT) || 5075,
  jwt: {
    secret,
    issuer: process.env.JWT_ISSUER ?? 'Innova',
    audience: process.env.JWT_AUDIENCE ?? 'Innova.Frontend',
    expiresIn: '8h' as const,
  },
};
