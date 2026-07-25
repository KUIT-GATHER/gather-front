import { useMemo, useState } from "react";
import { ChevronLeft, Puzzle, Search, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { useRecentTeamSearches } from "@/features/team/hooks/useRecentTeamSearches";
import { useMeetingRecommendedKeywordsQuery } from "@/features/team/hooks/useMeetingRecommendedKeywordsQuery";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Select, { type SelectOption } from "@/shared/ui/Select";

import { TeamSearchResults } from "./TeamSearchResults";

const SEARCH_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]+$/;

const sortOptions = [
  { value: "latest", label: "최신순 ✨" },
  { value: "popular", label: "인기순 🔥" },
  { value: "deadline", label: "마감임박" },
] satisfies SelectOption[];

const sortParams = {
  latest: ["createdAt,desc"],
  popular: ["currentMemberCount,desc", "createdAt,desc"],
  deadline: ["deadline,asc", "createdAt,desc"],
} as const;

type TeamSearchSort = keyof typeof sortParams;

function isTeamSearchSort(value: string | null): value is TeamSearchSort {
  return value !== null && value in sortParams;
}

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
  variant?: "initial" | "header";
};

function TeamSearchForm({
  initialKeyword,
  onSubmit,
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
            : "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-stroke/55 px-3"
        }
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
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder={
            variant === "initial"
              ? "검색어를 입력해주세요"
              : "모임 이름 또는 설명"
          }
          className="border-0 bg-transparent px-0 focus:border-0"
          aria-describedby={error ? "team-search-error" : undefined}
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
        <p id="team-search-error" className="mt-2 text-sm text-point-red">
          {error}
        </p>
      ) : null}
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
  const sortValue = searchParams.get("sort");
  const sort: TeamSearchSort = isTeamSearchSort(sortValue)
    ? sortValue
    : "latest";
  const queryParams = useMemo(
    () => ({
      keyword: keywordFromUrl,
      size: 20,
      sort: [...sortParams[sort]],
    }),
    [keywordFromUrl, sort],
  );

  const submitSearch = (keyword: string) => {
    addRecentSearch(keyword);
    const next = new URLSearchParams();
    next.set("keyword", keyword);
    next.set("sort", "latest");
    setSearchParams(next);
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
              variant="plain"
              onClick={() => navigate(-1)}
            />
            <TeamSearchForm
              key={keywordFromUrl}
              initialKeyword={keywordFromUrl}
              onSubmit={submitSearch}
              variant="header"
            />
          </header>
          <section className="mt-5">
            <h2 className="text-body-14 text-text">검색결과</h2>
            <TeamSearchResults
              params={queryParams}
              onSelect={(meetingId) => navigate(`/teams/${meetingId}`)}
              renderMeta={(totalElements) => (
                <div className="flex items-center justify-between py-4">
                  <p className="text-body-14 text-text-gray-300">
                    전체 {totalElements}개 모임
                  </p>
                  <Select
                    ariaLabel="검색 결과 정렬"
                    value={sort}
                    options={sortOptions}
                    onChange={(value) => {
                      if (!isTeamSearchSort(value)) return;
                      const next = new URLSearchParams(searchParams);
                      next.set("sort", value);
                      setSearchParams(next);
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
          <PageHeader
            title="모임 찾기"
            onBack={() => navigate(-1)}
            className="[&>div]:h-[70px]"
          />
          <section className="mt-10">
            <h2 className="flex items-end gap-2 whitespace-pre-line text-title-24 text-text">
              <span>{"어떤 모임을\n찾고 계시나요?"}</span>
              <Puzzle className="mb-1 size-6 fill-button text-button" />
            </h2>
            <TeamSearchForm
              key={keywordFromUrl}
              initialKeyword=""
              onSubmit={submitSearch}
              variant="initial"
            />
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-title-18 text-text">최근 검색어</h3>
                {recentSearches.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={clearRecentSearches}
                  >
                    <Trash2 className="size-5 text-icon" aria-hidden="true" />
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
                <h3 className="text-title-18 text-text">추천 검색어</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedKeywords.map((recommendation) => (
                    <button
                      key={recommendation}
                      type="button"
                      className="h-11 rounded-full border border-button px-3 text-[15px] font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
