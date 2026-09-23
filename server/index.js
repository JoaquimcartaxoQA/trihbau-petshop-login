import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './auth.js';
import openapi from './openapi.js';
import productRoutes from './products.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.sendStatus(200));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/api-docs.json', (_req, res) => res.json(openapi));
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.listen(3001, () => console.log('Servidor rodando em http://localhost:3001'));