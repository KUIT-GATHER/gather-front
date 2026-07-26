import type { ReactNode } from "react";

import {
  TeamDetailContext,
  type TeamDetailContextValue,
} from "./TeamDetailContext";

type TeamDetailProviderProps = TeamDetailContextValue & {
  children: ReactNode;
};

export function TeamDetailProvider({
  children,
  ...value
}: TeamDetailProviderProps) {
  return (
    <TeamDetailContext.Provider value={value}>
      {children}
    </TeamDetailContext.Provider>
  );
}
