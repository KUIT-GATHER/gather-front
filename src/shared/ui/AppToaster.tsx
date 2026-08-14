import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      duration={2000}
      visibleToasts={1}
      gap={8}
      style={{
        top: "50%",
        right: "auto",
        bottom: "auto",
        left: "50%",
        height: "var(--front-toast-height)",
        width: "calc(100vw - 2.75rem)",
        maxWidth: "22.375rem",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex h-11 !w-full items-center justify-center rounded-full bg-[#DCECDF] px-5.5 text-center",
          content: "w-full",
          title: "text-[15px] leading-5 font-medium text-text",
        },
      }}
      containerAriaLabel="알림"
    />
  );
}
