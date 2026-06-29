import { useState } from "react";

import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Textarea from "@/shared/ui/Textarea";
import Modal from "@/shared/ui/Modal";
import PageContainer from "@/shared/ui/PageContainer";
import Spinner from "@/shared/ui/Spinner";
import Select from "@/shared/ui/Select";
import BottomNav from "@/shared/ui/BottomNav";
import FormField from "@/shared/ui/FormField";

import PlusIcon from "@/assets/icons/Plus.svg";
import PencilIcon from "@/assets/icons/Pen.svg";


export function ComponentTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <PageContainer className="min-h-screen bg-white px-[22px] py-[48px]">
      <div className="flex flex-col gap-[56px]">

        {/* Button */}
        <section className="flex flex-col gap-[20px]">
          <h2 className="text-[20px] font-bold text-[#0A0A0A]">Button</h2>

          <div className="flex flex-col gap-[12px]">
            <Button variant="dangerOutline">팀 해산하기</Button>
            <Button variant="danger">팀 해산하기</Button>
            <Button>수정 완료</Button>
            <Button variant="dark">설정하기</Button>
            <Button size="pill" leftIcon={<img src={PencilIcon} alt="" className="h-[24px] w-[24px]" />}>글 작성</Button>
            <Button variant="dark" size="pill" leftIcon={<img src={PencilIcon} alt="" className="h-[24px] w-[24px]" />}>글 작성</Button>
            <Button size="pill" leftIcon={<img src={PlusIcon} alt="" className="h-[24px] w-[24px]" />}>모임 만들기</Button>
            <Button variant="dark" size="pill" leftIcon={<img src={PlusIcon} alt="" className="h-[24px] w-[24px]" />}>모임 만들기</Button>
          </div>
        </section>
        <FormField label="제목" required count={title.length} maxLength={20} htmlFor="review-title">
            <Input id="review-title" placeholder="제목을 입력하세요" value={title} maxLength={20} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="내용" required count={content.length} maxLength={300} htmlFor="review-content">
            <Textarea id="review-content" placeholder="내용을 입력하세요" value={content} maxLength={300} onChange={(e) => setContent(e.target.value)} />
        </FormField>

        {/* Select */}
        <section className="flex flex-col gap-[20px]">
          <h2 className="text-[20px] font-bold text-[#0A0A0A]">Select</h2>

          <Select
            value={sort}
            onChange={setSort}
            options={[
              { label: "전체", value: "all" },
              { label: "최신순 ✨", value: "latest" },
              { label: "인기순 🔥", value: "popular" },
              { label: "마감임박 ⏰", value: "deadline" },
              { label: "공고기반", value: "official" },
              { label: "자유모임", value: "free" },
            ]}
          />
        </section>

        {/* Spinner */}
        <section className="flex flex-col gap-[20px]">
          <h2 className="text-[20px] font-bold text-[#0A0A0A]">Spinner</h2>

          <Spinner />
        </section>

        {/* Modal */}
        <section className="flex flex-col gap-[20px] pb-[80px]">
          <h2 className="text-[20px] font-bold text-[#0A0A0A]">Modal</h2>

          <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        </section>
      </div>

        <BottomNav />
      <Modal
        open={isOpen}
        title="게시글을 삭제하시겠어요?"
        cancelText="취소"
        confirmText="확인"
        confirmVariant="primary"
        onCancel={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      >
        삭제된 게시글은 복구할 수 없습니다.
      </Modal>
    </PageContainer>
  );
}