import React from 'react';
import { CalendarRange, Camera, MessageCircle, Settings, SlidersHorizontal } from 'lucide-react';
import { ASSETS } from '../assets/images';
import { ToolGrid, ToolSection, type MenuEntry } from '../components/me/TeacherMeTools';
import type { TeacherDossier } from './data';

export type MeFeature = 'profile' | 'principal' | 'personal' | 'feedback' | 'indicator-settings' | 'period-settings';
export const ME_FEATURE_TITLES: Record<MeFeature, string> = { profile: '个人信息设置', principal: 'AI 校长助理', personal: 'AI 个人助理', feedback: '建议反馈', 'indicator-settings': '指标设置', 'period-settings': '考核周期设置' };
export const requiresManagementAccess = (feature: MeFeature | null) => feature === 'principal' || feature === 'indicator-settings' || feature === 'period-settings';
interface Props {
  teacher: TeacherDossier;
  avatar?: string;
  onOpen: (feature: MeFeature) => void;
}

export default function DevelopmentMeView({ teacher, avatar, onOpen }: Props) {
  const management: MenuEntry[] = [
    ...(teacher.manager ? [{ id: 'principal', title: 'AI 校长助理', labelLines: ['校长助理'], imageSrc: ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT, onClick: () => onOpen('principal') } as MenuEntry] : []),
    { id: 'personal', title: 'AI 个人助理', labelLines: ['个人助理'], imageSrc: ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT, onClick: () => onOpen('personal') },
  ].map(item => ({ ...item, plainImage: true, imageAlt: '', imageClassName: 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover', imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE }));
  const more: MenuEntry[] = [
    ...(teacher.manager ? [
      { id: 'indicator-settings', title: '指标设置', icon: SlidersHorizontal, onClick: () => onOpen('indicator-settings') },
      { id: 'period-settings', title: '考核周期设置', labelLines: ['考核周期'], icon: CalendarRange, onClick: () => onOpen('period-settings') },
    ] : []),
    { id: 'feedback', title: '建议反馈', icon: MessageCircle, onClick: () => onOpen('feedback') },
  ];
  return <div className="relative bg-transparent font-sans text-[var(--tm-text-primary)]">
    <div className="relative px-5 pt-5">
      <div className="relative flex min-h-[132px] items-center">
        <div className="relative flex w-full items-start gap-4">
          <button type="button" onClick={() => onOpen('profile')} className="relative shrink-0 rounded-full text-left" aria-label="设置头像和个人信息">
            <div className="h-20 w-20 rounded-full bg-[linear-gradient(145deg,var(--tm-bg-surface),var(--tm-brand-primary-soft-strong),var(--tm-brand-secondary-soft))] p-[3px] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
              <img src={avatar || ASSETS.AVATAR.TEACHER_DEFAULT} alt="" className="h-full w-full rounded-full bg-white object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-icon)]" aria-hidden="true"><Camera className="h-4 w-4" strokeWidth={2.3} /></span>
          </button>
          <div className="min-w-0 flex-1 pr-8 pt-3">
            <button type="button" onClick={() => onOpen('profile')} className="flex min-h-11 max-w-full items-center text-left" aria-label="个人信息设置"><h2 className="truncate text-[22px] font-extrabold leading-tight tracking-tight">{teacher.name}</h2></button>
            <span className="mt-2 inline-flex min-h-7 max-w-full items-center rounded-full bg-[var(--tm-bg-surface-glass)] px-3 text-[13px] font-medium [box-shadow:var(--tm-shadow-control)]"><span className="truncate">{teacher.school}</span></span>
          </div>
          <button type="button" onClick={() => onOpen('profile')} className="absolute right-0 top-6 flex h-11 w-11 items-center justify-end text-[var(--tm-text-secondary)]" aria-label="个人信息设置"><Settings className="h-[22px] w-[22px]" strokeWidth={2.2} /></button>
        </div>
      </div>
    </div>
    <div className="space-y-[var(--tm-layout-card-gap)] px-5">
      <ToolSection title="管理工具"><ToolGrid items={management} /></ToolSection>
      <ToolSection title="更多工具"><ToolGrid items={more} variant="secondary" /></ToolSection>
    </div>
  </div>;
}
