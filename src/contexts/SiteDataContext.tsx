// ─── Site Data Context ──────────────────────────────────────────────────────
// Provides all editable site content to the component tree and exposes update
// functions. Data is persisted to localStorage automatically on every update.

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type SiteData,
  type Dish,
  type OpeningHoursEntry,
  type GalleryItem,
  type SiteTexts,
  type SiteSettings,
  loadSiteData,
  saveSiteData,
  resetSiteData as resetStorage,
  DEFAULT_SITE_DATA,
} from "@/data/siteData";

interface SiteDataContextValue {
  data: SiteData;
  updateDishes: (dishes: Dish[]) => void;
  updateOpeningHours: (hours: OpeningHoursEntry[]) => void;
  updateGallery: (gallery: GalleryItem[]) => void;
  updateTexts: (texts: Partial<SiteTexts>) => void;
  updateSettings: (settings: Partial<SiteSettings>) => void;
  resetToDefaults: () => void;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(DEFAULT_SITE_DATA);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setData(loadSiteData());
  }, []);

  const persist = useCallback((next: SiteData) => {
    setData(next);
    saveSiteData(next);
  }, []);

  const updateDishes = useCallback(
    (dishes: Dish[]) => persist({ ...data, dishes }),
    [data, persist],
  );

  const updateOpeningHours = useCallback(
    (openingHours: OpeningHoursEntry[]) => persist({ ...data, openingHours }),
    [data, persist],
  );

  const updateGallery = useCallback(
    (gallery: GalleryItem[]) => persist({ ...data, gallery }),
    [data, persist],
  );

  const updateTexts = useCallback(
    (partial: Partial<SiteTexts>) =>
      persist({ ...data, texts: { ...data.texts, ...partial } }),
    [data, persist],
  );

  const updateSettings = useCallback(
    (partial: Partial<SiteSettings>) =>
      persist({ ...data, settings: { ...data.settings, ...partial } }),
    [data, persist],
  );

  const resetToDefaults = useCallback(() => {
    resetStorage();
    setData(DEFAULT_SITE_DATA);
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        data,
        updateDishes,
        updateOpeningHours,
        updateGallery,
        updateTexts,
        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }
  return ctx;
}
