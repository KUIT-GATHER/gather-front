import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileStep } from "@/features/auth/components/signup/steps/ProfileStep";
import {
  signupCommonDefaultValues,
  type SignupCommonFormValues,
} from "@/features/auth/schemas/signupCommon.schema";
import { renderWithProviders } from "@/test/renderWithProviders";

function ProfileStepHarness() {
  const methods = useForm<SignupCommonFormValues>({
    defaultValues: signupCommonDefaultValues,
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  return (
    <FormProvider {...methods}>
      <ProfileStep
        profileImageFile={profileImageFile}
        onProfileImageFileChange={setProfileImageFile}
      />
    </FormProvider>
  );
}

describe("ProfileStep profile image", () => {
  const createObjectURL = vi.fn(() => "blob:profile-preview");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  afterEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("기본 프로필 이미지와 지원 형식을 표시한다", () => {
    renderWithProviders(<ProfileStepHarness />);

    expect(screen.getByAltText("기본 프로필 이미지")).toBeInTheDocument();
    expect(screen.getByLabelText("프로필 이미지 선택")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
  });

  it.each([
    ["image/jpeg", "profile.jpg"],
    ["image/png", "profile.png"],
    ["image/webp", "profile.webp"],
  ])("%s 파일을 선택하면 원형 미리보기를 표시한다", (type, name) => {
    const { unmount } = renderWithProviders(<ProfileStepHarness />);
    const file = new File(["image-data"], name, { type });

    fireEvent.change(screen.getByLabelText("프로필 이미지 선택"), {
      target: { files: [file] },
    });

    expect(
      screen.getByAltText("선택한 프로필 이미지 미리보기"),
    ).toHaveAttribute("src", "blob:profile-preview");
    expect(createObjectURL).toHaveBeenCalledWith(file);

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:profile-preview");
  });

  it("지원하지 않는 파일 형식을 거부한다", () => {
    renderWithProviders(<ProfileStepHarness />);

    fireEvent.change(screen.getByLabelText("프로필 이미지 선택"), {
      target: {
        files: [new File(["gif"], "profile.gif", { type: "image/gif" })],
      },
    });

    expect(
      screen.getByText("JPEG, PNG, WebP 이미지만 사용할 수 있어요."),
    ).toHaveAttribute("role", "alert");
    expect(screen.getByAltText("기본 프로필 이미지")).toBeInTheDocument();
  });

  it("5MB를 초과하거나 비어 있는 파일을 거부한다", () => {
    renderWithProviders(<ProfileStepHarness />);
    const input = screen.getByLabelText("프로필 이미지 선택");

    fireEvent.change(input, {
      target: {
        files: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
            type: "image/png",
          }),
        ],
      },
    });

    expect(
      screen.getByText("프로필 이미지는 5MB 이하여야 해요."),
    ).toBeInTheDocument();

    fireEvent.change(input, {
      target: { files: [new File([], "empty.png", { type: "image/png" })] },
    });

    expect(
      screen.getByText("비어 있는 이미지 파일은 사용할 수 없어요."),
    ).toBeInTheDocument();
  });
});
