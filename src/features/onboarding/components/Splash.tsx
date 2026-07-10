import SplashLeftIcon from "@/assets/icons/SplashLeftIcon.svg";
import SplashRightIcon from "@/assets/icons/SplashRightIcon.svg";
import PageContainer from "@/shared/ui/PageContainer";

export function Splash() {
  return (
    <main>
      <PageContainer size="narrow" className="flex min-h-dvh flex-col items-center overflow-hidden px-0">
        <section className="relative mt-65.25 h-[127.89px] w-full shrink-0">
          <img
            src={SplashLeftIcon}
            alt="스플래시좌측아이콘"
            className="absolute left-23.5 top-0 z-20 h-auto w-[32.34%] max-w-32.5"
          />
          <img
            src={SplashRightIcon}
            alt="스플래시우측아이콘"
            className="absolute top-[21.89px] right-23.25 z-10 h-auto w-[26.62%] max-w-26.75"
          />
        </section>

        <h1 className="mt-[5.18px] font-mimi text-[54px] font-normal not-italic leading-[normal] tracking-[-1.62px]">
          Gather
        </h1>
        <p className="pt-1.5 text-title-18 font-normal text-text-gray-100">
          함께하는 봉사의 시작
        </p>
      </PageContainer>
    </main>
  );
}
