import React from 'react';
import universalBase from './assets/pet-universal-base-v1.png';

/** 第一期通用云石底座；独立于角色运动层，所有已孵化阶段共用。 */
export default function PetHabitat() {
  return (
    <img aria-hidden="true" alt="" src={universalBase} draggable={false} decoding="async" width={2172} height={724} className="pet-companion-habitat" />
  );
}
