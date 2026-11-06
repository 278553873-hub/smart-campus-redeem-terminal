import React from 'react';
import InitialPetEggScene from './InitialPetEggScene';
import { getPetGrowth } from './petGrowth';
import PetHabitat from './PetHabitat';
import usePetHolographicMotion from './usePetHolographicMotion';
import { PET_STAGE_ARTWORK_SCALE } from './petArtworkPresentation';
import './petArtworkPresentation.css';
import './petCompanionMotion.css';
import aJuvenile from './assets/demo-stages/a-juvenile.png';
import aGrowth from './assets/demo-stages/a-growth.png';
import aMature from './assets/demo-stages/a-mature.png';
import aComplete from './assets/demo-stages/a-complete.png';
import aUltimate from './assets/demo-stages/a-ultimate.png';
import bJuvenile from './assets/demo-stages/b-juvenile.png';
import bGrowth from './assets/demo-stages/b-growth.png';
import bMature from './assets/demo-stages/b-mature.png';
import bComplete from './assets/demo-stages/b-complete.png';
import bUltimate from './assets/demo-stages/b-ultimate.png';

const DEMO_ARTWORK = [
  [aJuvenile, aGrowth, aMature, aComplete, aUltimate],
  [bJuvenile, bGrowth, bMature, bComplete, bUltimate],
];

/** 演示素材按稳定学号分配两条已有路线；生产图片由伙伴数据提供。 */
export default function DemoPetArtwork({ student, growthScore, viewportSize, interactive = true, eggVariant = 'preview' }: {
  student: { id: string; studentNo: string };
  growthScore: number;
  eggVariant?: 'preview' | 'default';
  viewportSize?: number;
  interactive?: boolean;
}) {
  const growth = getPetGrowth(growthScore);
  const sceneRef = usePetHolographicMotion(interactive && growth.stageIndex >= 4);
  const stageSize = `${Math.round(PET_STAGE_ARTWORK_SCALE[growth.stageKey] * 1000) / 10}%`;
  const serial = Math.max(1, Number(student.studentNo.match(/(\d{1,2})$/)?.[1]) || 1);
  const family = Math.floor((serial - 1) / 6) % DEMO_ARTWORK.length;
  const theme = family === 0 ? 'water' : 'forest';
  const artwork = growth.stageIndex > 0 ? DEMO_ARTWORK[family][growth.stageIndex - 1] : undefined;
  return (
    <span className="pet-artwork-frame" data-pet-motion={interactive ? 'interactive' : 'static'} data-pet-stage={growth.stageKey} style={{ width: viewportSize ?? '100%', height: viewportSize ?? '100%' }}>
      <span className="pet-artwork-frame__stage" style={{ width: stageSize, height: stageSize }}>
        {growth.stageIndex === 0 ? <InitialPetEggScene seed={student.id} variant={eggVariant} /> : (
          <span ref={sceneRef} className="pet-companion-scene" data-pet-stage={growth.stageKey} data-pet-theme={theme}>
            <span aria-hidden="true" className="pet-companion-aura" />
            {growth.stageIndex >= 4 && <><span aria-hidden="true" className="pet-companion-holo-light" /><span aria-hidden="true" className="pet-companion-halo" /></>}
            <PetHabitat />
            <span aria-hidden="true" className="pet-companion-contact-shadow" />
            <span className="pet-companion-depth">
              <img src={artwork} alt={growth.stageLabel} draggable={false} decoding="async" className="pet-companion-artwork" />
              {growth.stageIndex === 5 && <span aria-hidden="true" className="pet-companion-foil-sweep" style={{ maskImage: `url("${artwork}")`, WebkitMaskImage: `url("${artwork}")` }} />}
            </span>
            {growth.stageIndex === 5 && <span aria-hidden="true" className="pet-companion-sparks"><i /><i /><i /></span>}
          </span>
        )}
      </span>
    </span>
  );
}
