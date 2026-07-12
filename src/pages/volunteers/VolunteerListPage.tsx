import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

import SortDropdown, { type SortType } from "@/shared/ui/SortDropdown";

import PageContainer from "@/shared/ui/PageContainer";

import arrowBackIcon from "@/assets/icons/Arrow.svg";
import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";

type VolunteerCategory = "문화" | "복지" | "교육" | "환경";
interface Volunteer {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  deadline?: string;
  categories: VolunteerCategory[];
  imageUrl: string;

  createdAt: string;
  deadlineAt?: string;
  popularity: number;
}

const volunteers: Volunteer[] = [
  {
    id: 1,
    title: "한강공원 플로깅 🌿",
    description: "같이 한강 걸으면서 즐겁게 봉사해요",
    location: "여의도",
    date: "26.05.16",
    deadline: "D-4",
    categories: ["문화"],
    imageUrl: "/images/volunteer-1.jpg",
    createdAt: "2026-05-12T10:00:00",
    deadlineAt: "2026-05-15T23:59:59",
    popularity: 100,
  },
  {
    id: 2,
    title: "동화책 같이 읽어요 📖",
    description: "함께 책을 읽으며 따뜻한 시간 나눠요",
    location: "강남구",
    date: "26.05.20",
    categories: ["문화"],
    imageUrl: "/images/volunteer-2.jpg",
    createdAt: "2026-05-11T10:00:00",
    deadlineAt: "2026-05-17T23:59:59",
    popularity: 120,
  },
  {
    id: 3,
    title: "독거어르신 도시락 배달",
    description: "같이 한강 걸으면서 즐겁게 봉사해요",
    location: "마포구",
    date: "26.05.20",
    categories: ["복지"],
    imageUrl: "/images/volunteer-3.jpg",
    createdAt: "2026-05-13T10:00:00",
    deadlineAt: "2026-05-19T23:59:59",
    popularity: 80,
  },
  {
    id: 4,
    title: "제주 바다 지킴이",
    description: "아름다운 제주 바다를 함께 지켜요!",
    location: "제주",
    date: "26.08.20",
    categories: ["복지"],
    imageUrl: "/images/volunteer-4.jpg",
    createdAt: "2026-05-09T10:00:00",
    deadlineAt: "2026-05-16T23:59:59",
    popularity: 100,
  },
];

const categoryStyle: Record<VolunteerCategory, string> = {
  문화: "border-[#F2D28D] bg-[#FFF9EA] text-[#B98926]",
  복지: "border-[#E4A6E7] bg-[#FFF2FF] text-[#B05AB6]",
  교육: "border-[#9FC4F5] bg-[#F1F7FF] text-[#4D81C4]",
  환경: "border-[#9ED6AE] bg-[#F0FFF4] text-[#4B9660]",
};

export function VolunteerListPage() {
  const navigate = useNavigate();
  const [sortType, setSortType] = useState<SortType>("latest");

  const sortedVolunteers = useMemo(() => {
    const copiedVolunteers = [...volunteers];

    switch (sortType) {
      case "latest":
        return copiedVolunteers.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      case "popular":
        return copiedVolunteers.sort((a, b) => b.popularity - a.popularity);

      case "deadline":
        return copiedVolunteers.sort((a, b) => {
          const aDeadline = a.deadlineAt
            ? new Date(a.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;

          const bDeadline = b.deadlineAt
            ? new Date(b.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;

          return aDeadline - bDeadline;
        });

      case "default":
        return copiedVolunteers;

      default:
        return copiedVolunteers;
    }
  }, [sortType]);

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <header className="sticky top-0 z-10 bg-white pt-7">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="이전 화면으로 이동"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <img
                src={arrowBackIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>

            <h1 className="truncate text-lg font-bold">
              이번주, 내 주변에선 뭐하지?
            </h1>
          </div>

          <div className="ml-4 flex shrink-0 items-center gap-4">
            <button type="button" aria-label="필터 열기">
              <img
                src={filterIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>

            <button type="button" aria-label="봉사 공고 검색">
              <img
                src={searchIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between pb-4">
          <p className="text-sm text-gray-700">
            전체 {volunteers.length}개 활동
          </p>

          <SortDropdown value={sortType} onChange={setSortType} />
        </div>
      </header>

      <main>
        <ul className="flex flex-col gap-3">
          {sortedVolunteers.map((volunteer) => (
            <li key={volunteer.id}>
              <button
                type="button"
                onClick={() => navigate(`/volunteers/${volunteer.id}`)}
                className="flex w-full gap-4 rounded-xl border border-gray-200 p-3 text-left"
              >
                <img
                  src={volunteer.imageUrl}
                  alt={volunteer.title}
                  className="h-[104px] w-[88px] shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1 py-0.5">
                  <h2 className="truncate text-base font-bold">
                    {volunteer.title}
                  </h2>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {volunteer.description}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {volunteer.location} · {volunteer.date}
                    {volunteer.deadline && (
                      <span className="font-medium text-red-500">
                        {" "}
                        · {volunteer.deadline}
                      </span>
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {volunteer.categories.map((category) => (
                      <span
                        key={category}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                          categoryStyle[category]
                        }`}
                      >
                        <span aria-hidden="true">✦</span>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </PageContainer>
  );
}
