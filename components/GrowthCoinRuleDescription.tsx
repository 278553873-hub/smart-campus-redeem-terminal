import React from 'react';
import { GROWTH_COIN_MODE_DESCRIPTIONS, type GrowthCoinIssuanceMode } from '../shared/growthCoinRules';

/** 两端共用原文，只强调预算可控度和即时性，不改变措辞与标点。 */
const GrowthCoinRuleDescription: React.FC<{ mode: GrowthCoinIssuanceMode; emphasis?: 'bold' | 'highlight' }> = ({ mode, emphasis = 'bold' }) => (
  <>
    {GROWTH_COIN_MODE_DESCRIPTIONS[mode].split(/(预算可控度[高中]|即时性[低高])/).map((text, index) => (
      index % 2 === 1 ? (
        <strong key={index} className={emphasis === 'highlight'
          ? 'rounded-[var(--tm-text-highlight-radius)] bg-[var(--tm-text-highlight-bg)] px-[var(--tm-text-highlight-padding-inline)] font-medium text-[var(--tm-text-primary)] box-decoration-clone'
          : 'font-bold text-black'}>{text}</strong>
      ) : text
    ))}
  </>
);

export default GrowthCoinRuleDescription;
