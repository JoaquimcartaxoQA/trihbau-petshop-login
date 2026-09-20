import { createTestUser } from "../data/users";
import { test } from "../fixtures/test";

test("permite cadastrar um tutor e sair da área", async ({ homePage, loginPage, registerPage, minhaAreaPage }) => {
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