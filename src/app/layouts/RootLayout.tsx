import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[402px] bg-bg">
      <Outlet />
    </div>
  );
}
