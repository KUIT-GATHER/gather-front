import { Outlet } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";

export function MainTabLayout() {
  return (
    <>
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <MobileBottomNavigation />
    </>
  );
}
