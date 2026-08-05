import { useNavigate } from "react-router";

import PageHeader from "@/shared/ui/PageHeader";

export function MyBadgesPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg px-5.5">
      <PageHeader title="나의 뱃지" onBack={() => navigate(-1)} />
    </div>
  );
}
