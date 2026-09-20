import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { MinhaAreaPage } from "../pages/MinhaAreaPage";
import { RegisterPage } from "../pages/RegisterPage";

type Fixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  minhaAreaPage: MinhaAreaPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  minhaAreaPage: async ({ page }, use) => use(new MinhaAreaPage(page)),
});

export { expect } from "@playwright/test";