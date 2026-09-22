import { createTestUser } from "../data/users";
import { test } from "../fixtures/test";
import db from "../server/db";

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

  await homePage.goto();
  await homePage.openTutorArea();
  await loginPage.openRegister();
  await registerPage.expectLoaded();
  await registerPage.register(user);
  await minhaAreaPage.expectLoaded(user.name);
  await minhaAreaPage.logout();
  await homePage.expectLoaded();
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
  const bookingDate = date.toISOString().slice(0, 10);

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
