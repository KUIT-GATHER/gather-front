import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import Textarea from "@/shared/ui/Textarea";

import { PostImageUploader, type PostImage } from "./PostImageUploader";

const TITLE_MAX_LENGTH = 15;
const CONTENT_MAX_LENGTH = 500;

interface PostCreateFormProps {
  title: string;
  content: string;
  images: PostImage[];
  titleError?: string;
  contentError?: string;
  isSubmitDisabled: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onImagesChange: (images: PostImage[]) => void;
}

export function PostCreateForm({
  title,
  content,
  images,
  titleError,
  contentError,
  isSubmitDisabled,
  onTitleChange,
  onContentChange,
  onImagesChange,
}: PostCreateFormProps) {
  return (
    <>
      <FormField
        label="제목"
        required
        htmlFor="post-title"
        count={title.length}
        maxLength={TITLE_MAX_LENGTH}
        error={titleError}
      >
        <Input
          id="post-title"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="제목을 입력하세요"
          invalid={Boolean(titleError)}
          className="h-12"
          onChange={(event) => {
            onTitleChange(event.target.value);
          }}
        />
      </FormField>

      <FormField
        label="내용"
        required
        htmlFor="post-content"
        count={content.length}
        maxLength={CONTENT_MAX_LENGTH}
        error={contentError}
      >
        <Textarea
          id="post-content"
          value={content}
          maxLength={CONTENT_MAX_LENGTH}
          placeholder="내용을 입력하세요"
          invalid={Boolean(contentError)}
          className="h-[165px] resize-none"
          onChange={(event) => {
            onContentChange(event.target.value);
          }}
        />
      </FormField>

      <PostImageUploader images={images} onImagesChange={onImagesChange} />

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitDisabled}
        className="mt-1 h-12 rounded-full text-[16px]"
      >
        등록하기
      </Button>
    </>
  );
}
