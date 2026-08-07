import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import { PostCreateForm } from "@/features/team/components/board/create/PostCreateForm";
import type { PostImage } from "@/features/team/components/board/create/PostImageUploader";
import { useMeetingHomeQuery } from "@/features/team/hooks/useMeetingHomeQuery";
import { useCreateMeetingPostMutation } from "@/features/team/hooks/useMeetingPostMutations";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";
import { uploadPostImages } from "@/features/team/lib/postImageUpload";

type FormErrors = Partial<Record<"title" | "content", string>>;

export function TeamNoticePostCreatePage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const meetingId = Number(teamId);
  const hasValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;
  const safeMeetingId = hasValidMeetingId ? meetingId : 0;

  const homeQuery = useMeetingHomeQuery(safeMeetingId, {
    enabled: hasValidMeetingId,
    isAuthenticated: true,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PostImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const { mutateAsync: createMeetingPost, isPending: isCreatingPost } =
    useCreateMeetingPostMutation(safeMeetingId);

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  if (!hasValidMeetingId) {
    return <Navigate to="/teams" replace />;
  }

  if (homeQuery.isLoading) {
    return (
      <LoadingState
        label="모임 정보를 불러오는 중"
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
      />
    );
  }

  if (homeQuery.isError || !homeQuery.data) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="모임 정보를 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => void homeQuery.refetch(),
        }}
      />
    );
  }

  const home = homeQuery.data;

  if (!home.host) {
    return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  }

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "제목을 입력해 주세요.";
    }

    if (!content.trim()) {
      nextErrors.content = "내용을 입력해 주세요.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || isCreatingPost || isUploadingImages) {
      return;
    }

    setIsUploadingImages(true);

    try {
      const imageObjectKeys = await uploadPostImages(
        meetingId,
        images.map((image) => image.file),
      );

      console.log("업로드된 이미지 키:", imageObjectKeys);

      const createdPost = await createMeetingPost({
        type: "NOTICE",
        title: title.trim(),
        content: content.trim(),
        imageObjectKeys,
      });
      console.log("생성 응답:", createdPost);
      console.log("이미지 URL:", createdPost.imageUrls);

      navigate(`/teams/${meetingId}/posts`);
    } catch (error) {
      console.error("공지 작성 실패", error);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const isSubmitDisabled =
    !title.trim() || !content.trim() || isCreatingPost || isUploadingImages;

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <PageHeader
        title="공지"
        onBack={() => navigate(-1)}
        sticky
        className="px-5.5"
        rightAction={
          <span className="shrink-0 rounded-lg border border-[#6d6970] bg-[#6d6970] px-2.5 py-0.75 text-[14px] leading-5 text-text2">
            팀장
          </span>
        }
      />

      <form
        noValidate
        className="flex flex-col gap-5 px-5.5 pt-5 pb-8"
        onSubmit={handleSubmit}
      >
        <PostCreateForm
          title={title}
          content={content}
          images={images}
          titleError={errors.title}
          contentError={errors.content}
          isSubmitDisabled={isSubmitDisabled}
          onTitleChange={(value) => {
            setTitle(value);
            clearError("title");
          }}
          onContentChange={(value) => {
            setContent(value);
            clearError("content");
          }}
          onImagesChange={setImages}
        />
      </form>

      <MobileBottomNavigation />
    </div>
  );
}
