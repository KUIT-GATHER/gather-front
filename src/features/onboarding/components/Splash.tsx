import SplashLeftIcon from "@/assets/icons/SplashLeftIcon.svg";
import SplashRightIcon from "@/assets/icons/SplashRightIcon.svg";

export function Splash() {
  return (
    <main className="flex min-h-dvh flex-col items-center overflow-hidden">
      <section className="relative mt-[261px] h-[127.89px] w-full shrink-0">
        <img
          src={SplashLeftIcon}
          alt="스플래시좌측아이콘"
          className="absolute left-[94px] top-0 z-20 h-auto w-[32.34%] max-w-[130px]"
        />
        <img
          src={SplashRightIcon}
          alt="스플래시우측아이콘"
          className="absolute top-[21.89px] right-[93px] z-10 h-auto w-[26.62%] max-w-[107px]"
        />
      </section>

      <h1 className="mt-[5.18px] font-mimi text-[54px] font-normal not-italic leading-[normal] tracking-[-1.62px]">
        Gather
      </h1>
      <p className="pt-[6px] text-title-18 font-normal text-text-gray-100">
        함께하는 봉사의 시작
      </p>
    </main>
  );
}