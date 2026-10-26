import { createTestUser } from "../data/users";
import { test } from "../fixtures/test";
import db from "../server/db";
import { toLocalISO } from "../src/utils/dates";

function removeTestUser(email: string) {
  const tutor = db.prepare("SELECT id FROM tutors WHERE email = ?").get(email) as
    { id: number } | undefined;
  if (!tutor) return;
  db.prepare(
    "DELETE FROM appointments WHERE pet_id IN (SELECT id FROM pets WHERE tutor_id = ?)",
  ).run(tutor.id);
  db.prepare("DELETE FROM pets WHERE tutor_id = ?").run(tutor.id);
  db.prepare("DELETE FROM tutors WHERE id = ?").run(tutor.id);
}

test("permite cadastrar um tutor e sair da área", async ({
  homePage,
  loginPage,
  registerPage,
  minhaAreaPage,
}) => {
  const user = createTestUser();

  try {
    await homePage.goto();
    await homePage.openTutorArea();
    await loginPage.openRegister();
    await registerPage.expectLoaded();
    await registerPage.register(user);
    await minhaAreaPage.expectLoaded(user.name);
    await minhaAreaPage.logout();
    await homePage.expectLoaded();
  } finally {
    removeTestUser(user.email);
  }
});

test("permite entrar na área do tutor com credenciais válidas", async ({
  homePage,
  loginPage,
  registerPage,
  minhaAreaPage,
}) => {
  const user = createTestUser();

  try {
    await homePage.goto();
    await homePage.openTutorArea();
    await loginPage.openRegister();
    await registerPage.register(user);
    await minhaAreaPage.expectLoaded(user.name);
    await minhaAreaPage.logout();
    await homePage.expectLoaded();

    await homePage.openTutorArea();
    await loginPage.expectLoaded();
    await loginPage.login(user);
    await minhaAreaPage.expectLoaded(user.name);
  } finally {
    removeTestUser(user.email);
  }
});

test("permite agendar um pet com serviços e bloqueia tosas incompatíveis", async ({
  homePage,
  loginPage,
  registerPage,
  minhaAreaPage,
}) => {
  const user = createTestUser();
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  const bookingDate = toLocalISO(date);

  try {
    await homePage.goto();
    await homePage.openTutorArea();
    await loginPage.openRegister();
    await registerPage.register(user);
    await minhaAreaPage.expectLoaded(user.name);
    await minhaAreaPage.expectWhatsAppBookingButtonDisabled(true);
    await minhaAreaPage.registerPet();
    await minhaAreaPage.openServiceSelection(bookingDate);
    await minhaAreaPage.expectBookingServices();
    await minhaAreaPage.selectServices();
    await minhaAreaPage.expectAppointmentWithServices();
    await minhaAreaPage.expectWhatsAppBookingButtonDisabled(false);
    await minhaAreaPage.expectWhatsAppBookingMessage(user.name);
  } finally {
    removeTestUser(user.email);
  }
});
