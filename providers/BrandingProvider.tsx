import React, { createContext, useContext, useMemo, useState } from 'react';

interface BrandingContextValue {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  defaultLogo: string;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

// --- LOGO CONFIGURATION ---
// SINAESTA-DIGITAL-07122025-09 Design Replication
const SINAESTA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60">
  <text x="10" y="42" font-family="sans-serif" font-weight="900" font-size="36" fill="#143d35">SIN</text>
  <g transform="translate(80, 5)">
    <path d="M15 10 C 15 0, 30 0, 30 10 V 22 C 30 32, 25 35, 20 35" stroke="#143d35" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M10 10 C 10 0, 15 0, 15 10" stroke="#143d35" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="10" cy="10" r="3" fill="#143d35"/>
    <path d="M20 35 L 10 50 H 30 L 20 35" stroke="#143d35" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M20 44 V 48 M 18 46 H 22" stroke="#143d35" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <text x="120" y="42" font-family="sans-serif" font-weight="900" font-size="36" fill="#143d35">ESTA</text>
</svg>`;

const DEFAULT_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(SINAESTA_SVG)}`;

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);

  const value = useMemo(
    () => ({
      logoUrl,
      setLogoUrl,
      defaultLogo: DEFAULT_LOGO
    }),
    [logoUrl]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};
