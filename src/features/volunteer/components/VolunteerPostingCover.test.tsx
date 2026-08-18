import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import { renderWithProviders } from "@/test/renderWithProviders";

import { VolunteerPostingCover } from "./VolunteerPostingCover";

describe("VolunteerPostingCover", () => {
  it("remote 이미지 로드에 실패하면 카테고리 fallback 이미지로 전환한다", () => {
    const remoteUrl = "https://cdn.example.com/volunteer-thumbnail.webp";
    const { container } = renderWithProviders(
      <VolunteerPostingCover
        imageUrl={remoteUrl}
        category="EDUCATION"
        postingId={101}
      />,
    );
    const image = container.querySelector("img");

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute("src", remoteUrl);

    fireEvent.error(image!);

    expect(image).toHaveAttribute(
      "src",
      getVolunteerPostingImage("EDUCATION", 101),
    );
  });
});
