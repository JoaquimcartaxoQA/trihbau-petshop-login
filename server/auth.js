import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = express.Router();
const JWT_SECRET = 'chave-secreta-de-estudo-troque-depois';

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const existing = db.prepare('SELECT id FROM tutors WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
        'INSERT INTO tutors (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name, email, passwordHash);

    const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const tutor = db.prepare('SELECT * FROM tutors WHERE email = ?').get(email);

    if (!tutor) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const valid = await bcrypt.compare(password, tutor.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: tutor.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: tutor.name });
});

export default router;