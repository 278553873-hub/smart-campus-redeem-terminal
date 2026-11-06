import React from 'react';
import neutralEggStar from './assets/neutral-egg-star-glazed.png';
import neutralEggStripe from './assets/neutral-egg-stripe.png';
import courageEggOriginal from './assets/expectation-egg-courage-preview.png';
import courageEggSimplified from './assets/expectation-egg-courage-preview-v2.png';
import courageEggBalanced from './assets/expectation-egg-courage-preview-v3.png';
import loveEggPreview from './assets/expectation-egg-love-preview-v2.png';

import friendshipEgg from './assets/expectation-egg-friendship-preview.png';
import knowledgeEgg from './assets/expectation-egg-knowledge-preview.png';

import innocenceEgg from './assets/expectation-egg-innocence-preview.png';
import honestyEgg from './assets/expectation-egg-honesty-preview.png';

interface InitialPetEggProps {
  seed: string;
  className?: string;
  variant?: 'preview' | 'default';
}

// 美术对比预览：保留原蛋及各特性版本用于对比，按学生标识稳定分配，不覆盖全部蛋。
const PREVIEW_EGGS = [
  { src: neutralEggStar, name: '紫色星纹蛋' },
  { src: neutralEggStripe, name: '橙色条纹蛋' },
  { src: courageEggOriginal, name: '勇气蛋·原纹样' },
  { src: courageEggBalanced, name: '勇气蛋·中间纹样' },
  { src: courageEggSimplified, name: '勇气蛋·简化纹样' },
  { src: loveEggPreview, name: '爱心蛋' },
  { src: friendshipEgg, name: '友情蛋' },
  { src: knowledgeEgg, name: '知识蛋' },
  { src: innocenceEgg, name: '纯真蛋' },
  { src: honestyEgg, name: '诚实蛋' },
];

export default function InitialPetEgg({ seed, className = '', variant = 'preview' }: InitialPetEggProps) {
  const hash = Array.from(seed).reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const eggs = variant === 'default' ? PREVIEW_EGGS.slice(0, 2) : PREVIEW_EGGS;
  const egg = eggs[hash % eggs.length];
  return (
    <img
      src={egg.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className={`object-contain ${className}`}
    />
  );
}
