import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import greenPuzzle from "@/assets/icons/greenPuzzle.svg";

import {
  isTeamListSort,
  teamListSortOptions,
} from "@/features/team/constants/teamList.constants";

import { useRecentTeamSearches } from "@/features/team/hooks/useRecentTeamSearches";
import { useMeetingRecommendedKeywordsQuery } from "@/features/team/hooks/useMeetingRecommendedKeywordsQuery";
import {
  getTeamListFilter,
  getTeamListSort,
  toTeamListQueryParams,
  updateTeamListSearchParams,
} from "@/features/team/lib/teamListSearchParams";
import arrowBackIcon from "@/shared/assets/icons/search/arrow-back.svg";
import searchIcon from "@/shared/assets/icons/search/search.svg";
import { cn } from "@/shared/lib/cn";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";

import { TeamSearchResults } from "./TeamSearchResults";

const SEARCH_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]+$/;

function getSearchError(value: string) {
  const keyword = value.trim();
  if (!keyword) return "검색어를 입력해 주세요.";
  if (keyword.length > 10)
    return "검색어는 공백 포함 최대 10자까지 입력할 수 있어요.";
  if (!SEARCH_PATTERN.test(keyword))
    return "한글, 영문, 숫자, 공백만 사용할 수 있어요.";
  return undefined;
}

type TeamSearchFormProps = {
  initialKeyword: string;
  onSubmit: (keyword: string) => void;
  onActivate?: () => void;
  variant?: "initial" | "header";
};

function TeamSearchForm({
  initialKeyword,
  onSubmit,
  onActivate,
  variant = "header",
}: TeamSearchFormProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [error, setError] = useState<string>();

  const submit = () => {
    const nextError = getSearchError(keyword);
    if (nextError) {
      setError(nextError);
      return;
    }

    onSubmit(keyword.trim());
  };

  return (
    <>
      <form
        className={
          variant === "initial"
            ? "mt-8 flex items-center gap-2 border-b-2 border-text"
            : "flex h-11 min-w-0 max-w-[323px] flex-1 items-center gap-2 rounded-full bg-[#e8e8e8] px-3"
        }
        onFocus={onActivate}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor="team-keyword" className="sr-only">
          모임 검색어
        </label>
        <Input
          id="team-keyword"
          value={error ? "" : keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder={
            error ??
            (variant === "initial"
              ? "검색어를 입력해주세요"
              : "모임 이름 또는 설명")
          }
          className={cn(
            variant === "initial"
              ? "border-0 bg-transparent px-0 focus:border-0"
              : "border-0 bg-transparent pl-3 pr-0 text-xl font-semibold tracking-[-0.5px] focus:border-0",
            error && "placeholder:text-point-red",
          )}
          aria-describedby={error ? "team-search-error" : undefined}
          aria-invalid={Boolean(error)}
          autoFocus={!initialKeyword}
        />
        <IconButton
          label="검색"
          icon={
            <span className="flex size-11 items-center justify-center">
              <img src={searchIcon} alt="" className="size-11" />
            </span>
          }
          size={variant === "initial" ? "medium" : "small"}
          type="submit"
        />
        {error ? (
          <p id="team-search-error" className="sr-only">
            {error}
          </p>
        ) : null}
      </form>
    </>
  );
}

export function TeamSearchScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword")?.trim() ?? "";
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentTeamSearches();
  const recommendedKeywordsQuery = useMeetingRecommendedKeywordsQuery();
  const recommendedKeywords = recommendedKeywordsQuery.data ?? [];
  const sort = getTeamListSort(searchParams);
  const queryParams = useMemo(
    () => toTeamListQueryParams(searchParams),
    [searchParams],
  );

  const submitSearch = (keyword: string) => {
    addRecentSearch(keyword);
    setSearchParams(
      updateTeamListSearchParams(
        searchParams,
        getTeamListFilter(searchParams),
        { keyword, sort: "latest" },
      ),
    );
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <PageContainer size="narrow" className="flex min-h-dvh flex-col pb-8">
      {keywordFromUrl ? (
        <>
          <header className="-ml-4 flex h-[70px] items-center gap-[7px] pt-[env(safe-area-inset-top)]">
            <IconButton
              label="뒤로가기"
              icon={
                <span className="flex size-9 items-center justify-center">
                  <img src={arrowBackIcon} alt="" className="size-9" />
                </span>
              }
              variant="plain"
              onClick={() => navigate(-1)}
            />
            <TeamSearchForm
              key={keywordFromUrl}
              initialKeyword={keywordFromUrl}
              onSubmit={submitSearch}
              onActivate={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("keyword");
                setSearchParams(next);
              }}
              variant="header"
            />
          </header>
          <section className="mt-0.5 flex flex-1 flex-col">
            <div className="flex h-11 items-center justify-between">
              <h2 className="text-body-14 text-text">검색결과</h2>
              <Select
                ariaLabel="검색 결과 정렬"
                value={sort}
                options={teamListSortOptions}
                contentClassName="w-[206px]"
                onChange={(value) => {
                  if (!isTeamListSort(value)) return;
                  setSearchParams(
                    updateTeamListSearchParams(
                      searchParams,
                      getTeamListFilter(searchParams),
                      { sort: value },
                    ),
                    { replace: true },
                  );
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
              />
            </div>
            <div className="-mt-px flex flex-1 flex-col">
              <TeamSearchResults
                params={queryParams}
                onSelect={(meetingId) => navigate(`/teams/${meetingId}`)}
              />
            </div>
          </section>
        </>
      ) : (
        <>
          <PageHeader title="모임 찾기" onBack={() => navigate(-1)} />
          <section className="mt-10">
            <h2 className="flex items-end gap-2 whitespace-pre-line text-title-24 text-text">
              <span>{"어떤 모임을\n찾고 계시나요?"}</span>
              <img src={greenPuzzle} alt="" className="mb-1 size-6" />
            </h2>
            <TeamSearchForm
              key={keywordFromUrl}
              initialKeyword=""
              onSubmit={submitSearch}
              variant="initial"
            />
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-medium leading-7 text-text">
                  최근 검색어
                </h3>
                {recentSearches.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={clearRecentSearches}
                  >
                    <Trash2 className="size-6 text-icon" aria-hidden="true" />
                    지우기
                  </button>
                ) : null}
              </div>
              {recentSearches.length > 0 ? (
                <div className="mt-2 flex max-h-[100px] flex-wrap gap-2 overflow-hidden">
                  {recentSearches.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      className="h-11 rounded-full border border-text-gray-300 px-3 text-[15px] font-medium text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                      onClick={() => submitSearch(recent)}
                    >
                      # {recent}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-text-gray-300">
                  최근 검색어가 없어요.
                </p>
              )}
            </div>
            {recommendedKeywords.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-[18px] font-medium leading-7 text-text">
                  인기 검색어
                </h3>
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-3">
                  {recommendedKeywords.map((recommendation) => (
                    <button
                      key={recommendation}
                      type="button"
                      className="h-11 rounded-full border border-button px-3 text-[15px] font-medium text-button first:bg-[#F0F6F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                      onClick={() => submitSearch(recommendation)}
                    >
                      # {recommendation}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </>
      )}
    </PageContainer>
  );
}
