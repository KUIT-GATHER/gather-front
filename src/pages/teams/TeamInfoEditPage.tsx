import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { MeetingCategoryTag } from "@/features/team/components/MeetingCategoryTag";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";

const NAME_MAX_LENGTH = 15;
const DESCRIPTION_MAX_LENGTH = 200;
const PARTICIPATION_CONDITION_MAX_LENGTH = 150;

const MEETING_CATEGORY_ORDER: PostingCategory[] = [
  "ENVIRONMENT",
  "EDUCATION",
  "WELFARE",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

export function TeamInfoEditPage() {
  const navigate = useNavigate();
  const { home, detail, isHost } = useTeamDetailContext();

  const isPostingBased = detail.volunteerPostingId !== null;
  const maxMemberLimit = isPostingBased ? 30 : 100;

  const [name, setName] = useState(detail.name);
  const [description, setDescription] = useState(detail.description ?? "");
  const [maxMember, setMaxMember] = useState(String(detail.maxMember));
  const [categories, setCategories] = useState<PostingCategory[]>([
    ...detail.categories,
  ]);
  const [participationCondition, setParticipationCondition] = useState(
    detail.participationCondition ?? "",
  );
  const [regionId, setRegionId] = useState(detail.regionId);
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);

  const toggleCategory = (category: PostingCategory) => {
    setCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, category];
    });
  };

  const regionsQuery = useRegionsQuery();

  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);

  const regionById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );

  const selectedRegion = regionById.get(regionId);

  const selectedRegionParent =
    selectedRegion?.parentId !== null && selectedRegion?.parentId !== undefined
      ? regionById.get(selectedRegion.parentId)
      : undefined;

  const selectedRegionLabel = selectedRegion
    ? getFullRegionSelectionLabel(selectedRegion, selectedRegionParent)
    : "활동 지역을 선택해 주세요.";

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader title="팀 정보 수정" onBack={() => navigate(-1)} sticky />

      <form
        className="flex flex-col gap-6 pb-28"
        onSubmit={(event) => {
          event.preventDefault();

          console.log({
            name,
            description,
            regionId,
            maxMember: Number(maxMember),
            categories,
            participationCondition,
          });
        }}
      >
        {isPostingBased ? (
          <FormField label="연결 공고">
            <Input value={home.linkedPostingTitle ?? ""} disabled />
          </FormField>
        ) : null}

        <FormField
          label="모임 이름"
          required
          htmlFor="meeting-name"
          count={name.length}
          maxLength={NAME_MAX_LENGTH}
        >
          <Input
            id="meeting-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </FormField>

        <FormField
          label="모임 소개"
          required
          htmlFor="meeting-description"
          count={description.length}
          maxLength={DESCRIPTION_MAX_LENGTH}
        >
          <Textarea
            id="meeting-description"
            value={description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="h-36"
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </FormField>

        <FormField label="활동 지역" required>
          <button
            type="button"
            onClick={() => {
              setIsRegionSheetOpen(true);
            }}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stroke bg-white px-4 text-left focus:border-button focus:outline-none"
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin
                aria-hidden="true"
                className="size-4 shrink-0 text-icon"
              />

              <span className="truncate text-[15px] text-text">
                {selectedRegionLabel}
              </span>
            </span>
          </button>
        </FormField>

        <FormField
          label={`최대 인원 (${maxMemberLimit}명)`}
          required
          htmlFor="meeting-max-member"
        >
          <Input
            id="meeting-max-member"
            type="number"
            value={maxMember}
            min={Math.max(1, home.currentMemberCount)}
            max={maxMemberLimit}
            onChange={(event) => {
              setMaxMember(event.target.value);
            }}
          />
        </FormField>

        <FormField
          label="카테고리"
          required
          description="최대 3개까지 선택할 수 있습니다."
        >
          <div className="flex flex-wrap gap-2">
            {MEETING_CATEGORY_ORDER.map((category) => {
              const selected = categories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    toggleCategory(category);
                  }}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                >
                  <MeetingCategoryTag category={category} selected={selected} />
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="활동 안내 및 참여 조건"
          htmlFor="meeting-participation-condition"
          count={participationCondition.length}
          maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
        >
          <Textarea
            id="meeting-participation-condition"
            value={participationCondition}
            maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
            className="h-28"
            onChange={(event) => {
              setParticipationCondition(event.target.value);
            }}
          />
        </FormField>

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-button text-[16px] font-semibold text-white"
        >
          저장하기
        </button>
      </form>

      <RegionSelectionSheet
        open={isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        value={regionId}
        onApply={(nextRegionId) => {
          setRegionId(nextRegionId);
        }}
        title="활동 지역"
      />
    </main>
  );
}
