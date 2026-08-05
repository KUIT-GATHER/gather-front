import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type MyPageActivity = {
  participationId: number;
  postingId: number;
  title: string;
  actStartDate: string;
  actEndDate: string;
  actStartTime: string;
  actEndTime: string;
  actPlace: string;
  status: string;
};

export type MyActivitySummary = {
  totalCompletedCount: number;
  totalRecognizedMinutes?: number;
  timeCertifiableCompletedCount?: number;
  categoryBlocks: Array<{
    category: PostingCategory;
    count: number;
  }>;
};

export type MyActivityRecord = {
  participationId: number;
  postingId: number;
  title: string;
  category: PostingCategory;
  actStartDate: string | null;
  actEndDate: string | null;
  actPlace: string | null;
  timeCertifiable?: boolean;
  recognizedMinutes: number | null;
};

export type MyActivityRecordPage = {
  content: MyActivityRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};
