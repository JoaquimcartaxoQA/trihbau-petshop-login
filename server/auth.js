import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = express.Router();
const JWT_SECRET = 'chave-secreta-de-estudo-troque-depois';

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';

    try {
        req.tutorId = jwt.verify(token, JWT_SECRET).id;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido ou ausente.' });
    }
}

router.get('/users', (req, res) => {
    const search = String(req.query.search ?? '').trim();
    const users = db.prepare(`
        SELECT id, name, email
        FROM tutors
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY name ASC
    `).all(`%${search}%`, `%${search}%`);

    res.json(users);
});

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

router.get('/pets', authenticate, (req, res) => {
    const pets = db.prepare(`
        SELECT id, name, breed, age, weight, contact_phone AS contactPhone
        FROM pets
        WHERE tutor_id = ?
        ORDER BY name ASC
    `).all(req.tutorId);

    res.json(pets);
});

router.post('/pets', authenticate, (req, res) => {
    const { breed, name, age, weight, contactPhone } = req.body;
    const numericAge = Number(age);
    const numericWeight = Number(weight);

    if (!breed || !name || !contactPhone || !Number.isInteger(numericAge) || numericAge < 0 ||
        !Number.isFinite(numericWeight) || numericWeight <= 0) {
        return res.status(400).json({ error: 'Preencha todos os dados do pet corretamente.' });
    }

    const result = db.prepare(`
        INSERT INTO pets (tutor_id, name, breed, age, weight, contact_phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.tutorId, name.trim(), breed.trim(), numericAge, numericWeight, contactPhone.trim());

    res.status(201).json({
        id: result.lastInsertRowid,
        name: name.trim(),
        breed: breed.trim(),
        age: numericAge,
        weight: numericWeight,
        contactPhone: contactPhone.trim(),
    });
});

router.put('/pets/:id', authenticate, (req, res) => {
    const { breed, name, age, weight, contactPhone } = req.body;
    const numericAge = Number(age);
    const numericWeight = Number(weight);
    const petId = Number(req.params.id);

    if (!Number.isInteger(petId) || !breed || !name || !contactPhone || !Number.isInteger(numericAge) ||
        numericAge < 0 || !Number.isFinite(numericWeight) || numericWeight <= 0) {
        return res.status(400).json({ error: 'Preencha todos os dados do pet corretamente.' });
    }

    const result = db.prepare(`
        UPDATE pets
        SET name = ?, breed = ?, age = ?, weight = ?, contact_phone = ?
        WHERE id = ? AND tutor_id = ?
    `).run(name.trim(), breed.trim(), numericAge, numericWeight, contactPhone.trim(), petId, req.tutorId);

    if (result.changes === 0) return res.status(404).json({ error: 'Pet não encontrado.' });

    res.json({ id: petId, name: name.trim(), breed: breed.trim(), age: numericAge, weight: numericWeight, contactPhone: contactPhone.trim() });
});

router.delete('/pets/:id', authenticate, (req, res) => {
    const petId = Number(req.params.id);
    if (!Number.isInteger(petId)) return res.status(400).json({ error: 'ID de pet inválido.' });

    const result = db.prepare('DELETE FROM pets WHERE id = ? AND tutor_id = ?').run(petId, req.tutorId);
    if (result.changes === 0) return res.status(404).json({ error: 'Pet não encontrado.' });

    res.sendStatus(204);
});

export default router;