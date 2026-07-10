import { Outlet } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";

export function MainTabLayout() {
  return (
    <>
      <main className="pb-20">
        <Outlet />
      </main>

      <MobileBottomNavigation />
    </>
  );
}
