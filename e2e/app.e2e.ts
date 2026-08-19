import { expect, test } from "@playwright/test";

test("홈에서 하단 내비게이션을 통해 모임으로 이동한다", async ({ page }) => {
  await page.goto("/home");

  const navigation = page.getByRole("navigation", { name: "하단 내비게이션" });

  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "홈" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "모임" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "마이" })).toBeVisible();

  await navigation.getByRole("link", { name: "모임" }).click();

  await expect(page).toHaveURL(/\/teams$/);
});
