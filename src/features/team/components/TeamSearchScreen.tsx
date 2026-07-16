import { useState } from "react";
import { useNavigate } from "react-router";

import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Input from "@/shared/ui/Input";

export function TeamSearchScreen() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchParams = new URLSearchParams();

    if (keyword.trim()) {
      searchParams.set("keyword", keyword.trim());
    }

    const query = searchParams.toString();
    navigate(query ? `/teams?${query}` : "/teams");
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh">
      <PageHeader title="모임 검색" onBack={() => navigate(-1)} />
      <form className="mt-5" onSubmit={handleSubmit}>
        <label htmlFor="team-keyword" className="sr-only">
          모임 검색어
        </label>
        <Input
          id="team-keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="모임 이름 또는 설명 검색"
          autoFocus
        />
      </form>
    </PageContainer>
  );
}
