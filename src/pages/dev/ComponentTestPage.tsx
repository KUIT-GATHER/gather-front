import { useState } from "react";
import { Bell, ChevronLeft, CircleAlert, Search, Settings } from "lucide-react";

import Button from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import PageContainer from "@/shared/ui/PageContainer";
import Spinner from "@/shared/ui/Spinner";
import Select from "@/shared/ui/Select";
import FormField from "@/shared/ui/FormField";

import PlusIcon from "@/assets/icons/Plus.svg";
import PencilIcon from "@/assets/icons/Pen.svg";


export function ComponentTestPage() {
  const [activeDialog, setActiveDialog] = useState<
    "primary" | "dark" | "danger" | "pending" | "noDescription" | "long" | null
  >(null);
  const [isConfirmPending, setIsConfirmPending] = useState(false);
  const [sort, setSort] = useState("all");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [placeholderSort, setPlaceholderSort] = useState("");
  const [invalidSort, setInvalidSort] = useState("all");
  const [manySort, setManySort] = useState("option-1");
  const [longLabelSort, setLongLabelSort] = useState("long-1");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const closeDialog = () => {
    setActiveDialog(null);
    setIsConfirmPending(false);
  };

  const handlePendingConfirm = () => {
    setIsConfirmPending(true);
    window.setTimeout(() => {
      closeDialog();
    }, 1500);
  };

  const sortOptions = [
    { label: "전체", value: "all" },
    { label: "최신순 ✨", value: "latest" },
    { label: "인기순 🔥", value: "popular" },
    { label: "마감임박 ⏰", value: "deadline" },
    { label: "공고기반", value: "official" },
    { label: "자유모임", value: "free" },
  ];

  const manyOptions = Array.from({ length: 16 }, (_, index) => ({
    label: `옵션 ${index + 1}`,
    value: `option-${index + 1}`,
  }));

  const longLabelOptions = [
    {
      label: "전체 봉사 모임과 신청 가능한 모집 공고를 함께 보기",
      value: "long-1",
    },
    {
      label: "이번 주 안에 모집이 마감되는 장기 봉사 모임만 보기",
      value: "long-2",
    },
    {
      label: "내가 관심 지역으로 설정한 곳에서 진행되는 활동 보기",
      value: "long-3",
    },
  ];

  return (
    <PageContainer size="narrow" className="min-h-screen bg-white px-5.5 py-12">
      <div className="flex flex-col gap-14">

        {/* Button */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">Button</h2>

          <div className="flex flex-col gap-3">
            <Button variant="dangerOutline">팀 해산하기</Button>
            <Button variant="danger">팀 해산하기</Button>
            <Button>수정 완료</Button>
            <Button variant="dark">설정하기</Button>
            <Button size="pill" leftIcon={<img src={PencilIcon} alt="" className="h-6 w-6" />}>글 작성</Button>
            <Button variant="dark" size="pill" leftIcon={<img src={PencilIcon} alt="" className="h-6 w-6" />}>글 작성</Button>
            <Button size="pill" leftIcon={<img src={PlusIcon} alt="" className="h-6 w-6" />}>모임 만들기</Button>
            <Button variant="dark" size="pill" leftIcon={<img src={PlusIcon} alt="" className="h-6 w-6" />}>모임 만들기</Button>
          </div>
        </section>
        <FormField label="제목" required count={title.length} maxLength={20} htmlFor="review-title">
            <Input id="review-title" placeholder="제목을 입력하세요" value={title} maxLength={20} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="내용" required count={content.length} maxLength={300} htmlFor="review-content">
            <Textarea id="review-content" placeholder="내용을 입력하세요" value={content} maxLength={300} onChange={(e) => setContent(e.target.value)} />
        </FormField>

        {/* IconButton */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">IconButton</h2>

          <div className="flex items-center gap-3">
            <IconButton label="검색" icon={<Search />} />
            <IconButton
              label="알림"
              icon={<Bell />}
              variant="surface"
            />
            <IconButton
              disabled
              label="설정"
              icon={<Settings />}
            />
          </div>
        </section>

        {/* PageHeader */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">PageHeader</h2>

          <div className="flex flex-col gap-4">
            <PageHeader title="모임" />
            <PageHeader
              title="이메일 로그인"
              onBack={() => {}}
            />
            <PageHeader
              title="알림"
              rightAction={<IconButton label="검색" icon={<Search />} />}
            />
            <PageHeader
              title="아주 긴 페이지 제목이 들어와도 가운데에서 말줄임 처리됩니다"
              leftAction={
                <IconButton
                  label="이전"
                  icon={<ChevronLeft />}
                />
              }
              rightAction={
                <IconButton
                  label="설정"
                  icon={<Settings />}
                  variant="surface"
                />
              }
            />
            <div className="h-36 overflow-y-auto border border-stroke">
              <PageHeader
                sticky
                title="sticky PageHeader"
                onBack={() => {}}
                rightAction={<IconButton label="검색" icon={<Search />} />}
              />
              <div className="flex flex-col gap-3 p-4 text-body-14 text-text-gray-300">
                <p>스크롤 영역 안에서 상단에 고정되는 예제입니다.</p>
                <p>PageContainer의 폭 책임을 가져가지 않고 헤더만 렌더링합니다.</p>
                <p>safe-area top padding은 헤더 내부에서 처리됩니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Textarea */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">Textarea</h2>

          <div className="flex flex-col gap-3">
            <Textarea placeholder="내용을 입력하세요" />
            <Textarea invalid placeholder="내용을 입력하세요" />
            <Textarea disabled placeholder="내용을 입력하세요" />
          </div>
        </section>

        {/* EmptyState */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">EmptyState</h2>

          <div className="flex flex-col gap-3">
            <EmptyState title="표시할 내용이 없어요" />
            <EmptyState
              title="아직 모임이 없어요"
              description="관심 있는 봉사활동의 모임을 만들어 보세요."
            />
            <EmptyState
              title="참여한 모임이 없어요"
              actionLabel="모임 둘러보기"
              onAction={() => {}}
            />
          </div>
        </section>

        {/* ErrorState */}
        <section className="flex flex-col gap-10">
          <h2 className="text-xl font-bold text-[#0A0A0A]">ErrorState</h2>

          <ErrorState
            title="문제가 발생했어요"
            description="잠시 후 다시 시도해 주세요."
          />
          <ErrorState
            title="페이지를 불러오지 못했어요"
            primaryAction={{ label: "다시 시도", onClick: () => {} }}
          />
          <ErrorState
            title="페이지를 찾을 수 없어요"
            primaryAction={{ label: "홈으로 이동", onClick: () => {} }}
            secondaryAction={{ label: "이전 페이지", onClick: () => {} }}
          />
          <ErrorState
            title="요청한 모임 정보를 지금은 정상적으로 불러올 수 없어요"
            description="네트워크 연결 상태를 확인한 뒤 잠시 후 다시 시도해 주세요. 문제가 계속되면 홈으로 이동해 다른 메뉴를 이용해 주세요."
          />
          <ErrorState
            title="문제가 발생했어요"
            description="잠시 후 다시 시도해 주세요."
            icon={<CircleAlert className="size-7" />}
          />
        </section>

        {/* Select */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">Select</h2>

          <div className="flex flex-col items-start gap-4">
            <Select
              ariaLabel="기본 정렬"
              value={sort}
              onChange={setSort}
              options={sortOptions}
            />
            <Select
              ariaLabel="선택된 정렬"
              value={selectedSort}
              onChange={setSelectedSort}
              options={sortOptions}
            />
            <Select
              ariaLabel="placeholder 정렬"
              value={placeholderSort}
              onChange={setPlaceholderSort}
              placeholder="정렬 선택"
              options={sortOptions}
            />
            <Select
              ariaLabel="비활성화 정렬"
              disabled
              value={sort}
              onChange={setSort}
              options={sortOptions}
            />
            <Select
              ariaLabel="오류 정렬"
              invalid
              value={invalidSort}
              onChange={setInvalidSort}
              options={sortOptions}
            />
            <Select
              ariaLabel="옵션이 많은 정렬"
              value={manySort}
              onChange={setManySort}
              options={manyOptions}
            />
            <Select
              ariaLabel="긴 라벨 정렬"
              value={longLabelSort}
              onChange={setLongLabelSort}
              options={longLabelOptions}
              className="max-w-72"
            />
          </div>
        </section>

        {/* Spinner */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#0A0A0A]">Spinner</h2>

          <Spinner />
        </section>

        {/* ConfirmDialog */}
        <section className="flex flex-col gap-5 pb-20">
          <h2 className="text-xl font-bold text-[#0A0A0A]">
            ConfirmDialog
          </h2>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setActiveDialog("primary")}>
              primary ConfirmDialog
            </Button>
            <Button
              variant="dark"
              onClick={() => setActiveDialog("dark")}
            >
              dark ConfirmDialog
            </Button>
            <Button
              variant="danger"
              onClick={() => setActiveDialog("danger")}
            >
              danger ConfirmDialog
            </Button>
            <Button onClick={() => setActiveDialog("pending")}>
              pending ConfirmDialog
            </Button>
            <Button onClick={() => setActiveDialog("noDescription")}>
              설명 없는 ConfirmDialog
            </Button>
            <Button onClick={() => setActiveDialog("long")}>
              긴 제목과 설명
            </Button>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={activeDialog === "primary"}
        title="게시글을 삭제하시겠어요?"
        cancelText="취소"
        confirmText="확인"
        confirmVariant="primary"
        onCancel={closeDialog}
        onConfirm={closeDialog}
      >
        삭제된 게시글은 복구할 수 없습니다.
      </ConfirmDialog>
      <ConfirmDialog
        open={activeDialog === "dark"}
        title="설정을 변경하시겠어요?"
        cancelText="취소"
        confirmText="변경"
        confirmVariant="dark"
        onCancel={closeDialog}
        onConfirm={closeDialog}
      >
        변경된 설정은 즉시 적용됩니다.
      </ConfirmDialog>
      <ConfirmDialog
        open={activeDialog === "danger"}
        title="팀을 해산하시겠어요?"
        cancelText="취소"
        confirmText="해산"
        confirmVariant="danger"
        onCancel={closeDialog}
        onConfirm={closeDialog}
      >
        해산한 팀은 다시 복구할 수 없습니다.
      </ConfirmDialog>
      <ConfirmDialog
        open={activeDialog === "pending"}
        title="신청을 취소하시겠어요?"
        cancelText="취소"
        confirmText="신청 취소"
        confirmVariant="danger"
        isPending={isConfirmPending}
        onCancel={closeDialog}
        onConfirm={handlePendingConfirm}
      >
        처리 중에는 창을 닫을 수 없습니다.
      </ConfirmDialog>
      <ConfirmDialog
        open={activeDialog === "noDescription"}
        title="변경사항을 저장하시겠어요?"
        confirmText="저장"
        onCancel={closeDialog}
        onConfirm={closeDialog}
      />
      <ConfirmDialog
        open={activeDialog === "long"}
        title="선택한 모든 봉사 모임 정보를 삭제하고 관련 신청 내역을 함께 정리하시겠어요?"
        cancelText="아니요"
        confirmText="삭제"
        confirmVariant="danger"
        onCancel={closeDialog}
        onConfirm={closeDialog}
      >
        삭제가 완료되면 이 화면에서 다시 확인할 수 없으며, 참여자에게 표시되는 일부 정보도 함께 사라질 수 있습니다.
      </ConfirmDialog>
    </PageContainer>
  );
}
