import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="relative min-h-dvh w-full bg-bg">
      <Outlet />
    </div>
  );
}
