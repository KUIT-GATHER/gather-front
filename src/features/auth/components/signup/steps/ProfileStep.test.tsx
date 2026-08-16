import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("유효한 이미지 파일을 선택하면 미리보기를 표시하고 unmount 시 URL을 정리한다", async () => {
    const { user, unmount } = renderWithProviders(<ProfileStepHarness />);
    const file = new File(["image-data"], "profile.jpg", {
      type: "image/jpeg",
    });

    await user.upload(screen.getByLabelText("프로필 이미지 선택"), file);

    expect(
      screen.getByAltText("선택한 프로필 이미지 미리보기"),
    ).toHaveAttribute("src", "blob:profile-preview");
    expect(createObjectURL).toHaveBeenCalledWith(file);

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:profile-preview");
  });

  it("지원하지 않는 파일 형식을 거부한다", async () => {
    renderWithProviders(<ProfileStepHarness />);
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(
      screen.getByLabelText("프로필 이미지 선택"),
      new File(["gif"], "profile.gif", { type: "image/gif" }),
    );

    expect(
      screen.getByText("JPEG, PNG, WebP 이미지만 사용할 수 있어요."),
    ).toHaveAttribute("role", "alert");
    expect(screen.getByAltText("기본 프로필 이미지")).toBeInTheDocument();
  });

  it("5MB를 초과하는 이미지를 거부한다", async () => {
    const { user } = renderWithProviders(<ProfileStepHarness />);
    const input = screen.getByLabelText("프로필 이미지 선택");

    await user.upload(
      input,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
        type: "image/png",
      }),
    );

    expect(
      screen.getByText("프로필 이미지는 5MB 이하여야 해요."),
    ).toBeInTheDocument();
  });
});
