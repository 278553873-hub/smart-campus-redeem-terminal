export type TeacherCampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'ended';
export type TeacherCampaignFrequency = 'once_per_campaign' | 'once_per_day';
export type TeacherCampaignEdition = 'personal' | 'school';

export interface TeacherCampaign {
    id: string;
    version: number;
    name: string;
    type: string;
    status: TeacherCampaignStatus;
    startAt: string;
    endAt: string;
    edition: TeacherCampaignEdition;
    personalScope?: 'all';
    schoolScope: 'all';
    roleScope: 'all';
    audienceLabel: string;
    placement: 'teacher_global_modal';
    priority: number;
    frequency: TeacherCampaignFrequency;
    maxImpressions?: number;
    cooldownHours?: number;
    imageUrl: string;
    imageAlt: string;
    actionTarget?: string;
    createdAt: string;
    updatedAt: string;
    impressions: number;
    clicks: number;
}

export type TeacherCampaignEventType = 'impression' | 'click' | 'close';

export interface TeacherCampaignEvent {
    campaignId: string;
    campaignVersion: number;
    teacherId: string;
    type: TeacherCampaignEventType;
    createdAt: string;
}

export const TEACHER_CAMPAIGNS_STORAGE_KEY = 'teacher-campaigns-v1';
export const TEACHER_CAMPAIGN_EVENTS_STORAGE_KEY = 'teacher-campaign-events-v1';
export const TEACHER_CAMPAIGNS_UPDATED_EVENT = 'teacher-campaigns-updated';

export const DEFAULT_TEACHER_CAMPAIGNS: TeacherCampaign[] = [
    {
        id: 'teachers-day-2026',
        version: 1,
        name: '2026 教师节祝福',
        type: '节日关怀',
        status: 'running',
        startAt: '2026-08-24T00:00',
        endAt: '2026-09-30T23:59',
        edition: 'school',
        personalScope: undefined,
        schoolScope: 'all',
        roleScope: 'all',
        audienceLabel: '学校版 · 全部学校 · 全部角色',
        placement: 'teacher_global_modal',
        priority: 10,
        frequency: 'once_per_campaign',
        maxImpressions: 1,
        imageUrl: '/assets/avatars/teacher_avatar.png',
        imageAlt: '教师节祝福：感谢老师，老师教师节快乐',
        actionTarget: '/teacher/me',
        createdAt: '2026-08-20T09:00',
        updatedAt: '2026-08-20T09:00',
        impressions: 128,
        clicks: 86,
    },
];

export const readTeacherCampaigns = (): TeacherCampaign[] => {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_CAMPAIGNS;
    try {
        const raw = window.localStorage.getItem(TEACHER_CAMPAIGNS_STORAGE_KEY);
        if (!raw) return DEFAULT_TEACHER_CAMPAIGNS;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_TEACHER_CAMPAIGNS;
        return parsed.map((campaign: TeacherCampaign) => ({
            ...campaign,
            edition: campaign.edition ?? 'school',
            personalScope: campaign.edition === 'personal' ? 'all' : undefined,
            schoolScope: 'all',
            roleScope: 'all',
            frequency: (campaign as { frequency?: string }).frequency === 'once_per_session'
                ? 'once_per_campaign'
                : campaign.frequency,
        }));
    } catch {
        return DEFAULT_TEACHER_CAMPAIGNS;
    }
};

export const writeTeacherCampaigns = (campaigns: TeacherCampaign[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TEACHER_CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    window.dispatchEvent(new CustomEvent(TEACHER_CAMPAIGNS_UPDATED_EVENT));
};

export const isTeacherCampaignEligible = (campaign: TeacherCampaign, now = new Date()) => {
    if (campaign.status !== 'running' && campaign.status !== 'scheduled') return false;
    const start = new Date(campaign.startAt);
    const end = new Date(campaign.endAt);
    return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && now >= start && now <= end;
};

export const sortTeacherCampaigns = (campaigns: TeacherCampaign[]) => [...campaigns].sort((a, b) => (
    b.priority - a.priority
    || new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
    || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
));

const readCampaignEvents = (): TeacherCampaignEvent[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(TEACHER_CAMPAIGN_EVENTS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const recordTeacherCampaignEvent = (
    campaign: TeacherCampaign,
    teacherId: string,
    type: TeacherCampaignEventType,
) => {
    if (typeof window === 'undefined') return;
    const events = readCampaignEvents();
    const nextEvent: TeacherCampaignEvent = {
        campaignId: campaign.id,
        campaignVersion: campaign.version,
        teacherId,
        type,
        createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(TEACHER_CAMPAIGN_EVENTS_STORAGE_KEY, JSON.stringify([...events, nextEvent]));
};

export const hasTeacherCampaignImpression = (campaign: TeacherCampaign, teacherId: string) => {
    const events = readCampaignEvents();
    const impressions = events.filter(event => (
        event.campaignId === campaign.id
        && event.campaignVersion === campaign.version
        && event.teacherId === teacherId
        && event.type === 'impression'
    ));
    if (campaign.frequency === 'once_per_campaign') return impressions.length > 0;
    if (campaign.maxImpressions && impressions.length >= campaign.maxImpressions) return true;
    if (campaign.frequency === 'once_per_day') {
        const today = new Date().toISOString().slice(0, 10);
        return impressions.some(event => event.createdAt.slice(0, 10) === today);
    }
    return false;
};

export const getNextTeacherCampaign = (
    campaigns: TeacherCampaign[],
    teacherId: string,
    edition: TeacherCampaignEdition,
    now = new Date(),
) => (
    sortTeacherCampaigns(campaigns).find(campaign => (
        campaign.placement === 'teacher_global_modal'
        && campaign.edition === edition
        && isTeacherCampaignEligible(campaign, now)
        && !hasTeacherCampaignImpression(campaign, teacherId)
    )) ?? null
);
