import { expect, test } from "@playwright/test";

import { loginWithDefaultMockUser } from "./helpers/auth";

test("알림을 선택하면 연결된 화면으로 이동한다", async ({ page }) => {
  await page.goto("/login");
  await loginWithDefaultMockUser(page);

  await page.goto("/notifications");

  const badgeNotification = page.getByRole("button", {
    name: /새로운 뱃지를 획득했어요/,
  });

  await expect(badgeNotification).toBeVisible();
  await badgeNotification.click();

  await expect(page).toHaveURL(/\/my\/badges$/);
});
