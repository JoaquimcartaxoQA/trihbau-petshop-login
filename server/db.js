import Database from 'better-sqlite3';
const db = new Database('trihbau.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tutors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tutor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    breed TEXT,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(id)
  );
`);

export default db;