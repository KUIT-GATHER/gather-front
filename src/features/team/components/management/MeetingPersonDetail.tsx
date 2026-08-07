import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

type MeetingPersonDetailProps = {
  phoneNumber: string;
  birthDate: string;
  regionName: string;
  interestCategories: PostingCategory[];
  totalRecognizedMinutes: number;
};

export function MeetingPersonDetail({
  phoneNumber,
  birthDate,
  regionName,
  interestCategories,
  totalRecognizedMinutes,
}: MeetingPersonDetailProps) {
  return (
    <div>
      <h3 className="text-body-14-semibold text-text">기본 정보</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-text-gray-300">
        <div className="flex min-w-0 gap-1">
          <dt className="shrink-0">전화번호</dt>
          <dd className="truncate text-text">{phoneNumber}</dd>
        </div>
        <div className="flex min-w-0 gap-1">
          <dt className="shrink-0">생년월일</dt>
          <dd className="truncate text-text">{birthDate}</dd>
        </div>
        <div className="flex min-w-0 gap-1">
          <dt className="shrink-0">지역</dt>
          <dd className="truncate text-text">{regionName}</dd>
        </div>
        <div className="flex min-w-0 gap-1">
          <dt className="shrink-0">관심 분야</dt>
          <dd className="truncate text-text">
            {interestCategories
              .map((category) => POSTING_CATEGORY_LABEL[category])
              .join(", ")}
          </dd>
        </div>
        <div className="col-span-2 flex min-w-0 gap-1">
          <dt className="shrink-0">총 인정 시간</dt>
          <dd className="truncate text-text">{totalRecognizedMinutes}분</dd>
        </div>
      </dl>
    </div>
  );
}
