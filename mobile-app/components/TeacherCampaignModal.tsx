import React from 'react';
import { X } from 'lucide-react';
import type { TeacherCampaign } from '../data/teacherCampaigns';

interface TeacherCampaignModalProps {
    campaign: TeacherCampaign | null;
    onClose: () => void;
    onOpenDetail?: () => void;
}

const TeacherCampaignModal: React.FC<TeacherCampaignModalProps> = ({ campaign, onClose, onOpenDetail }) => {
    if (!campaign) return null;

    return (
        <div className="pointer-events-auto absolute inset-0 z-[1100] flex items-center justify-center bg-black/[0.76] px-5 animate-in fade-in [animation-duration:var(--tm-duration-standard)]">
            <button type="button" className="absolute inset-0" onClick={onClose} aria-label="关闭广告弹窗" />
            <section
                role="dialog"
                aria-modal="true"
                aria-label={campaign.name}
                className="relative z-10 flex max-h-[calc(100dvh-32px)] w-full max-w-[336px] flex-col items-center animate-in zoom-in-95 [animation-duration:var(--tm-duration-panel)]"
            >
                {campaign.actionTarget && onOpenDetail ? (
                    <button
                        type="button"
                        onClick={onOpenDetail}
                        className="block max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                        aria-label={`${campaign.imageAlt}，点击跳转`}
                    >
                        <img src={campaign.imageUrl} alt={campaign.imageAlt} className="mx-auto block h-auto max-h-[70dvh] w-full max-w-full object-contain" />
                    </button>
                ) : (
                    <img src={campaign.imageUrl} alt={campaign.imageAlt} className="mx-auto block h-auto max-h-[70dvh] w-full max-w-full object-contain" />
                )}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="关闭广告弹窗"
                    className="mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-card)] transition active:scale-95 active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </section>
        </div>
    );
};

export default TeacherCampaignModal;
