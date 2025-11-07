import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  portHttp: Number(process.env.PORT_HTTP ?? 3000),
  portHttps: Number(process.env.PORT_HTTPS ?? 3001),
  sslKeyPath: process.env.SSL_KEY_PATH ?? '',
  sslCertPath: process.env.SSL_CERT_PATH ?? '',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/secure_payments',
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
  jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN ?? 900),
  hstsMaxAge: Number(process.env.HSTS_MAX_AGE ?? 15552000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'https://localhost:5173',
};
