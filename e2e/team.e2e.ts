import { expect, test } from "@playwright/test";

test("모임 목록에서 모임 상세로 이동한다", async ({ page }) => {
  await page.goto("/teams");

  const teamName = "찜한 모임 무한스크롤 테스트 19";
  const teamCard = page.getByRole("button", {
    name: new RegExp(`^${teamName}\\b`),
  });

  await expect(teamCard).toBeVisible();
  await teamCard.click();

  await expect(page).toHaveURL(/\/teams\/119$/);
  await expect(page.getByRole("heading", { name: teamName })).toBeVisible();
});
