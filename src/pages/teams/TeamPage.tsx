import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

import SortDropdown, { type SortType } from "@/shared/ui/SortDropdown";

import backIcon from "@/assets/icons/Arrow.svg";
import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import PageContainer from "@/shared/ui/PageContainer";

type TeamCategory = "문화" | "복지" | "교육" | "환경";

interface Team {
  id: number;
  title: string;
  description: string;
  location: string;
  currentMembers: number;
  maxMembers: number;
  date: string;
  deadline?: string;
  categories: TeamCategory[];
  imageUrl: string;

  createdAt: string;
  deadlineAt?: string;
  popularity: number;
}

const categoryStyle: Record<TeamCategory, string> = {
  문화: "border-[#F2D28D] bg-[#FFF9EA] text-[#B98926]",
  복지: "border-[#E4A6E7] bg-[#FFF2FF] text-[#B05AB6]",
  교육: "border-[#AABAF4] bg-[#F3F5FF] text-[#687BC5]",
  환경: "border-[#8FD8CF] bg-[#EFFFFC] text-[#4A9E94]",
};

const teams: Team[] = [
  {
    id: 1,
    title: "주말 한강공원 산책 플로깅",
    description: "같이 한강 걸으면서 즐겁해요",
    location: "광진구",
    currentMembers: 4,
    maxMembers: 5,
    date: "26.05.15",
    deadline: "D-3",
    categories: ["문화"],
    imageUrl: "/images/team-1.jpg",
    createdAt: "2026-05-12T10:00:00",
    deadlineAt: "2026-05-19T23:59:59",
    popularity: 100,
  },
  {
    id: 2,
    title: "남양주 유기견 보호소",
    description: "강아지들이랑 산책 가요 🐾",
    location: "마포구",
    currentMembers: 4,
    maxMembers: 5,
    date: "26.05.25",
    categories: ["문화"],
    imageUrl: "/images/team-2.jpg",
    createdAt: "2026-05-13T10:00:00",
    deadlineAt: "2026-05-17T23:59:59",
    popularity: 80,
  },
  {
    id: 3,
    title: "아트팀",
    description: "우리 같이 그림 그릴래요?",
    location: "마포구",
    currentMembers: 4,
    maxMembers: 5,
    date: "26.05.15",
    deadline: "D-5",
    categories: ["문화"],
    imageUrl: "/images/team-3.jpg",
    createdAt: "2026-05-11T10:00:00",
    deadlineAt: "2026-05-18T23:59:59",
    popularity: 107,
  },
  {
    id: 4,
    title: "동네한바퀴 봉사단",
    description: "어르신들의 말벗이 되어드려요.",
    location: "노원구",
    currentMembers: 2,
    maxMembers: 4,
    date: "26.06.05",
    categories: ["복지", "문화", "교육"],
    imageUrl: "/images/team-4.jpg",
    createdAt: "2026-05-14T10:00:00",
    deadlineAt: "2026-05-16T23:59:59",
    popularity: 119,
  },
  {
    id: 5,
    title: "그린서울🌿",
    description: "도심 속 초록초록 만들어요 🍀",
    location: "서초구",
    currentMembers: 2,
    maxMembers: 7,
    date: "26.06.01",
    categories: ["환경"],
    imageUrl: "/images/team-5.jpg",
    createdAt: "2026-05-17T10:00:00",
    deadlineAt: "2026-05-20T23:59:59",
    popularity: 77,
  },
  {
    id: 6,
    title: "벽화그리기팀",
    description: "벽에 작은 추억 남겨요 🖌️",
    location: "광진구",
    currentMembers: 5,
    maxMembers: 6,
    date: "26.05.24",
    categories: ["문화", "교육"],
    imageUrl: "/images/team-6.jpg",
    createdAt: "2026-05-19T10:00:00",
    deadlineAt: "2026-05-23T23:59:59",
    popularity: 110,
  },
  {
    id: 7,
    title: "글로벌 영어 멘토링",
    description: "아이들에게 영어를 가르쳐 주세요😃",
    location: "송파구",
    currentMembers: 4,
    maxMembers: 5,
    date: "26.05.14",
    categories: ["교육"],
    imageUrl: "/images/team-7.jpg",
    createdAt: "2026-05-14T10:00:00",
    deadlineAt: "2026-05-20T23:59:59",
    popularity: 88,
  },
];

export function TeamPage() {
  const navigate = useNavigate();
  const [sortType, setSortType] = useState<SortType>("latest");

  const sortedTeams = useMemo(() => {
    const copiedTeams = [...teams];

    switch (sortType) {
      case "latest":
        return copiedTeams.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      case "popular":
        return copiedTeams.sort((a, b) => b.popularity - a.popularity);

      case "deadline":
        return copiedTeams.sort((a, b) => {
          const aDeadline = a.deadlineAt
            ? new Date(a.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;

          const bDeadline = b.deadlineAt
            ? new Date(b.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;

          return aDeadline - bDeadline;
        });

      case "default":
        return copiedTeams;

      default:
        return copiedTeams;
    }
  }, [sortType]);

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <header className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="이전 화면으로 이동"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <img
                src={backIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>

            <h1 className="truncate text-lg font-bold">
              같이 갈 사람 찾는 중 🙌
            </h1>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-4">
            <button type="button" aria-label="필터 열기">
              <img
                src={filterIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>

            <button type="button" aria-label="모임 검색">
              <img
                src={searchIcon}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pb-3">
          <p className="text-xs text-gray-700">전체 {teams.length}개 활동</p>

          <SortDropdown value={sortType} onChange={setSortType} />
        </div>
      </header>

      <main>
        <ul className="flex flex-col gap-3">
          {sortedTeams.map((team) => (
            <li key={team.id}>
              <button
                type="button"
                onClick={() => navigate(`/teams/${team.id}`)}
                className="flex w-full gap-3 rounded-xl border border-gray-200 p-3 text-left"
              >
                <img
                  src={team.imageUrl}
                  alt={team.title}
                  className="h-[100px] w-[76px] shrink-0 rounded-lg object-cover"
                  draggable={false}
                />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold">{team.title}</h2>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {team.description}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {team.location} · {team.currentMembers}/{team.maxMembers}명
                    {" · "}
                    {team.date}
                    {team.deadline && (
                      <span className="font-medium text-red-500">
                        {" "}
                        · {team.deadline}
                      </span>
                    )}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {team.categories.map((category) => (
                      <span
                        key={category}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${categoryStyle[category]}`}
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
