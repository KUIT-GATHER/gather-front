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
  getVolunteerPostingSort,
  toVolunteerPostingQueryParams,
  updateVolunteerPostingSearchParams,
} from "@/features/volunteer/lib/volunteerPostingSearchParams";
import { getPostingListItemPath } from "@/features/volunteer/lib/postingListRouting";
import greenPuzzle from "@/assets/icons/greenPuzzle.svg";
import arrowBackIcon from "@/features/volunteer/assets/search/arrow-back.svg";
import searchIcon from "@/features/volunteer/assets/search/search.svg";
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
            ? "mt-10 flex items-center gap-2 border-b-2 border-text"
            : "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#e8e8e8] px-3"
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
          placeholder={error ?? "공고 제목 또는 모집기관명"}
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
          icon={
            <span className="flex size-11 items-center justify-center">
              <img src={searchIcon} alt="" className="size-11" />
            </span>
          }
          size={variant === "initial" ? "medium" : "small"}
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
        new URLSearchParams(),
        {},
        { keyword: normalized, sort: "latest" },
      ),
    );
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      {keywordFromUrl ? (
        <>
          <header className="-ml-4 flex h-[70px] items-center gap-1 pt-[env(safe-area-inset-top)]">
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
              onActivate={() => setSearchParams(new URLSearchParams())}
              variant="header"
            />
          </header>
          <section className="mt-0.5">
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
                      new URLSearchParams(),
                      {},
                      { keyword: keywordFromUrl, sort: value },
                    ),
                  );
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
              />
            </div>
            <div className="-mt-px">
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
          <section className="mt-14">
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
                <h3 className="text-body-15-semibold text-text">최근 검색어</h3>
                {recentSearches.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-text-gray-300 transition-colors hover:bg-text/5 active:bg-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={clearRecentSearches}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    지우기
                  </button>
                ) : null}
              </div>
              {recentSearches.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recentSearches.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      className="rounded-full border border-stroke px-3 py-2 text-sm text-text transition-colors hover:border-[#5E5E5D] hover:bg-[#5E5E5D] hover:text-[#FAFAF8] active:text-[#FAFAF8] active:border-[#5E5E5D] active:bg-[#5E5E5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                      onClick={() => submitSearch(recent)}
                    >
                      #{recent}
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
                <h3 className="text-body-15-semibold text-text">인기 검색어</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedKeywords.map((recommendation) => (
                    <button
                      key={recommendation}
                      type="button"
                      className="rounded-full border border-button px-3 py-2 text-sm text-icon transition-colors hover:bg-[#F0F6F0] hover:text-[#00C77B] active:text-[#00C77B]  active:bg-[#F0F6F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                      onClick={() => submitSearch(recommendation)}
                    >
                      #{recommendation}
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
