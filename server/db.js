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
    age INTEGER NOT NULL,
    weight REAL NOT NULL,
    contact_phone TEXT NOT NULL,
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

const petColumns = db.prepare("PRAGMA table_info(pets)").all();
const petColumnNames = new Set(petColumns.map((column) => column.name));

if (!petColumnNames.has("age")) db.exec("ALTER TABLE pets ADD COLUMN age INTEGER NOT NULL DEFAULT 0");
if (!petColumnNames.has("weight")) db.exec("ALTER TABLE pets ADD COLUMN weight REAL NOT NULL DEFAULT 0");
if (!petColumnNames.has("contact_phone")) {
  db.exec("ALTER TABLE pets ADD COLUMN contact_phone TEXT NOT NULL DEFAULT ''");
}

export default db;