import { useMemo, useState } from "react";
import { ChevronLeft, Search, Trash2 } from "lucide-react";
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
  variant?: "initial" | "header";
};

function VolunteerPostingSearchForm({
  initialKeyword,
  onSubmit,
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
            : "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-stroke/55 px-3"
        }
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
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder="공고 제목 또는 모집기관명"
          className={
            variant === "initial"
              ? "border-0 bg-transparent px-0 focus:border-0"
              : "border-0 bg-transparent px-0 focus:border-0"
          }
          aria-describedby={error ? "volunteer-search-error" : undefined}
          autoFocus={!initialKeyword}
        />
        <IconButton
          label="검색"
          icon={<Search />}
          size={variant === "initial" ? "medium" : "small"}
          type="submit"
        />
      </form>
      {error ? (
        <p id="volunteer-search-error" className="mt-2 text-sm text-point-red">
          {error}
        </p>
      ) : null}
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
          <header className="flex items-center gap-1 pt-[env(safe-area-inset-top)]">
            <IconButton
              label="뒤로가기"
              icon={<ChevronLeft />}
              onClick={() => navigate(-1)}
            />
            <VolunteerPostingSearchForm
              key={keywordFromUrl}
              initialKeyword={keywordFromUrl}
              onSubmit={submitSearch}
              variant="header"
            />
          </header>
          <section className="mt-5">
            <h2 className="text-body-14 text-text">검색결과</h2>
            <VolunteerPostingResults
              params={queryParams}
              emptyTitle="검색 결과가 없어요"
              emptyDescription="다른 검색어로 다시 찾아보세요."
              onSelect={(postingId) => navigate(`/volunteers/${postingId}`)}
              renderMeta={(totalElements) => (
                <div className="flex items-center justify-between py-4">
                  <p className="text-body-14 text-text-gray-300">
                    전체 {totalElements}개 활동
                  </p>
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
              )}
            />
          </section>
        </>
      ) : (
        <>
          <PageHeader title="봉사 찾기" onBack={() => navigate(-1)} />
          <section className="mt-14">
            <h2 className="whitespace-pre-line text-title-24 text-text">
              어떤 봉사를{`\n`}찾고 계시나요?
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
                    className="inline-flex items-center gap-1 text-sm text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
                      className="rounded-full border border-stroke px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                      onClick={() => submitSearch(recent)}
                    >
                      {recent}
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
                <h3 className="text-body-15-semibold text-text">추천 검색어</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedKeywords.map((recommendation) => (
                    <button
                      key={recommendation}
                      type="button"
                      className="rounded-full border border-button px-3 py-2 text-sm text-icon focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
