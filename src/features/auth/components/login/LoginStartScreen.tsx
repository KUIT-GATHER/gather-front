import { useLocation, useNavigate } from "react-router";

import EmailIcon from "@/assets/icons/Email.svg";
import KakaoIcon from "@/assets/icons/Kakao.svg";
import { AuthLogo } from "@/features/auth/components/login/AuthLogo";
import Button from "@/shared/ui/Button";
import PageContainer from "@/shared/ui/PageContainer";

export function LoginStartScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PageContainer
      size="narrow"
      className="flex min-h-dvh flex-col items-center overflow-y-auto px-8 pt-[calc(env(safe-area-inset-top)+clamp(3rem,12dvh,6.5rem))] pb-[calc(env(safe-area-inset-bottom)+2rem)]"
    >
      <div className="my-auto flex w-full flex-col items-center">
        <AuthLogo />

        <div className="mt-[clamp(2rem,6.5dvh,3.625rem)] flex w-full flex-col gap-2.5">
          <Button
            fullWidth
            type="button"
            className="h-13.5 gap-0.5 bg-[#FEE84D] text-base font-semibold text-text hover:brightness-95"
            leftIcon={<img src={KakaoIcon} alt="" aria-hidden="true" />}
            onClick={() => {
              // TODO: 카카오 로그인 연동 시 구현
            }}
          >
            카카오로 시작하기
          </Button>

          <Button
            fullWidth
            type="button"
            className="h-13.5 gap-0.5 border border-button bg-[#EAF8EF] text-base font-semibold text-text-gray-300 hover:bg-[#DFF4E7]"
            leftIcon={<img src={EmailIcon} alt="" aria-hidden="true" />}
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
            className="mt-4 self-center text-[13px] font-medium text-text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
