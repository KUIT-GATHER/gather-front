import type { PostingCategory } from "@/features/category/types/postingCategory.types";

type MyPageActivityBase = {
  title: string;
  actStartDate: string;
  actEndDate?: string | null;
  actStartTime?: string | null;
  actEndTime?: string | null;
  actPlace?: string | null;
  status: string;
};

export type MyPageActivity = MyPageActivityBase &
  (
    | {
        activityType: "VOLUNTEER";
        participationId: number;
        postingId: number;
        meetingId?: never;
      }
    | {
        activityType: "MEETING";
        participationId?: number | null;
        postingId?: never;
        meetingId: number;
      }
  );

export type MyActivitySummary = {
  totalCompletedCount: number;
  totalRecognizedMinutes: number;
  timeCertifiableCompletedCount: number;
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
  timeCertifiable: boolean;
  recognizedMinutes: number | null;
};

export type MyActivityRecordPage = {
  content: MyActivityRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};
