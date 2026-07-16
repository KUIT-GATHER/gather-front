import { MARKETING_CONSENT } from "./documents/marketingConsent";
import { PRIVACY_POLICY } from "./documents/privacyPolicy";
import { SERVICE_TERMS } from "./documents/serviceTerms";
import type { LegalDocument, LegalDocumentType } from "./legal.types";

export const SIGNUP_LEGAL_DOCUMENTS = {
  service: SERVICE_TERMS,
  privacy: PRIVACY_POLICY,
  marketing: MARKETING_CONSENT,
} satisfies Record<LegalDocumentType, LegalDocument>;
