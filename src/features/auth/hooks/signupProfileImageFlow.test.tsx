import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type FormEvent, type ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEmailSignupFlow } from "@/features/auth/hooks/useEmailSignupFlow";
import { useKakaoSignupFlow } from "@/features/auth/hooks/useKakaoSignupFlow";
import type { EmailSignupFormValues } from "@/features/auth/schemas/emailSignup.schema";
import type { KakaoSignupFormValues } from "@/features/auth/schemas/kakaoSignup.schema";
import type { EmailSignupRequest } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useKakaoSignupStore } from "@/features/auth/store/kakaoSignup.store";
import { server } from "@/mocks/server";
import { createTestQueryClient } from "@/test/createTestQueryClient";

const uploadProfileImageMock = vi.hoisted(() => vi.fn());
const TEST_PHONE_VERIFICATION_ID = "5c5d5db1-4187-43d0-8580-672307994878";
const TEST_EMAIL_VERIFICATION_ID = "7d6e5f4a-3b2c-1d0e-9f8a-76543210abcd";

vi.mock("@/features/profile/lib/profileImageUpload", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/profile/lib/profileImageUpload")
    >();

  return {
    ...actual,
    uploadProfileImage: uploadProfileImageMock,
  };
});

const emailSignupValues: EmailSignupFormValues = {
  name: "홍길동",
  birthDate: "2000-01-01",
  gender: "MALE",
  phoneNumber: "01012345678",
  email: "new-user@example.com",
  emailVerificationCode: "123456",
  password: "password1",
  passwordConfirm: "password1",
  nickname: "새회원",
  introduction: "반갑습니다",
  activityRegionId: 41,
  interestCategories: ["ENVIRONMENT"],
  serviceTermsAgreed: true,
  privacyPolicyAgreed: true,
  marketingAgreed: false,
};

