import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";

import {
  isTeamListSort,
  teamListSortOptions,
} from "../constants/teamList.constants";
import { teamListMock } from "../mocks/teamList.mock";
import type { TeamListSort } from "../types/teamList.types";
import { TeamCard } from "./TeamCard";

export function TeamListScreen() {
  const navigate = useNavigate();
  const [sortType, setSortType] = useState<TeamListSort>("latest");

  const sortedTeams = useMemo(() => {
    const copiedTeams = [...teamListMock];

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
    }
  }, [sortType]);

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        title="같이 갈 사람 찾는 중 🙌"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="ml-3 flex shrink-0 items-center gap-4">
            <IconButton
              disabled
              label="필터 열기"
              icon={<img src={filterIcon} alt="" />}
              size="medium"
              className="-m-3 disabled:opacity-100"
            />
            <IconButton
              label="모임 검색"
              icon={<img src={searchIcon} alt="" />}
              size="medium"
              className="-m-3"
              onClick={() => navigate("/teams/search")}
            />
          </div>
        }
      />

      <div className="mt-6 flex items-center justify-between pb-3">
        <p className="text-xs text-gray-700">
          전체 {teamListMock.length}개 활동
        </p>
        <Select
          ariaLabel="모임 정렬"
          value={sortType}
          onChange={(value) => {
            if (isTeamListSort(value)) {
              setSortType(value);
            }
          }}
          options={teamListSortOptions}
        />
      </div>

      <div>
        <ul className="flex flex-col gap-3">
          {sortedTeams.map((team) => (
            <li key={team.id}>
              <TeamCard
                team={team}
                onClick={() => navigate(`/teams/${team.id}`)}
              />
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
