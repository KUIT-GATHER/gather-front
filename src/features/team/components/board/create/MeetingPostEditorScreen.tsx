import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import { teamQueries } from "@/features/team/api/team.queries";
import {
  useCreateMeetingPostMutation,
  useUpdateMeetingPostMutation,
} from "@/features/team/hooks/useMeetingPostMutations";
import { uploadMeetingPostImages } from "@/features/team/lib/postImageUpload";
import {
  meetingPostSchema,
  type MeetingPostFormValues,
} from "@/features/team/schemas/meetingPost.schema";
import type { EditableMeetingPostType } from "@/features/team/types/meetingPost.types";
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
      reviewSourceId: null,
    },
  });
  const title = useWatch({ control, name: "title" });
  const content = useWatch({ control, name: "content" });
  const reviewSourceId = useWatch({ control, name: "reviewSourceId" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => () => previewsRef.current.forEach(URL.revokeObjectURL), []);

  const selectFiles = (selected: FileList | null) => {
    if (!selected) return;
    previewsRef.current.forEach(URL.revokeObjectURL);
    const nextFiles = Array.from(selected).slice(0, 3);
    const nextPreviews = nextFiles.map(URL.createObjectURL);
    previewsRef.current = nextPreviews;
    setFiles(nextFiles);
    setPreviews(nextPreviews);
    setSubmitError(null);
  };

  const clearFiles = () => {
    previewsRef.current.forEach(URL.revokeObjectURL);
    previewsRef.current = [];
    setFiles([]);
    setPreviews([]);
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

      const reviewActivity = reviewableQuery.data?.find(
        (activity) => activity.reviewSourceId === values.reviewSourceId,
      );
      const created = await createMutation.mutateAsync(
        postType === "REVIEW"
          ? {
              type: "REVIEW",
              title: values.title.trim(),
              content: values.content.trim(),
              imageObjectKeys,
              reviewSourceType: reviewActivity!.reviewSourceType,
              reviewSourceId: reviewActivity!.reviewSourceId,
            }
          : {
              type: postType,
              title: values.title.trim(),
              content: values.content.trim(),
              imageObjectKeys,
            },
      );
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
          <FormField
            label="완료 활동"
            required
            error={errors.reviewSourceId?.message}
          >
            <Controller
              name="reviewSourceId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select
                  aria-label="후기를 작성할 완료 활동"
                  className="h-12 w-full rounded-xl border border-stroke bg-white px-4 outline-none focus:border-button"
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || null)
                  }
                >
                  <option value="">완료 활동을 선택해 주세요</option>
                  {reviewableQuery.data?.map((activity) => (
                    <option
                      key={`${activity.reviewSourceType}-${activity.reviewSourceId}`}
                      value={activity.reviewSourceId}
                    >
                      {activity.reviewSourceType === "POSTING"
                        ? "[봉사 공고]"
                        : "[모임 활동]"}{" "}
                      {activity.title} ·{" "}
                      {activity.activityStartAt.slice(0, 16).replace("T", " ")}{" "}
                      ~ {activity.activityEndAt.slice(0, 16).replace("T", " ")}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormField>
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
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-point-green text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-5" aria-hidden="true" /> 사진 첨부 (선택,
            최대 3장)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => selectFiles(event.target.files)}
          />
          {post?.imageUrls.length &&
          !removeExistingImages &&
          previews.length === 0 ? (
            <div className="mt-3">
              <div className="flex gap-2 overflow-x-auto">
                {post.imageUrls.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`기존 게시글 사진 ${index + 1}`}
                    className="h-28 w-36 rounded-xl object-cover"
                  />
                ))}
              </div>
              <button
                type="button"
                className="mt-2 text-sm text-point-red"
                onClick={() => setRemoveExistingImages(true)}
              >
                기존 사진 전체 삭제
              </button>
            </div>
          ) : null}
          {previews.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {previews.map((url, index) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`새 게시글 사진 ${index + 1}`}
                    className="h-28 w-36 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    aria-label="선택한 사진 전체 삭제"
                    className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/90"
                    onClick={clearFiles}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
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
            isPending || (postType === "REVIEW" && !post && !reviewSourceId)
          }
        >
          {isPending ? "저장 중" : post ? "저장하기" : "등록하기"}
        </Button>
      </form>
      <MobileBottomNavigation />
    </PageContainer>
  );
}
