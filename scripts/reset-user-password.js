import bcrypt from "bcrypt";
import db from "../server/db.js";

const [, , idArgument, newPassword] = process.argv;
const userId = Number(idArgument);

if (!Number.isInteger(userId) || userId < 1) {
  console.error("Uso: npm run reset-password -- <id> <nova-senha>");
  process.exit(1);
}

if (!newPassword || newPassword.length < 6) {
  console.error("A nova senha deve ter pelo menos 6 caracteres.");
  process.exit(1);
}

const user = db.prepare("SELECT id, name, email FROM tutors WHERE id = ?").get(userId);

if (!user) {
  console.error(`Tutor com ID ${userId} não encontrado.`);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(newPassword, 10);
db.prepare("UPDATE tutors SET password_hash = ? WHERE id = ?").run(passwordHash, userId);

console.log(`Senha redefinida para o tutor ${user.name} (${user.email}).`);
