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
        <div className="pointer-events-auto absolute inset-0 z-[1100] flex items-center justify-center bg-black/[0.64] px-5 animate-in fade-in [animation-duration:var(--tm-duration-standard)]">
            <button type="button" className="absolute inset-0" onClick={onClose} aria-label="关闭广告弹窗" />
            <section
                role="dialog"
                aria-modal="true"
                aria-label={campaign.name}
                className="relative z-10 w-full max-w-[336px] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-sheet)] animate-in zoom-in-95 [animation-duration:var(--tm-duration-panel)]"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="关闭广告弹窗"
                    className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm active:bg-black/40"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
                {campaign.actionTarget && onOpenDetail ? (
                    <button
                        type="button"
                        onClick={onOpenDetail}
                        className="block w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                        aria-label={`${campaign.imageAlt}，点击跳转`}
                    >
                        <img src={campaign.imageUrl} alt={campaign.imageAlt} className="mx-auto block max-h-[70dvh] max-w-full object-contain" />
                    </button>
                ) : (
                    <img src={campaign.imageUrl} alt={campaign.imageAlt} className="mx-auto block max-h-[70dvh] max-w-full object-contain" />
                )}
            </section>
        </div>
    );
};

export default TeacherCampaignModal;
