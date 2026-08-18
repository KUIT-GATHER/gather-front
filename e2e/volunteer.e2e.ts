import { expect, test } from "@playwright/test";

import { loginWithDefaultMockUser } from "./helpers/auth";

test("비회원이 봉사 신청을 시도하면 로그인 후 원래 공고로 돌아온다", async ({
  page,
}) => {
  await page.goto("/volunteers/1");

  await expect(page.getByRole("button", { name: "신청하기" })).toBeVisible();
  await page.getByRole("button", { name: "신청하기" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await loginWithDefaultMockUser(page);

  await expect(page).toHaveURL(/\/volunteers\/1$/);
});
