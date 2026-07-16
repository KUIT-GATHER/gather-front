import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import filterIcon from "@/assets/icons/Filter.svg";
import searchIcon from "@/assets/icons/Search.svg";
import { VolunteerPostingFilterSheet } from "@/features/volunteer/components/filter/VolunteerPostingFilterSheet";
import {
  volunteerPostingListSortOptions,
  isVolunteerPostingListSort,
} from "@/features/volunteer/constants/volunteerPostingList.constants";
import {
  getVolunteerPostingFilter,
  getVolunteerPostingSort,
  toVolunteerPostingQueryParams,
  updateVolunteerPostingSearchParams,
} from "@/features/volunteer/lib/volunteerPostingSearchParams";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";

import { VolunteerPostingResults } from "./VolunteerPostingResults";

export function VolunteerPostingListScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sort = getVolunteerPostingSort(searchParams);
  const filter = useMemo(
    () => getVolunteerPostingFilter(searchParams),
    [searchParams],
  );
  const queryParams = useMemo(
    () => toVolunteerPostingQueryParams(searchParams, sort),
    [searchParams, sort],
  );

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        sticky
        title="봉사 공고"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="flex items-center gap-1">
            <IconButton
              label="필터 열기"
              icon={<img src={filterIcon} alt="" />}
              onClick={() => setIsFilterOpen(true)}
            />
            <IconButton
              label="봉사 공고 검색"
              icon={<img src={searchIcon} alt="" />}
              onClick={() => navigate("/volunteers/search")}
            />
          </div>
        }
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-body-15-semibold text-text">
          이번 주, 내 주변에선 뭐하지? 👀
        </h2>
        <Select
          ariaLabel="봉사 공고 정렬"
          value={sort}
          onChange={(value) => {
            if (!isVolunteerPostingListSort(value)) return;
            setSearchParams(
              updateVolunteerPostingSearchParams(searchParams, filter, {
                sort: value,
              }),
            );
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
          options={volunteerPostingListSortOptions}
        />
      </div>
      <div className="mt-3">
        <VolunteerPostingResults
          params={queryParams}
          emptyTitle="조건에 맞는 봉사 공고가 없어요"
          emptyDescription="검색어나 필터 조건을 바꿔 다시 확인해 주세요."
          onSelect={(postingId) => navigate(`/volunteers/${postingId}`)}
        />
      </div>

      {isFilterOpen ? (
        <VolunteerPostingFilterSheet
          open
          onOpenChange={setIsFilterOpen}
          filter={filter}
          onApply={(nextFilter) => {
            setSearchParams(
              updateVolunteerPostingSearchParams(searchParams, nextFilter),
            );
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        />
      ) : null}
    </PageContainer>
  );
}
