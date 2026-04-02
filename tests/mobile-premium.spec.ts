import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("mobile premium smoke", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("landing stays usable and overflow-free on mobile", async ({
    page,
  }) => {
    await page.goto(baseURL, { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", {
        name: "What's Your Personal Intelligence Score?",
      })
    ).toBeVisible();

    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await expect(
      page.locator(".site-nav").getByRole("link", { name: "Arena" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(hasOverflow).toBeFalsy();
  });

  test("quick quiz completes and lands on results cleanly", async ({ page }) => {
    await page.goto(`${baseURL}/quiz`, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /memory & recall/i }).click();
    await page.getByRole("button", { name: /start the diagnostic/i }).click();

    for (let index = 0; index < 10; index += 1) {
      await page.locator(".option-btn").first().click();
      await page.waitForTimeout(260);
    }

    await expect(
      page.getByRole("heading", { name: /intelligence report/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /share result/i })
    ).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(hasOverflow).toBeFalsy();
  });

  test("daily arena completes and reaches summary without mobile overflow", async ({
    page,
  }) => {
    await page.goto(`${baseURL}/arena`, { waitUntil: "networkidle" });
    await expect(page.locator(".arena-card")).toBeVisible();

    for (let index = 0; index < 7; index += 1) {
      await page.locator(".arena-btn--agree").first().click();
      await page.waitForTimeout(320);
    }

    await expect(
      page.getByRole("heading", { name: /thinker/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /share profile/i })
    ).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(hasOverflow).toBeFalsy();
  });
});
