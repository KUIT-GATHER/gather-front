import {
  LegalDocumentContent,
  SIGNUP_LEGAL_DOCUMENTS,
  type LegalDocumentType,
} from "@/features/legal";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

type SignupTermsDetailProps = {
  type: LegalDocumentType;
  onBack: () => void;
};

export function SignupTermsDetail({ type, onBack }: SignupTermsDetailProps) {
  const document = SIGNUP_LEGAL_DOCUMENTS[type];

  return (
    <PageContainer
      size="narrow"
      className="min-h-dvh bg-bg pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
    >
      <PageHeader
        title={document.headerTitle}
        titleAlign="left"
        onBack={onBack}
        className="bg-bg"
      />
      <div className="mt-1 h-1.25 w-full rounded-full bg-button" />

      <article className="pt-12">
        <h2 className="text-2xl font-semibold leading-8 text-text">
          {document.title}
        </h2>
        <LegalDocumentContent document={document} />
      </article>
    </PageContainer>
  );
}
