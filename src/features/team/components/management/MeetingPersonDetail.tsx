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
    <dl className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <dt className="text-text-gray-300">전화번호</dt>
        <dd className="mt-1">{phoneNumber}</dd>
      </div>
      <div>
        <dt className="text-text-gray-300">생년월일</dt>
        <dd className="mt-1">{birthDate}</dd>
      </div>
      <div>
        <dt className="text-text-gray-300">지역</dt>
        <dd className="mt-1">{regionName}</dd>
      </div>
      <div>
        <dt className="text-text-gray-300">관심 분야</dt>
        <dd className="mt-1">
          {interestCategories
            .map((category) => POSTING_CATEGORY_LABEL[category])
            .join(", ")}
        </dd>
      </div>
      <div className="col-span-2">
        <dt className="text-text-gray-300">총 인정 시간</dt>
        <dd className="mt-1">{totalRecognizedMinutes}분</dd>
      </div>
    </dl>
  );
}
