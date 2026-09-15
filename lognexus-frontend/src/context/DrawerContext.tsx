import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { NormalizedLog, RawLog, Source, SourceProfile } from "../types";

export type DrawerContent =
  | { type: "event"; rawLog?: RawLog; normalizedLog?: NormalizedLog; provenanceId: string }
  | { type: "source"; source: Source }
  | { type: "profile"; profile: SourceProfile }
  | { type: "custom"; title: string; subtitle?: string; content: ReactNode }
  | null;

interface DrawerContextType {
  isOpen: boolean;
  content: DrawerContent;
  openEventDrawer: (provenanceId: string, raw?: RawLog, norm?: NormalizedLog) => void;
  openSourceDrawer: (source: Source) => void;
  openProfileDrawer: (profile: SourceProfile) => void;
  openCustomDrawer: (title: string, content: ReactNode, subtitle?: string) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  content: null,
  openEventDrawer: () => {},
  openSourceDrawer: () => {},
  openProfileDrawer: () => {},
  openCustomDrawer: () => {},
  closeDrawer: () => {},
});

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<DrawerContent>(null);

  const openEventDrawer = (provenanceId: string, raw?: RawLog, norm?: NormalizedLog) => {
    setContent({ type: "event", provenanceId, rawLog: raw, normalizedLog: norm });
  };

  const openSourceDrawer = (source: Source) => {
    setContent({ type: "source", source });
  };

  const openProfileDrawer = (profile: SourceProfile) => {
    setContent({ type: "profile", profile });
  };

  const openCustomDrawer = (title: string, customContent: ReactNode, subtitle?: string) => {
    setContent({ type: "custom", title, subtitle, content: customContent });
  };

  const closeDrawer = () => {
    setContent(null);
  };

  return (
    <DrawerContext.Provider
      value={{
        isOpen: content !== null,
        content,
        openEventDrawer,
        openSourceDrawer,
        openProfileDrawer,
        openCustomDrawer,
        closeDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
