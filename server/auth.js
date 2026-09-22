import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = express.Router();
const JWT_SECRET = 'chave-secreta-de-estudo-troque-depois';
const BOOKING_SLOTS = [
    { start: '08:00', capacity: 4 },
    { start: '09:30', capacity: 4 },
    { start: '11:00', capacity: 4 },
    { start: '12:30', capacity: 4 },
    { start: '14:00', capacity: 4 },
    { start: '15:30', capacity: 4 },
    { start: '17:00', capacity: 4 },
    { start: '18:00', capacity: 2 },
];
const BOOKING_SERVICES = [
    'Banho',
    'Tosa completa',
    'Tosa higiênica',
    'Limpeza de ouvidos',
    'Corte de unhas',
    'Hidratação premium',
];

function isWeekday(date) {
    const day = new Date(`${date}T12:00:00`).getDay();
    return day >= 1 && day <= 5;
}

function isPastDate(date) {
    const today = new Date().toISOString().slice(0, 10);
    return date < today;
}

function getSlot(date, start) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWeekday(date)) return null;
    return BOOKING_SLOTS.find((slot) => slot.start === start) ?? null;
}

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

router.get('/appointments/availability', authenticate, (req, res) => {
    const date = String(req.query.date ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isWeekday(date) || isPastDate(date)) {
        return res.status(400).json({ error: 'Escolha um dia útil atual ou futuro.' });
    }

    const appointments = db.prepare(`
        SELECT slot_start, COUNT(*) AS booked
        FROM appointments
        WHERE date = ?
        GROUP BY slot_start
    `).all(date);
    const bookedBySlot = new Map(appointments.map((item) => [item.slot_start, item.booked]));

    res.json(BOOKING_SLOTS.map((slot) => ({
        start: slot.start,
        capacity: slot.capacity,
        booked: bookedBySlot.get(slot.start) ?? 0,
        available: slot.capacity - (bookedBySlot.get(slot.start) ?? 0),
    })));
});

router.get('/appointments', authenticate, (req, res) => {
    const appointments = db.prepare(`
         SELECT appointments.id, appointments.date, appointments.slot_start AS slotStart,
             appointments.service,
               pets.id AS petId, pets.name AS petName, pets.breed AS petBreed
        FROM appointments
        JOIN pets ON pets.id = appointments.pet_id
        WHERE pets.tutor_id = ?
        ORDER BY appointments.date, appointments.slot_start
    `).all(req.tutorId);

    res.json(appointments);
});

router.post('/appointments', authenticate, (req, res) => {
    const { petId, date, slotStart, services } = req.body;
    const numericPetId = Number(petId);
    const slot = getSlot(String(date ?? ''), String(slotStart ?? ''));
    const selectedServices = Array.isArray(services) ? [...new Set(services)] : [];
    const hasExclusiveServices = selectedServices.includes('Tosa completa') && selectedServices.includes('Tosa higiênica');

    if (!Number.isInteger(numericPetId) || !slot || isPastDate(String(date)) || selectedServices.length === 0 ||
        hasExclusiveServices || selectedServices.some((service) => !BOOKING_SERVICES.includes(service))) {
        return res.status(400).json({ error: 'Pet, data ou horário inválido.' });
    }

    const transaction = db.transaction(() => {
        const pet = db.prepare('SELECT id FROM pets WHERE id = ? AND tutor_id = ?').get(numericPetId, req.tutorId);
        if (!pet) return { error: 'Pet não encontrado.' };

        const booked = db.prepare('SELECT COUNT(*) AS total FROM appointments WHERE date = ? AND slot_start = ?')
            .get(date, slot.start).total;
        if (booked >= slot.capacity) return { error: 'Este horário não possui mais vagas.' };

        const result = db.prepare(`
            INSERT INTO appointments (pet_id, service, date, slot_start)
            VALUES (?, ?, ?, ?)
        `).run(numericPetId, selectedServices.join(', '), date, slot.start);

        return { id: result.lastInsertRowid };
    })();

    if (transaction.error) return res.status(transaction.error === 'Pet não encontrado.' ? 404 : 409).json({ error: transaction.error });
    res.status(201).json({ id: transaction.id, date, slotStart: slot.start, petId: numericPetId, service: selectedServices.join(', ') });
});

router.put('/appointments/:id', authenticate, (req, res) => {
    const appointmentId = Number(req.params.id);
    const selectedServices = Array.isArray(req.body.services) ? [...new Set(req.body.services)] : [];
    const hasExclusiveServices = selectedServices.includes('Tosa completa') && selectedServices.includes('Tosa higiênica');

    if (!Number.isInteger(appointmentId) || selectedServices.length === 0 || hasExclusiveServices ||
        selectedServices.some((service) => !BOOKING_SERVICES.includes(service))) {
        return res.status(400).json({ error: 'Serviços inválidos.' });
    }

    const result = db.prepare(`
        UPDATE appointments
        SET service = ?
        WHERE id = ? AND pet_id IN (SELECT id FROM pets WHERE tutor_id = ?)
    `).run(selectedServices.join(', '), appointmentId, req.tutorId);

    if (result.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.json({ id: appointmentId, service: selectedServices.join(', ') });
});

router.delete('/appointments/:id', authenticate, (req, res) => {
    const appointmentId = Number(req.params.id);
    if (!Number.isInteger(appointmentId)) return res.status(400).json({ error: 'ID de agendamento inválido.' });

    const result = db.prepare(`
        DELETE FROM appointments
        WHERE id = ? AND pet_id IN (SELECT id FROM pets WHERE tutor_id = ?)
    `).run(appointmentId, req.tutorId);

    if (result.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.sendStatus(204);
});

export default router;