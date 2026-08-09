import gatherLogo from "@/assets/images/Gather-logo.png";
import PageContainer from "@/shared/ui/PageContainer";

export function Splash() {
  return (
    <main>
      <PageContainer
        size="narrow"
        className="flex min-h-dvh flex-col items-center justify-center overflow-hidden px-0"
      >
        <section className="flex h-[127.89px] w-full shrink-0 items-center justify-center">
          <img
            src={gatherLogo}
            alt="Gather 로고"
            className="h-auto w-57.5 max-w-[64%]"
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
