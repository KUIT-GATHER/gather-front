import type { Page } from "@playwright/test";

export async function loginWithDefaultMockUser(page: Page) {
  await page.getByRole("button", { name: "이메일로 시작하기" }).click();

  await page.getByLabel("이메일", { exact: true }).fill("test@example.com");
  await page.getByLabel("비밀번호", { exact: true }).fill("test1234");

  const loginResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/v1/auth/login") &&
      response.ok(),
  );

  await page.getByRole("button", { name: "로그인" }).click();
  await loginResponse;
}
