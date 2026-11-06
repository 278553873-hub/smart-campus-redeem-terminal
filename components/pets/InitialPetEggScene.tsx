import React from 'react';
import InitialPetEgg from './InitialPetEgg';
import cloudNest from './assets/cloud-vine-nest.png';
import cloudNestFrontMask from './assets/cloud-vine-nest-front-mask.svg';
import './petEggMotion.css';

interface InitialPetEggSceneProps {
  seed: string;
  variant?: 'preview' | 'default';
}

/** 同一份软巢分前后层托住蛋底，保持蛋与巢素材独立。 */
export default function InitialPetEggScene({ seed, variant = 'preview' }: InitialPetEggSceneProps) {
  return (
    <span aria-hidden="true" className="pointer-events-none relative isolate block aspect-square h-full max-w-full select-none">
      <img
        src={cloudNest}
        alt=""
        draggable={false}
        decoding="async"
        className="absolute bottom-0 left-[2%] w-[96%]"
      />
      <InitialPetEgg seed={seed} variant={variant} className="pet-egg-artwork absolute -top-[4%] left-0 h-full w-full" />
      <img
        src={cloudNest}
        alt=""
        draggable={false}
        decoding="async"
        className="absolute bottom-0 left-[2%] w-[96%]"
        style={{
          // 沿云朵轮廓完整遮挡，避免渐变透明叠加造成蛋壳重影。
          maskImage: `url("${cloudNestFrontMask}")`,
          WebkitMaskImage: `url("${cloudNestFrontMask}")`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </span>
  );
}
