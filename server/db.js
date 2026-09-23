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

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    image TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );
`);

const products = [
  ["Shampoo Premium", "Cuidado delicado para uma pelagem macia e perfumada.", 9359, "shampoo"],
  ["Saco de Ração 20kg", "Nutrição completa para manter seu pet saudável.", 38999, "racao"],
  ["Mordedor Reforçado", "Diversão resistente para os momentos de brincadeira.", 8000, "mordedor"],
  ["Guia Unificada", "Praticidade e segurança para os passeios diários.", 12000, "guia"],
];

const insertProduct = db.prepare(`
  INSERT INTO products (name, description, price_cents, image)
  VALUES (?, ?, ?, ?)
`);

const productCount = db.prepare("SELECT COUNT(*) AS total FROM products").get().total;
if (productCount === 0) {
  const seedProducts = db.transaction(() => products.forEach((product) => insertProduct.run(...product)));
  seedProducts();
}

const appointmentColumns = db.prepare("PRAGMA table_info(appointments)").all();
const appointmentColumnNames = new Set(appointmentColumns.map((column) => column.name));

if (!appointmentColumnNames.has("slot_start")) {
  db.exec("ALTER TABLE appointments ADD COLUMN slot_start TEXT NOT NULL DEFAULT ''");
}

db.exec("CREATE INDEX IF NOT EXISTS appointments_date_index ON appointments(date)");

const petColumns = db.prepare("PRAGMA table_info(pets)").all();
const petColumnNames = new Set(petColumns.map((column) => column.name));

if (!petColumnNames.has("age")) db.exec("ALTER TABLE pets ADD COLUMN age INTEGER NOT NULL DEFAULT 0");
if (!petColumnNames.has("weight")) db.exec("ALTER TABLE pets ADD COLUMN weight REAL NOT NULL DEFAULT 0");
if (!petColumnNames.has("contact_phone")) {
  db.exec("ALTER TABLE pets ADD COLUMN contact_phone TEXT NOT NULL DEFAULT ''");
}

export default db;