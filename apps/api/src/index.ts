import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
