import { useLocation, useNavigate } from "react-router";

import { AuthLogo } from "@/features/auth/components/AuthLogo";
import Button from "@/shared/ui/Button";
import PageContainer from "@/shared/ui/PageContainer";

export function LoginStartScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PageContainer size="narrow" className="flex min-h-dvh flex-col items-center px-8">
      <AuthLogo className="mt-69.5" />

      <div className="mt-14.5 flex w-full flex-col gap-2.5">
        <Button
          fullWidth
          type="button"
          className="h-13.5 bg-[#FEE84D] text-base font-semibold text-text hover:brightness-95"
          onClick={() => {
            // TODO: 카카오 로그인 연동 시 구현
          }}
        >
          카카오로 시작하기
        </Button>

        <Button
          fullWidth
          type="button"
          className="h-13.5 border border-button bg-[#EAF8EF] text-base font-semibold text-text-gray-300 hover:bg-[#DFF4E7]"
          onClick={() => {
            navigate("/login/email", {
              state: location.state,
            });
          }}
        >
          이메일로 시작하기
        </Button>

        <button
          type="button"
          className="mt-4 text-[13px] font-medium text-text-gray-100"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </button>
      </div>
    </PageContainer>
  );
}
