import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ensureDatabase } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import didsRoutes from './routes/dids.routes';
import organizationsRoutes from './routes/organizations.routes';
import rolesRoutes from './routes/roles.routes';
import credentialsRoutes from './routes/credentials.routes';
import assetsRoutes from './routes/assets.routes';
import vendorsRoutes from './routes/vendors.routes';
import projectsRoutes from './routes/projects.routes';
import approvalsRoutes from './routes/approvals.routes';
import governanceRoutes from './routes/governance.routes';
import auditRoutes from './routes/audit.routes';
import blockchainRoutes from './routes/blockchain.routes';
import verifyRoutes from './routes/verify.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  // A dashboard view makes several parallel requests. Keep a safe production
  // default, while avoiding accidental lockouts during local MVP use.
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'production' ? 100 : 1000)),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dids', didsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/verify', verifyRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bel-edidap-api' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request body' });
  }
  console.error(err.stack || err);
  res.status(err.statusCode || err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || process.env.API_PORT || 3001;

async function start() {
  await ensureDatabase();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
