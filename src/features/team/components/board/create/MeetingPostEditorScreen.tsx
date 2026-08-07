import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import { teamQueries } from "@/features/team/api/team.queries";
import { ReviewableActivityField } from "@/features/team/components/board/create/ReviewableActivityField";
import { MeetingPostImageCarousel } from "@/features/team/components/board/post/MeetingPostImageCarousel";
import { MeetingImageEditorCarousel } from "@/features/team/components/form/MeetingImageEditorCarousel";
import {
  useCreateMeetingPostMutation,
  useUpdateMeetingPostMutation,
} from "@/features/team/hooks/useMeetingPostMutations";
import {
  getMeetingImageSelectionErrorMessage,
  MAX_MEETING_IMAGE_COUNT,
  MEETING_IMAGE_MIME_TYPES,
  validateMeetingImageSelection,
} from "@/features/team/lib/meetingImageValidation";
import { uploadMeetingPostImages } from "@/features/team/lib/postImageUpload";
import {
  meetingPostSchema,
  type MeetingPostFormValues,
} from "@/features/team/schemas/meetingPost.schema";
import type {
  EditableMeetingPostType,
  MeetingPostCreateRequest,
  ReviewSourceType,
  ReviewSourceValue,
} from "@/features/team/types/meetingPost.types";
import type { MeetingPost } from "@/features/team/types/team.types";
import Button from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";

type MeetingPostEditorScreenProps = {
  meetingId: number;
  postType: EditableMeetingPostType;
  post?: MeetingPost;
};

function isReviewSourceValue(value: string): value is ReviewSourceValue {
  return /^(POSTING|MEETING_RECRUIT):[1-9]\d*$/.test(value);
}

function parseReviewSourceValue(value: ReviewSourceValue): {
  reviewSourceType: ReviewSourceType;
  reviewSourceId: number;
} | null {
  const [reviewSourceType, sourceIdValue, extraValue] = value.split(":");
  const reviewSourceId = Number(sourceIdValue);

  if (
    extraValue !== undefined ||
    (reviewSourceType !== "POSTING" &&
      reviewSourceType !== "MEETING_RECRUIT") ||
    !Number.isInteger(reviewSourceId) ||
    reviewSourceId <= 0
  ) {
    return null;
  }

  return { reviewSourceType, reviewSourceId };
}

