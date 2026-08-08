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
}: MeetingPersonDetailProps) {
  return (
    <div>
      <h3 className="text-body-14-semibold text-text">기본 정보</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] text-black/50 ">
        <div className="flex min-w-0 gap-1.5 items-baseline">
          <dt className="shrink-0 text-[14px]">전화번호</dt>
          <dd className="truncate text-[#0A0A0A]">{phoneNumber}</dd>
        </div>
        <div className="flex min-w-0 gap-1.5 items-baseline">
          <dt className="shrink-0 text-[14px]">생년월일</dt>
          <dd className="truncate text-[#0A0A0A]">{birthDate}</dd>
        </div>
        <div className="flex min-w-0 gap-1.5 items-baseline">
          <dt className="shrink-0 text-[14px]">지역</dt>
          <dd className="truncate text-[#0A0A0A]">{regionName}</dd>
        </div>
        <div className="flex min-w-0 gap-1.5 items-baseline">
          <dt className="shrink-0 text-[14px]">관심 분야</dt>
          <dd className="truncate text-[#0A0A0A]">
            {interestCategories
              .map((category) => POSTING_CATEGORY_LABEL[category])
              .join(", ")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
