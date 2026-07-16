import { useState } from "react";
import { useNavigate } from "react-router";

import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Input from "@/shared/ui/Input";

export function VolunteerPostingSearchScreen() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchParams = new URLSearchParams();

    if (keyword.trim()) {
      searchParams.set("keyword", keyword.trim());
    }

    const query = searchParams.toString();
    navigate(query ? `/volunteers?${query}` : "/volunteers");
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh">
      <PageHeader title="봉사 공고 검색" onBack={() => navigate(-1)} />
      <form className="mt-5" onSubmit={handleSubmit}>
        <label htmlFor="volunteer-keyword" className="sr-only">
          봉사 공고 검색어
        </label>
        <Input
          id="volunteer-keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="공고 제목 또는 모집 기관명 검색"
          autoFocus
        />
      </form>
    </PageContainer>
  );
}
