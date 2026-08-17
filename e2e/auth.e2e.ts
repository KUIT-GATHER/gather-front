import { expect, test, type Page } from "@playwright/test";

import { loginWithDefaultMockUser } from "./helpers/auth";

async function completePhoneVerification(page: Page) {
  const confirmResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/v1/auth/phone-verifications/") &&
      response.url().endsWith("/confirm") &&
      response.ok(),
  );

  await page.getByRole("button", { name: "인증하기" }).click();
  await confirmResponse;
  await expect(page.getByRole("button", { name: "인증완료" })).toBeVisible();
}

test("비로그인 사용자가 보호 경로에서 로그인하면 원래 경로로 돌아간다", async ({
  page,
}) => {
  await page.goto("/my");

  await expect(page).toHaveURL(/\/login$/);

  await loginWithDefaultMockUser(page);

  await expect(page).toHaveURL(/\/my$/);
});

test("아이디 찾기 결과에서 이메일 로그인 화면으로 이동하고 이메일을 채운다", async ({
  page,
}) => {
  await page.goto("/login/email");
  await page.getByRole("button", { name: "아이디/비밀번호 찾기" }).click();

  await page.getByLabel(/전화번호/).fill("01012345678");
  await completePhoneVerification(page);

  await page.getByRole("button", { name: "확인" }).click();
  await expect(page.getByText("이메일/아이디를 찾았어요!")).toBeVisible();

  await page.getByRole("button", { name: /이메일로 로그인/ }).click();
  await expect(
    page.getByRole("alertdialog").getByText("로그인 화면으로 이동하시겠어요?"),
  ).toBeVisible();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "확인" })
    .click();

  await expect(page).toHaveURL(/\/login\/email$/);
  await expect(page.getByLabel("이메일", { exact: true })).toHaveValue(
    "test@example.com",
  );
});

test("비밀번호 찾기에서 reset token을 발급받아 비밀번호를 재설정한다", async ({
  page,
}) => {
  await page.goto("/login/email");
  await page.getByRole("button", { name: "아이디/비밀번호 찾기" }).click();
  await page.getByRole("tab", { name: "비밀번호 찾기" }).click();

  await page.getByLabel(/전화번호/).fill("01012345678");
  await completePhoneVerification(page);

  await page.getByRole("button", { name: "비밀번호 재설정" }).click();
  await expect(page).toHaveURL(/\/account-recovery\/password$/);

  await page.locator("#password-reset-password").fill("password2");
  await page.locator("#password-reset-confirm").fill("password2");
  await page.getByRole("button", { name: "로그인하러 가기" }).click();

  await expect(page).toHaveURL(/\/login\/email$/);
});
