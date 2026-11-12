import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './auth.js';
import openapi from './openapi.js';
import productRoutes from './products.js';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.sendStatus(200));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/api-docs.json', (_req, res) => res.json(openapi));
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

const port = Number(process.env.TRIHBAU_PORT ?? 3001);
const server = app.listen(port, process.env.TRIHBAU_HOST, () => console.log(`Servidor rodando na porta ${port}`));
export { server, db };
