import { expect, test } from "@playwright/test";

import { loginWithDefaultMockUser } from "./helpers/auth";

test("비로그인 사용자가 보호 경로에서 로그인하면 원래 경로로 돌아간다", async ({
  page,
}) => {
  await page.goto("/my");

  await expect(page).toHaveURL(/\/login$/);

  await loginWithDefaultMockUser(page);

  await expect(page).toHaveURL(/\/my$/);
});
