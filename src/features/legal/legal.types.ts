export type LegalDocumentType = "service" | "privacy" | "marketing";

export type LegalDocumentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "ordered-list";
      items: readonly string[];
    }
  | {
      type: "unordered-list";
      items: readonly string[];
    }
  | {
      type: "grouped-list";
      groups: readonly {
        title: string;
        items: readonly string[];
      }[];
    };

export type LegalDocumentSection = {
  title: string;
  blocks: readonly LegalDocumentBlock[];
};

export type LegalDocument = {
  type: LegalDocumentType;
  headerTitle: string;
  title: string;
  introduction?: readonly string[];
  sections: readonly LegalDocumentSection[];
  appendix?: readonly string[];
};
