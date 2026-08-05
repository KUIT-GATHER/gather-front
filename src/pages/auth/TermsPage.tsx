import { Navigate, useNavigate, useParams } from "react-router";

import { SignupTermsDetail } from "@/features/auth/components/signup/SignupTermsDetail";
import type { LegalDocumentType } from "@/features/legal";

export function TermsPage() {
  const navigate = useNavigate();
  const { type } = useParams();

  if (type !== "service" && type !== "privacy") {
    return <Navigate to="/" replace />;
  }

  return (
    <SignupTermsDetail
      type={type satisfies LegalDocumentType}
      onBack={() => navigate(-1)}
    />
  );
}