const kakaoSignupValues: KakaoSignupFormValues = {
  name: "김카카오",
  birthDate: "2000-01-01",
  gender: "FEMALE",
  phoneNumber: "01087654321",
  nickname: "카카오회원",
  introduction: "반갑습니다",
  activityRegionId: 41,
  interestCategories: ["COMMUNITY"],
  serviceTermsAgreed: true,
  privacyPolicyAgreed: true,
  marketingAgreed: false,
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function createWrapper(initialPath: string) {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          {children}
          <LocationProbe />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function createSubmitEvent() {
  return {
    preventDefault: vi.fn(),
  } as unknown as FormEvent<HTMLFormElement>;
}

async function submitStep(
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void,
) {
  act(() => handleSubmit(createSubmitEvent()));
  await act(async () => Promise.resolve());
}

async function moveEmailFlowToTerms(result: {
  current: ReturnType<typeof useEmailSignupFlow>;
}) {
  act(() => result.current.methods.reset(emailSignupValues));
  await waitFor(() =>
    expect(result.current.methods.getValues("phoneNumber")).toBe(
      emailSignupValues.phoneNumber,
    ),
  );
  act(() =>
    result.current.setVerifiedPhoneNumber(emailSignupValues.phoneNumber),
  );
  act(() => result.current.setPhoneVerificationId(TEST_PHONE_VERIFICATION_ID));
  await submitStep(result.current.handleFormSubmit);
  await waitFor(() => expect(result.current.step).toBe("account"));
  act(() => {
    result.current.methods.setValue("emailVerificationCode", "123456");
    result.current.setEmailVerificationProof({
      email: emailSignupValues.email,
      emailVerificationId: TEST_EMAIL_VERIFICATION_ID,
    });
  });
  await submitStep(result.current.handleFormSubmit);
  await waitFor(() => expect(result.current.step).toBe("profile"));
}

async function moveKakaoFlowToProfile(result: {
  current: ReturnType<typeof useKakaoSignupFlow>;
}) {
  act(() => result.current.methods.reset(kakaoSignupValues));
  await waitFor(() =>
    expect(result.current.methods.getValues("phoneNumber")).toBe(
      kakaoSignupValues.phoneNumber,
    ),
  );
  act(() =>
    result.current.setVerifiedPhoneNumber(kakaoSignupValues.phoneNumber),
  );
  act(() => result.current.setPhoneVerificationId(TEST_PHONE_VERIFICATION_ID));
  await submitStep(result.current.handleFormSubmit);
  await waitFor(() => expect(result.current.step).toBe("profile"));
}

describe("signup profile image orchestration", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    uploadProfileImageMock.mockReset();
    uploadProfileImageMock.mockResolvedValue({ profileImageUrl: "uploaded" });
    useKakaoSignupStore.getState().clearKakaoSignupSession();
  });

  it("이미지 없이 이메일 가입 후 토큰을 저장하고 홈으로 이동한다", async () => {
    let signupRequestCount = 0;
    let signupCredentials: RequestCredentials | undefined;
    let signupRequest: EmailSignupRequest | null = null;
    server.use(
      http.post("*/api/v1/auth/signup", async ({ request }) => {
        signupRequestCount += 1;
        signupCredentials = request.credentials;
        signupRequest = (await request.json()) as EmailSignupRequest;
        return HttpResponse.json(
          {
            success: true,
            data: {
              userId: 101,
              email: emailSignupValues.email,
              name: emailSignupValues.name,
              nickname: emailSignupValues.nickname,
              accessToken: "email-signup-access-token",
              tokenType: "Bearer",
            },
            error: null,
          },
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });
    await moveEmailFlowToTerms(result);
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/home"),
    );
    expect(signupRequestCount).toBe(1);
    expect(signupCredentials).toBe("include");
    expect(signupRequest).toEqual(
      expect.objectContaining({
        emailVerificationId: TEST_EMAIL_VERIFICATION_ID,
      }),
    );
    expect(uploadProfileImageMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "email-signup-access-token",
      isAuthenticated: true,
    });
    expect(result.current.profileImageFile).toBeNull();
  });

  it("이메일 가입 시 선택한 이미지를 단계 이동 후에도 유지하고 토큰 저장 뒤 업로드한다", async () => {
    server.use(
      http.post("*/api/v1/auth/signup", () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              userId: 102,
              email: emailSignupValues.email,
              name: emailSignupValues.name,
              nickname: emailSignupValues.nickname,
              accessToken: "email-image-access-token",
              tokenType: "Bearer",
            },
            error: null,
          },
          { status: 201 },
        ),
      ),
    );
    uploadProfileImageMock.mockImplementation(() => {
      expect(useAuthStore.getState().accessToken).toBe(
        "email-image-access-token",
      );
      return Promise.resolve({ profileImageUrl: "uploaded" });
    });
    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });
    const image = new File(["image"], "profile.webp", {
      type: "image/webp",
    });

    await moveEmailFlowToTerms(result);
    act(() => result.current.setProfileImageFile(image));
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    act(() => result.current.handleBack());
    expect(result.current.step).toBe("profile");
    expect(result.current.profileImageFile).toBe(image);
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() =>
      expect(uploadProfileImageMock).toHaveBeenCalledWith(image),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/home");
  });

  it("이메일 가입 후 이미지 업로드가 실패해도 인증과 가입 성공을 유지한다", async () => {
    let signupRequestCount = 0;
    server.use(
      http.post("*/api/v1/auth/signup", () => {
        signupRequestCount += 1;
        return HttpResponse.json(
          {
            success: true,
            data: {
              userId: 103,
              email: emailSignupValues.email,
              name: emailSignupValues.name,
              nickname: emailSignupValues.nickname,
              accessToken: "email-upload-failed-token",
              tokenType: "Bearer",
            },
            error: null,
          },
          { status: 201 },
        );
      }),
    );
    uploadProfileImageMock.mockImplementationOnce(() => {
      useAuthStore.getState().clearAuth();
      return Promise.reject(new Error("upload failed"));
    });
    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });
    const image = new File(["image"], "profile.png", { type: "image/png" });

    await moveEmailFlowToTerms(result);
    act(() => result.current.setProfileImageFile(image));
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/home"),
    );
    expect(signupRequestCount).toBe(1);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "email-upload-failed-token",
      isAuthenticated: true,
    });
  });

  it("이메일이 변경되면 기존 email verification proof를 제거한다", async () => {
    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });

    act(() => {
      result.current.methods.setValue("email", "before@example.com");
      result.current.setEmailVerificationProof({
        email: "before@example.com",
        emailVerificationId: TEST_EMAIL_VERIFICATION_ID,
      });
    });

    act(() => {
      result.current.methods.setValue("email", "after@example.com");
    });

    await waitFor(() => {
      expect(result.current.emailVerificationProof).toBeNull();
      expect(result.current.methods.getValues("emailVerificationCode")).toBe(
        "",
      );
    });
  });

  it("EMAIL_VERIFICATION_REQUIRED 수신 시 proof와 코드를 지우고 account 단계로 돌아간다", async () => {
    server.use(
      http.post("*/api/v1/auth/signup", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "EMAIL_VERIFICATION_REQUIRED",
              message: "이메일 인증이 필요합니다.",
            },
          },
          { status: 400 },
        ),
      ),
    );

    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });

    await moveEmailFlowToTerms(result);
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() => {
      expect(result.current.step).toBe("account");
      expect(result.current.emailVerificationProof).toBeNull();
      expect(result.current.methods.getValues("emailVerificationCode")).toBe(
        "",
      );
      expect(result.current.methods.getFieldState("email").error?.message).toBe(
        "이메일 인증을 다시 완료해 주세요.",
      );
    });
  });

  it("최종 submit 시 현재 이메일과 proof가 다르면 signup API를 호출하지 않는다", async () => {
    let signupRequestCount = 0;
    server.use(
      http.post("*/api/v1/auth/signup", () => {
        signupRequestCount += 1;
        return HttpResponse.json({
          success: true,
          data: {
            userId: 104,
            email: "after@example.com",
            name: emailSignupValues.name,
            nickname: emailSignupValues.nickname,
            accessToken: "unexpected-token",
            tokenType: "Bearer",
          },
          error: null,
        });
      }),
    );

    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });

    await moveEmailFlowToTerms(result);
    act(() => {
      result.current.methods.setValue("email", "after@example.com");
    });
    await waitFor(() =>
      expect(result.current.emailVerificationProof).toBeNull(),
    );
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() => expect(result.current.step).toBe("account"));
    expect(signupRequestCount).toBe(0);
  });

  it("이메일 가입을 취소하면 선택한 이미지를 초기화한다", async () => {
    const { result } = renderHook(() => useEmailSignupFlow(), {
      wrapper: createWrapper("/signup"),
    });
    act(() =>
      result.current.setProfileImageFile(
        new File(["image"], "profile.png", { type: "image/png" }),
      ),
    );
    act(() => result.current.confirmExit());

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/login"),
    );
    expect(result.current.profileImageFile).toBeNull();
  });

  it("카카오 가입 후 이미지를 업로드하고 기존 returnPath로 이동한다", async () => {
    useKakaoSignupStore.getState().setKakaoSignupSession({
      signupToken: "kakao-signup-token",
      initialNickname: null,
    });
    server.use(
      http.post("*/api/v1/auth/kakao/signup", () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              accessToken: "kakao-signup-access-token",
              tokenType: "Bearer",
            },
            error: null,
          },
          { status: 201 },
        ),
      ),
    );
    const { result } = renderHook(
      () =>
        useKakaoSignupFlow({
          signupToken: "kakao-signup-token",
          initialNickname: null,
          returnPath: "/teams/7",
        }),
      { wrapper: createWrapper("/signup/kakao") },
    );
    const image = new File(["image"], "profile.jpg", { type: "image/jpeg" });

    await moveKakaoFlowToProfile(result);
    act(() => result.current.setProfileImageFile(image));
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/teams/7"),
    );
    expect(uploadProfileImageMock).toHaveBeenCalledWith(image);
    expect(useAuthStore.getState().accessToken).toBe(
      "kakao-signup-access-token",
    );
    expect(useKakaoSignupStore.getState().signupToken).toBeNull();
  });

  it("카카오 가입 후 이미지 업로드가 실패해도 인증과 returnPath를 유지한다", async () => {
    useKakaoSignupStore.getState().setKakaoSignupSession({
      signupToken: "kakao-signup-token",
      initialNickname: null,
    });
    server.use(
      http.post("*/api/v1/auth/kakao/signup", () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              accessToken: "kakao-upload-failed-token",
              tokenType: "Bearer",
            },
            error: null,
          },
          { status: 201 },
        ),
      ),
    );
    uploadProfileImageMock.mockRejectedValueOnce(new Error("upload failed"));
    const { result } = renderHook(
      () =>
        useKakaoSignupFlow({
          signupToken: "kakao-signup-token",
          initialNickname: null,
          returnPath: "/my",
        }),
      { wrapper: createWrapper("/signup/kakao") },
    );

    await moveKakaoFlowToProfile(result);
    act(() =>
      result.current.setProfileImageFile(
        new File(["image"], "profile.png", { type: "image/png" }),
      ),
    );
    await submitStep(result.current.handleFormSubmit);
    await waitFor(() => expect(result.current.step).toBe("terms"));
    await submitStep(result.current.handleFormSubmit);

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/my"),
    );
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "kakao-upload-failed-token",
      isAuthenticated: true,
    });
  });
});