export function MeetingPostEditorScreen({
  meetingId,
  postType,
  post,
}: MeetingPostEditorScreenProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removeExistingImages, setRemoveExistingImages] = useState(false);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createMutation = useCreateMeetingPostMutation(meetingId);
  const updateMutation = useUpdateMeetingPostMutation(
    meetingId,
    post?.postId ?? 0,
  );
  const reviewableQuery = useQuery({
    ...teamQueries.reviewableActivities(meetingId),
    enabled: postType === "REVIEW" && !post,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingPostFormValues>({
    resolver: zodResolver(meetingPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      content: post?.content ?? "",
      reviewSourceValue: null,
    },
  });
  const title = useWatch({ control, name: "title" });
  const content = useWatch({ control, name: "content" });
  const reviewSourceValue = useWatch({ control, name: "reviewSourceValue" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => () => previewsRef.current.forEach(URL.revokeObjectURL), []);

  const selectFiles = (selected: FileList | null) => {
    if (!selected) return;

    const { acceptedFiles, rejectedReasons } = validateMeetingImageSelection({
      existingImages: files.map((file) => ({ file })),
      files: selected,
    });

    if (acceptedFiles.length > 0) {
      const acceptedPreviews = acceptedFiles.map(URL.createObjectURL);
      previewsRef.current = [...previewsRef.current, ...acceptedPreviews];
      setFiles((current) => [...current, ...acceptedFiles]);
      setPreviews((current) => [...current, ...acceptedPreviews]);
    }

    setImageSelectionError(
      rejectedReasons.length > 0
        ? getMeetingImageSelectionErrorMessage(rejectedReasons)
        : null,
    );
    setSubmitError(null);
  };

  const removeFile = (index: number) => {
    const previewUrl = previewsRef.current[index];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewsRef.current = previewsRef.current.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    setFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    setPreviews((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    setImageSelectionError(null);
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const imageObjectKeys =
        files.length > 0
          ? await uploadMeetingPostImages(meetingId, files)
          : post
            ? removeExistingImages
              ? []
              : null
            : null;

      if (post) {
        await updateMutation.mutateAsync({
          title: values.title.trim(),
          content: values.content.trim(),
          imageObjectKeys,
        });
        navigate(`/teams/${meetingId}/posts/${post.postId}`, { replace: true });
        return;
      }

      let createRequest: MeetingPostCreateRequest;

      if (postType === "REVIEW") {
        const reviewSource = values.reviewSourceValue
          ? parseReviewSourceValue(values.reviewSourceValue)
          : null;

        if (!reviewSource) {
          setSubmitError("후기를 작성할 완료 활동을 선택해 주세요.");
          return;
        }

        createRequest = {
          type: "REVIEW",
          title: values.title.trim(),
          content: values.content.trim(),
          imageObjectKeys,
          ...reviewSource,
        };
      } else {
        createRequest = {
          type: postType,
          title: values.title.trim(),
          content: values.content.trim(),
          imageObjectKeys,
        };
      }

      const created = await createMutation.mutateAsync(createRequest);
      navigate(`/teams/${meetingId}/posts/${created.postId}`, {
        replace: true,
      });
    } catch {
      setSubmitError("게시글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  });

  if (postType === "REVIEW" && !post && reviewableQuery.isLoading) {
    return (
      <LoadingState
        className="min-h-dvh"
        label="작성 가능한 활동을 불러오는 중"
      />
    );
  }

  if (postType === "REVIEW" && !post && reviewableQuery.isError) {
    return (
      <PageContainer className="min-h-dvh">
        <PageHeader title="활동 후기" onBack={() => navigate(-1)} />
        <ErrorState
          className="mt-24"
          title="후기를 작성할 활동을 불러오지 못했어요"
          primaryAction={{
            label: "다시 시도",
            onClick: () => void reviewableQuery.refetch(),
          }}
        />
        <MobileBottomNavigation />
      </PageContainer>
    );
  }

  if (postType === "REVIEW" && !post && reviewableQuery.data?.length === 0) {
    return (
      <PageContainer className="min-h-dvh">
        <PageHeader title="활동 후기" onBack={() => navigate(-1)} />
        <EmptyState
          className="mt-24"
          title="후기를 작성할 활동이 없어요"
          description="완료한 활동이 생기면 후기를 남길 수 있어요."
        />
        <MobileBottomNavigation />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-dvh pb-32">
      <PageHeader
        title={
          post
            ? "게시글 수정"
            : postType === "REVIEW"
              ? "활동 후기"
              : postType === "NOTICE"
                ? "공지 작성"
                : "자유 게시글"
        }
        onBack={() => navigate(-1)}
      />
      <form className="flex flex-col gap-6 pt-5" noValidate onSubmit={submit}>
        {postType === "REVIEW" && !post ? (
          <div>
            <Controller
              name="reviewSourceValue"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <ReviewableActivityField
                  id="review-source"
                  value={field.value}
                  activities={reviewableQuery.data ?? []}
                  invalid={Boolean(errors.reviewSourceValue)}
                  onChange={(value) => {
                    field.onChange(isReviewSourceValue(value) ? value : null);
                  }}
                />
              )}
            />
            {errors.reviewSourceValue?.message ? (
              <p role="alert" className="mt-1.5 text-xs text-point-red">
                {errors.reviewSourceValue.message}
              </p>
            ) : null}
          </div>
        ) : null}
        <FormField
          label="제목"
          required
          htmlFor="post-title"
          count={title.length}
          maxLength={15}
          error={errors.title?.message}
        >
          <Input
            id="post-title"
            maxLength={15}
            invalid={Boolean(errors.title)}
            placeholder="제목을 입력하세요"
            {...register("title")}
          />
        </FormField>
        <FormField
          label="내용"
          required
          htmlFor="post-content"
          count={content.length}
          maxLength={1000}
          error={errors.content?.message}
        >
          <Textarea
            id="post-content"
            maxLength={1000}
            invalid={Boolean(errors.content)}
            placeholder="내용을 입력하세요"
            className="h-52"
            {...register("content")}
          />
        </FormField>
        <section>
          <Button
            variant="primaryOutline"
            size="medium"
            fullWidth
            disabled={files.length >= MAX_MEETING_IMAGE_COUNT || isPending}
            className="h-12 border-point-green text-base text-button"
            leftIcon={<ImagePlus className="size-5" aria-hidden="true" />}
            onClick={() => fileInputRef.current?.click()}
          >
            사진 첨부 (선택, 최대 {MAX_MEETING_IMAGE_COUNT}장)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={MEETING_IMAGE_MIME_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(event) => {
              selectFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          {imageSelectionError ? (
            <p role="alert" className="mt-1.5 text-xs text-point-red">
              {imageSelectionError}
            </p>
          ) : null}
          {post?.imageUrls.length &&
          !removeExistingImages &&
          previews.length === 0 ? (
            <div className="mt-3">
              <MeetingPostImageCarousel
                className="mt-0"
                imageUrls={post.imageUrls}
                title={post.title}
              />
              <Button
                variant="dangerOutline"
                size="medium"
                fullWidth
                className="mt-3"
                disabled={isPending}
                onClick={() => setRemoveExistingImages(true)}
              >
                기존 사진 전체 삭제
              </Button>
            </div>
          ) : null}
          {previews.length > 0 ? (
            <MeetingImageEditorCarousel
              className="mt-3"
              images={previews.map((url, index) => ({
                id: `local-${index}-${url}`,
                previewUrl: url,
              }))}
              onRemove={removeFile}
            />
          ) : null}
        </section>
        {submitError ? (
          <p role="alert" className="text-sm text-point-red">
            {submitError}
          </p>
        ) : null}
        <Button
          type="submit"
          fullWidth
          disabled={
            isPending || (postType === "REVIEW" && !post && !reviewSourceValue)
          }
        >
          {isPending ? "저장 중" : post ? "저장하기" : "등록하기"}
        </Button>
      </form>
      <MobileBottomNavigation />
    </PageContainer>
  );
}
