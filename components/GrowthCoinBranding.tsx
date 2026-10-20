import React, { createContext, useCallback, useContext, useState, useSyncExternalStore } from 'react';
import { DEFAULT_COIN_BRANDING, DEMO_COIN_SCHOOL_ID, getCoinBrandTerms } from '../shared/growthCoinBranding';
import { readCoinBranding, subscribeCoinBranding } from '../shared/growthCoinBrandingStore';

const CoinSchoolContext = createContext(DEMO_COIN_SCHOOL_ID);
export const GrowthCoinScope = ({ schoolId, children }: { schoolId: string; children: React.ReactNode }) => (
  <CoinSchoolContext.Provider value={schoolId}>{children}</CoinSchoolContext.Provider>
);
export const useCoinSchoolId = () => useContext(CoinSchoolContext);
export const useGrowthCoinBranding = (schoolId?: string) => {
  const contextSchoolId = useCoinSchoolId();
  const id = schoolId ?? contextSchoolId;
  return useSyncExternalStore(
    useCallback(listener => subscribeCoinBranding(id, listener), [id]),
    useCallback(() => readCoinBranding(id), [id]),
    useCallback(() => readCoinBranding(id), [id]),
  );
};
export const useGrowthCoinTerms = (schoolId?: string) => getCoinBrandTerms(useGrowthCoinBranding(schoolId));

export const GrowthCoinName = () => <>{useGrowthCoinBranding().name}</>;

export const GrowthCoinIcon = ({ alt = '', ...props }: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>) => {
  const branding = useGrowthCoinBranding();
  const [failedUrl, setFailedUrl] = useState('');
  return <img {...props} style={{ objectFit: 'contain', ...props.style }} src={failedUrl === branding.iconUrl ? DEFAULT_COIN_BRANDING.iconUrl : branding.iconUrl}
    alt={alt ? branding.name : ''} onError={() => setFailedUrl(branding.iconUrl)} />;
};
