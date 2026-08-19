import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import {
  isVolunteerPostingListSort,
  volunteerPostingListSortOptions,
} from "@/features/volunteer/constants/volunteerPostingList.constants";
import { useRecentVolunteerSearches } from "@/features/volunteer/hooks/useRecentVolunteerSearches";
import { useVolunteerPostingRecommendedKeywordsQuery } from "@/features/volunteer/hooks/useVolunteerPostingRecommendedKeywordsQuery";
import {
  getVolunteerPostingFilter,
  getVolunteerPostingSort,
  toVolunteerPostingQueryParams,
  updateVolunteerPostingSearchParams,
} from "@/features/volunteer/lib/volunteerPostingSearchParams";
import { getPostingListItemPath } from "@/features/volunteer/lib/postingListRouting";
import greenPuzzle from "@/assets/icons/greenPuzzle.svg";
import arrowBackIcon from "@/shared/assets/icons/search/arrow-back.svg";
import searchIcon from "@/assets/icons/Search.svg";
import { cn } from "@/shared/lib/cn";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select from "@/shared/ui/Select";

import { VolunteerPostingResults } from "./VolunteerPostingResults";

const SEARCH_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]+$/;

function getSearchError(value: string) {
  const keyword = value.trim();
  if (!keyword) return "검색어를 입력해 주세요.";
  if (keyword.length > 10) return "검색어는 최대 10자까지 입력할 수 있어요.";
  if (!SEARCH_PATTERN.test(keyword))
    return "한글, 영문, 숫자, 공백만 사용할 수 있어요.";
  return undefined;
}

type VolunteerPostingSearchFormProps = {
  initialKeyword: string;
  onSubmit: (keyword: string) => void;
  onActivate?: () => void;
  variant?: "initial" | "header";
};

function VolunteerPostingSearchForm({
  initialKeyword,
  onSubmit,
  onActivate,
  variant = "header",
}: VolunteerPostingSearchFormProps) {
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
        <label htmlFor="volunteer-keyword" className="sr-only">
          봉사 공고 검색어
        </label>
        <Input
          id="volunteer-keyword"
          value={error ? "" : keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder={
            error ??
            (variant === "initial"
              ? "검색어를 입력해주세요"
              : "공고 제목 또는 모집기관명")
          }
          className={cn(
            variant === "initial"
              ? "border-0 bg-transparent px-0 focus:border-0"
              : "border-0 bg-transparent pl-3 pr-0 text-xl font-semibold tracking-[-0.5px] focus:border-0",
            error && "placeholder:text-point-red",
          )}
          aria-describedby={error ? "volunteer-search-error" : undefined}
          aria-invalid={Boolean(error)}
          autoFocus={!initialKeyword}
        />
        <IconButton
          label="검색"
          icon={<img src={searchIcon} alt="" />}
          size={variant === "initial" ? "medium" : "small"}
          className="[&>span>img]:size-[27px]"
          type="submit"
        />
        {error ? (
          <p id="volunteer-search-error" className="sr-only">
            {error}
          </p>
        ) : null}
      </form>
    </>
  );
}

export function VolunteerPostingSearchScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword")?.trim() ?? "";
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentVolunteerSearches();
  const recommendedKeywordsQuery =
    useVolunteerPostingRecommendedKeywordsQuery();
  const recommendedKeywords = recommendedKeywordsQuery.data ?? [];
  const sort = getVolunteerPostingSort(searchParams);
  const queryParams = useMemo(
    () => toVolunteerPostingQueryParams(searchParams, sort),
    [searchParams, sort],
  );

  const submitSearch = (normalized: string) => {
    addRecentSearch(normalized);
    setSearchParams(
      updateVolunteerPostingSearchParams(
        searchParams,
        getVolunteerPostingFilter(searchParams),
        { keyword: normalized, sort: "latest" },
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
            <VolunteerPostingSearchForm
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
                options={volunteerPostingListSortOptions}
                onChange={(value) => {
                  if (!isVolunteerPostingListSort(value)) return;
                  setSearchParams(
                    updateVolunteerPostingSearchParams(
                      searchParams,
                      getVolunteerPostingFilter(searchParams),
                      { keyword: keywordFromUrl, sort: value },
                    ),
                    { replace: true },
                  );
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
              />
            </div>
            <div className="-mt-px flex flex-1 flex-col">
              <VolunteerPostingResults
                params={queryParams}
                emptyTitle="검색 결과가 없어요"
                emptyDescription="다른 검색어로 다시 찾아보세요."
                onSelect={(posting) =>
                  navigate(getPostingListItemPath(posting))
                }
              />
            </div>
          </section>
        </>
      ) : (
        <>
          <PageHeader title="봉사 찾기" onBack={() => navigate(-1)} />
          <section className="mt-10">
            <h2 className="text-title-24 text-text">
              <span className="block">어떤 봉사를</span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                찾고 계시나요?
                <img src={greenPuzzle} alt="" className="size-6 shrink-0" />
              </span>
            </h2>
            <VolunteerPostingSearchForm
              key={keywordFromUrl}
              initialKeyword={keywordFromUrl}
              onSubmit={submitSearch}
              variant="initial"
            />
            <div className="mt-9">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-medium leading-7 text-text">
                  최근 검색어
                </h3>
                {recentSearches.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-1 text-sm text-text transition-colors hover:bg-text/5 active:bg-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={clearRecentSearches}
                  >
                    <Trash2
                      aria-hidden="true"
                      className="size-[18px] text-icon"
                    />
                    지우기
                  </button>
                ) : null}
              </div>
              {recentSearches.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-3">
                  {recentSearches.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      className="h-11 rounded-full border border-text-gray-300 px-3 text-[15px] font-medium text-text-gray-300 transition-colors hover:border-text-gray-400 hover:bg-text-gray-400 hover:text-text2 active:border-text-gray-400 active:bg-text-gray-400 active:text-text2 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
              <div className="mt-9">
                <h3 className="text-[18px] font-medium leading-7 text-text">
                  인기 검색어
                </h3>
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-3">
                  {recommendedKeywords.map((recommendation) => (
                    <button
                      key={recommendation}
                      type="button"
                      className="h-11 rounded-full border border-button px-3 text-[15px] font-medium text-button transition-colors hover:bg-[#F0F6F0] hover:text-button active:bg-[#F0F6F0] active:text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
