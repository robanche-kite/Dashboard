import { test, expect } from "@playwright/test";

test("home redirects to projects and shows empty state", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
});

test("can create a project", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: /new project|create your first project/i }).first().click();
  const name = `Test project ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: /create project/i }).click();
  await expect(page.getByText(name)).toBeVisible();
});
