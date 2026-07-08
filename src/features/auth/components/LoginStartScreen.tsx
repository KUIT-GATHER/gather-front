import { useNavigate } from "react-router";

import { AuthLogo } from "@/features/auth/components/AuthLogo";
import Button from "@/shared/ui/Button";

export function LoginStartScreen() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col items-center bg-bg px-8">
      <AuthLogo className="mt-[278px]" />

      <div className="mt-[58px] flex w-full flex-col gap-2.5">
        <Button
          fullWidth
          type="button"
          className="h-[54px] bg-[#FEE84D] text-[16px] font-semibold text-text hover:brightness-95"
          onClick={() => {
            // TODO: 카카오 로그인 연동 시 구현
          }}
        >
          카카오로 시작하기
        </Button>

        <Button
          fullWidth
          type="button"
          className="h-[54px] border border-button bg-[#EAF8EF] text-[16px] font-semibold text-text-gray-300 hover:bg-[#DFF4E7]"
          onClick={() => navigate("/login/email")}
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
    </main>
  );
}