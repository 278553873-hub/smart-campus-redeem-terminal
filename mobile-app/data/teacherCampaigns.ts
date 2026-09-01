export type TeacherCampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'ended';
export type TeacherCampaignPublishStatus = 'online' | 'offline';
export type TeacherCampaignFrequency = 'once_per_campaign' | 'once_per_week';
export type TeacherCampaignEdition = 'personal' | 'school' | 'all';
export type TeacherCampaignPersonalScope = 'all' | 'unpaid';
export type TeacherCampaignSchoolScope = 'all' | 'selected';
export type TeacherCampaignRoleScope = 'all' | 'selected';
export type TeacherCampaignPlacement = 'splash' | 'teacher_global_modal';
export type TeacherCampaignPageScope = 'all' | 'selected';
export type TeacherCampaignPage = 'home_log' | 'class_list' | 'me';

export interface TeacherCampaign {
    id: string;
    version: number;
    name: string;
    type: string;
    status: TeacherCampaignStatus;
    publishStatus: TeacherCampaignPublishStatus;
    startAt: string;
    endAt: string;
    edition: TeacherCampaignEdition;
    personalScope?: TeacherCampaignPersonalScope;
    schoolScope: TeacherCampaignSchoolScope;
    schoolIds?: string[];
    roleScope: TeacherCampaignRoleScope;
    roleNames?: string[];
    audienceLabel: string;
    placement: TeacherCampaignPlacement;
    pageScope: TeacherCampaignPageScope;
    pageIds?: TeacherCampaignPage[];
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
        publishStatus: 'online',
        startAt: '2026-08-24T00:00',
        endAt: '2026-09-30T23:59',
        edition: 'school',
        personalScope: undefined,
        schoolScope: 'all',
        roleScope: 'all',
        audienceLabel: '学校版 · 全部学校 · 全部角色',
        placement: 'teacher_global_modal',
        pageScope: 'all',
        pageIds: [],
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
            placement: campaign.placement === 'splash' ? 'splash' : 'teacher_global_modal',
            pageScope: campaign.pageScope ?? 'all',
            pageIds: campaign.pageIds ?? [],
            publishStatus: campaign.publishStatus ?? (campaign.status === 'paused' ? 'offline' : 'online'),
            edition: campaign.edition ?? 'school',
            personalScope: campaign.edition === 'personal' ? (campaign.personalScope ?? 'all') : undefined,
            schoolScope: campaign.schoolScope ?? 'all',
            schoolIds: campaign.schoolIds ?? [],
            roleScope: campaign.roleScope ?? 'all',
            roleNames: campaign.roleNames ?? [],
            frequency: (campaign as { frequency?: string }).frequency === 'once_per_week'
                ? 'once_per_week'
                : 'once_per_campaign',
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
    if (campaign.publishStatus === 'offline') return false;
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
    if (campaign.frequency === 'once_per_week') {
        const getWeekStart = (value: string | Date) => {
            const date = new Date(value);
            const day = (date.getDay() + 6) % 7;
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - day);
            return date.getTime();
        };
        const currentWeek = getWeekStart(new Date());
        return impressions.some(event => getWeekStart(event.createdAt) === currentWeek);
    }
    return false;
};

export interface TeacherCampaignAudienceContext {
    schoolId?: string;
    role?: string;
    isPaidPersonal?: boolean;
    page?: TeacherCampaignPage;
}

const isTeacherCampaignAudienceMatch = (
    campaign: TeacherCampaign,
    edition: TeacherCampaignEdition,
    audience: TeacherCampaignAudienceContext,
) => {
    if (campaign.edition !== 'all' && campaign.edition !== edition) return false;
    const pageMatch = campaign.pageScope === 'all'
        || !audience.page
        || (campaign.pageIds ?? []).includes(audience.page);
    if (edition === 'personal') {
        const personalMatch = campaign.personalScope !== 'unpaid' || audience.isPaidPersonal === false;
        return personalMatch && pageMatch;
    }
    const schoolMatch = campaign.schoolScope === 'all'
        || !audience.schoolId
        || (campaign.schoolIds ?? []).includes(audience.schoolId);
    const roleMatch = campaign.roleScope === 'all'
        || !audience.role
        || (campaign.roleNames ?? []).includes(audience.role);
    return schoolMatch && roleMatch && pageMatch;
};

export const getNextTeacherCampaign = (
    campaigns: TeacherCampaign[],
    teacherId: string,
    edition: TeacherCampaignEdition,
    now = new Date(),
    audience: TeacherCampaignAudienceContext = {},
) => (
    sortTeacherCampaigns(campaigns).find(campaign => (
        campaign.placement === 'teacher_global_modal'
        && isTeacherCampaignAudienceMatch(campaign, edition, audience)
        && isTeacherCampaignEligible(campaign, now)
        && !hasTeacherCampaignImpression(campaign, teacherId)
    )) ?? null
);
