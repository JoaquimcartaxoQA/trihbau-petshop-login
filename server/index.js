import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(3001, () => console.log('Servidor rodando em http://localhost:3001'));