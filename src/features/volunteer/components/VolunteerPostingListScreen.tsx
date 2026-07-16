import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";

import {
  isVolunteerPostingListSort,
  volunteerPostingListSortOptions,
} from "../constants/volunteerPostingList.constants";
import { volunteerPostingListMock } from "../mocks/volunteerPostingList.mock";
import type { VolunteerPostingListSort } from "../types/volunteerPostingList.types";
import { VolunteerPostingCard } from "./VolunteerPostingCard";

export function VolunteerPostingListScreen() {
  const navigate = useNavigate();
  const [sortType, setSortType] = useState<VolunteerPostingListSort>("latest");

  const sortedPostings = useMemo(() => {
    const copiedPostings = [...volunteerPostingListMock];

    switch (sortType) {
      case "latest":
        return copiedPostings.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "popular":
        return copiedPostings.sort((a, b) => b.popularity - a.popularity);
      case "deadline":
        return copiedPostings.sort((a, b) => {
          const aDeadline = a.deadlineAt
            ? new Date(a.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;
          const bDeadline = b.deadlineAt
            ? new Date(b.deadlineAt).getTime()
            : Number.POSITIVE_INFINITY;

          return aDeadline - bDeadline;
        });
      case "default":
        return copiedPostings;
    }
  }, [sortType]);

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        sticky
        title="이번주, 내 주변에선 뭐하지?"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="ml-4 flex shrink-0 items-center gap-4">
            <IconButton
              disabled
              label="필터 열기"
              icon={<img src={filterIcon} alt="" />}
              size="medium"
              className="-m-3 disabled:opacity-100"
            />
            <IconButton
              label="봉사 공고 검색"
              icon={<img src={searchIcon} alt="" />}
              size="medium"
              className="-m-3"
              onClick={() => navigate("/volunteers/search")}
            />
          </div>
        }
      />

      <div className="mt-7 flex items-center justify-between pb-4">
        <p className="text-sm text-gray-700">
          전체 {volunteerPostingListMock.length}개 활동
        </p>
        <Select
          ariaLabel="봉사 공고 정렬"
          value={sortType}
          onChange={(value) => {
            if (isVolunteerPostingListSort(value)) {
              setSortType(value);
            }
          }}
          options={volunteerPostingListSortOptions}
        />
      </div>

      <div>
        <ul className="flex flex-col gap-3">
          {sortedPostings.map((posting) => (
            <li key={posting.id}>
              <VolunteerPostingCard
                posting={posting}
                onClick={() => navigate(`/volunteers/${posting.id}`)}
              />
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
