import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("premium shell desktop", () => {
  test.use({
    viewport: { width: 1440, height: 960 },
  });

  test("landing header stays on one line with no desktop overflow", async ({ page }) => {
    await page.goto(baseURL, { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", {
        name: "What's Your Personal Intelligence Score?",
      })
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Test", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Arena", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Leaderboard", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Story", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();

    const metrics = await page.evaluate(() => {
      const header = document.querySelector(".site-header") as HTMLElement | null;
      const nav = document.querySelector(".site-nav") as HTMLElement | null;
      const utility = document.querySelector(".site-utility-actions") as HTMLElement | null;
      const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;

      return {
        overflow,
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        navTop: nav?.getBoundingClientRect().top ?? 0,
        utilityTop: utility?.getBoundingClientRect().top ?? 0,
      };
    });

    expect(metrics.overflow).toBeFalsy();
    expect(metrics.headerHeight).toBeLessThan(84);
    expect(Math.abs(metrics.navTop - metrics.utilityTop)).toBeLessThanOrEqual(2);
  });

  test("results and leaderboard keep stable desktop shells", async ({ page }) => {
    await page.goto(`${baseURL}/results?score=53`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /intelligence report/i })).toBeVisible();

    let hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasOverflow).toBeFalsy();

    await page.goto(`${baseURL}/leaderboard?tab=all`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /compounding context/i })).toBeVisible();

    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasOverflow).toBeFalsy();
  });
});
