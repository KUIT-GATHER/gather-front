import { SignupShell } from "./SignupShell";
import {
  TERMS_DOCUMENTS,
  type TermsDocumentType,
} from "@/features/auth/constants/signupFlow.constants";

type SignupTermsDetailProps = {
  type: TermsDocumentType;
  onBack: () => void;
};

export function SignupTermsDetail({
  type,
  onBack,
}: SignupTermsDetailProps) {
  const document = TERMS_DOCUMENTS[type];

  return (
    <div className="min-h-dvh bg-bg">
      <SignupShell step="terms" onBack={onBack}>
        <article className="pb-8">
          <h2 className="text-xl font-semibold text-text">{document.title}</h2>
          <div className="mt-4 h-1.25 rounded-full bg-button" />
          <section className="mt-6 space-y-4 text-base leading-7 text-text">
            <p>{document.placeholder}</p>
            <p className="text-sm text-text-gray-100">
              TODO: 승인된 약관 원문을 이 위치에 연결해 주세요.
            </p>
          </section>
        </article>
      </SignupShell>
    </div>
  );
}
