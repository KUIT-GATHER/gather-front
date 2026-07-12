import PageContainer from "@/shared/ui/PageContainer";
import alarmIcon from "@/assets/icons/Alarm.svg";
import filterIcon from "@/assets/icons/Filter.svg";
import arrowIcon from "@/assets/icons/Arrow.svg";

import { useNavigate } from "react-router";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <PageContainer size="narrow">
      <header className="flex items-center justify-between pb-10 pt-8">
        <h1 className="text-[34px] font-bold tracking-tight text-[#316B43]">
          Gather
        </h1>

        <div className="flex items-center gap-4">
          <button type="button" aria-label="필터 열기">
            <img
              src={filterIcon}
              alt=""
              aria-hidden="true"
              className="size-6"
            />
          </button>

          <button type="button" aria-label="알림 확인" className="relative">
            <img src={alarmIcon} alt="" aria-hidden="true" className="size-6" />

            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
              2
            </span>
          </button>
        </div>
      </header>

      <main>
        {/* 봉사 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              이번 주, 내 주변에선 뭐하지? 👀
            </h2>

            <button
              type="button"
              aria-label="봉사 공고 전체 보기"
              onClick={() => navigate("/volunteers")}
            >
              <img
                src={arrowIcon}
                alt=""
                aria-hidden="true"
                className="size-8"
              />
            </button>
          </div>

          <div className="-mr-5.5 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-40 shrink-0">
              <div className="h-40 rounded-xl bg-gray-200" />

              <h3 className="mt-2 truncate text-[15px] font-bold">
                한강공원 플로깅 🌿
              </h3>

              <p className="mt-1 text-sm text-gray-500">여의도 · 05.16 (토)</p>

              <p className="mt-1 text-sm text-red-500">D-4</p>
            </div>

            <div className="w-40 shrink-0">
              <div className="h-40 rounded-xl bg-gray-200" />

              <h3 className="mt-2 truncate text-[15px] font-bold">
                동화책 같이 읽어요 📖
              </h3>

              <p className="mt-1 text-sm text-gray-500">강남구 · 05.20 (수)</p>

              <p className="mt-1 text-sm text-red-500">D-8</p>
            </div>

            <div className="w-40 shrink-0">
              <div className="h-40 rounded-xl bg-gray-200" />
            </div>
          </div>
        </section>

        <div className="-mx-5.5 my-7 h-2 bg-gray-100" />

        {/* 모임 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">같이 갈 사람 찾는 중 🙌</h2>

            <button
              type="button"
              aria-label="모임 공고 전체 보기"
              onClick={() => navigate("/teams")}
            >
              <img
                src={arrowIcon}
                alt=""
                aria-hidden="true"
                className="size-8"
              />
            </button>
          </div>

          <div className="-mr-5.5 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pr-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <article className="w-52 shrink-0 overflow-hidden rounded-xl border border-gray-200">
              <div className="h-52 bg-gray-200" />

              <div className="p-3">
                <h3 className="truncate text-[15px] font-bold">
                  주말 한강공원 산책 플로깅
                </h3>

                <p className="mt-1 truncate text-sm text-gray-500">
                  같이 한강 걸으면서 플로깅해요
                </p>

                <p className="mt-2 truncate text-xs text-gray-400">
                  광진구 · 4/5명 · 26.05.15
                </p>
              </div>
            </article>

            <article className="w-52 shrink-0 overflow-hidden rounded-xl border border-gray-200">
              <div className="h-52 bg-gray-200" />

              <div className="p-3">
                <h3 className="truncate text-[15px] font-bold">
                  남양주 유기견 보호소
                </h3>

                <p className="mt-1 truncate text-sm text-gray-500">
                  강아지들이랑 산책 가요
                </p>

                <p className="mt-2 truncate text-xs text-gray-400">
                  마포구 · 4/5명 · 26.05.25
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageContainer>
  );
}
