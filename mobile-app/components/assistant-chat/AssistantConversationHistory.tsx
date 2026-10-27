import { ASSISTANT_HISTORY_OPEN_EVENT, ASSISTANT_HISTORY_MODE_EVENT, type AssistantHistoryPreviewMode } from '../../../shared/assistantHistoryPreview';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { History } from 'lucide-react';
import { ASSETS } from '../../assets/images';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import type { AssistantChatMessage } from './AssistantConversationThread';

interface Conversation { id: string; updatedAt: number; messages: AssistantChatMessage[] }
const read = (key: string): Conversation[] => {
    try {
        let value = JSON.parse(localStorage.getItem(key) || '[]');
        if (key === 'teacher-assistant-conversations-v1:headteacher' && localStorage.getItem(key) === null) {
            value = Object.keys(localStorage).filter(entry => entry.startsWith(key + ':')).flatMap(entry => {
                try { const items = JSON.parse(localStorage.getItem(entry) || '[]'); return Array.isArray(items) ? items : []; } catch { return []; }
            });
            value = [...new Map(value.map((item: Conversation) => [item.id, item])).values()].sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt);
        }
        return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && typeof item.updatedAt === 'number' && Array.isArray(item.messages)).map(item => ({ ...item, messages: item.messages.filter((message: AssistantChatMessage) => message.role === 'user' || Boolean(message.answer)) })) : [];
    } catch { return []; }
};

/** 演示版对话存储，按助理隔离。线上需替换为经过身份与权限校验的服务。 */
export function useAssistantConversationHistory<T extends AssistantChatMessage = AssistantChatMessage>(scope: string) {
    const key = 'teacher-assistant-conversations-v1:' + scope;
    const [state, setState] = useState(() => {
        const items = read(key);
        return { key, items, activeId: '', messages: [] as T[] };
    });
    useEffect(() => {
        const items = read(key);
        setState({ key, items, activeId: '', messages: [] as T[] });
    }, [key]);
    const [storageError, setStorageError] = useState(false);
    useEffect(() => {
        if (state.key !== key) return;
        try { localStorage.setItem(key, JSON.stringify(state.items)); setStorageError(false); }
        catch { setStorageError(true); }
    }, [state.items, state.key, key]);
    const setMessages: React.Dispatch<React.SetStateAction<T[]>> = update => setState(current => {
        const messages = typeof update === 'function' ? update(current.messages) : update;
        if (!messages.length) return { ...current, activeId: '', messages };
        const id = current.activeId || 'conversation-' + Date.now();
        const item = { id, updatedAt: Date.now(), messages };
        return { ...current, activeId: id, messages, items: [item, ...current.items.filter(entry => entry.id !== id)] };
    });
    return {
        messages: state.messages, setMessages, items: state.items, activeId: state.activeId, storageError,
        newConversation: () => setState(current => ({ ...current, activeId: '', messages: [] })),
        restore: (id: string) => setState(current => ({ ...current, activeId: id, messages: (current.items.find(item => item.id === id)?.messages || []) as T[] })),
        remove: (id: string) => setState(current => ({ ...current, items: current.items.filter(item => item.id !== id), ...(current.activeId === id ? { activeId: '', messages: [] } : {}) })),
    };
}

type HistoryState = Pick<ReturnType<typeof useAssistantConversationHistory>, 'items' | 'activeId' | 'storageError' | 'newConversation' | 'restore' | 'remove'>;
const previewTitles = [
    '如何帮助上课容易分心的学生？', '推荐一些适合晨会的互动话题', '家长沟通时怎样表达更合适？', '设计一次关于友善的主题班会',
    '学生发生争执时，老师可以怎么引导？', '怎样鼓励不太主动发言的孩子？', '帮我整理一份家访沟通提纲', '推荐适合小学生的阅读活动',
    '如何让课堂反馈更具体？', '帮我润色一段给家长的通知', '设计一份学生自我反思清单', '如何培养学生的时间管理习惯？',
];
export default function AssistantConversationHistory({ history, busy, previewEnabled = false }: { history: HistoryState; busy: boolean; previewEnabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<AssistantHistoryPreviewMode>('records');
    const [limit, setLimit] = useState(12);
    const [loading, setLoading] = useState(false);
    const sentinel = useRef<HTMLDivElement>(null);
    const scrollRoot = useRef<HTMLDivElement>(null);
    const demoItems = useMemo(() => Array.from({ length: 60 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - [0, 1, 3, 5, 8, 12, 18, 24, 35, 45, 60, 90][Math.floor(index / 5)]);
        date.setHours(18 - index % 5, 30, 0, 0);
        return { id: 'preview-' + index, updatedAt: +date, messages: [{ id: 'preview-user-' + index, role: 'user' as const, content: previewTitles[index % previewTitles.length] }] };
    }), [open]);
    const items = previewEnabled ? (mode === 'records' ? demoItems : []) : history.items;
    useEffect(() => {
        if (!previewEnabled) return;
        window.dispatchEvent(new CustomEvent(ASSISTANT_HISTORY_OPEN_EVENT, { detail: open }));
        return () => { window.dispatchEvent(new CustomEvent(ASSISTANT_HISTORY_OPEN_EVENT, { detail: false })); };
    }, [open, previewEnabled]);
    useEffect(() => {
        const listener = (event: Event) => setMode((event as CustomEvent<AssistantHistoryPreviewMode>).detail);
        window.addEventListener(ASSISTANT_HISTORY_MODE_EVENT, listener);
        return () => window.removeEventListener(ASSISTANT_HISTORY_MODE_EVENT, listener);
    }, []);
    useEffect(() => { setLimit(12); setLoading(false); if (scrollRoot.current) scrollRoot.current.scrollTop = 0; }, [open, mode]);
    useEffect(() => {
        if (!open || !sentinel.current || limit >= items.length) return;
        const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) setLoading(true); }, { root: scrollRoot.current, rootMargin: '40px' });
        observer.observe(sentinel.current);
        return () => observer.disconnect();
    }, [open, mode, limit, items.length]);
    useEffect(() => {
        if (!loading) return;
        const timer = window.setTimeout(() => { setLimit(value => value + 12); setLoading(false); }, 600);
        return () => window.clearTimeout(timer);
    }, [loading, mode, open]);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bucket = (time: number) => {
        const date = new Date(time); date.setHours(0, 0, 0, 0);
        const days = Math.round((+today - +date) / 86400000);
        return days === 0 ? '今天' : days === 1 ? '昨天' : days < 7 ? '最近7天' : days < 30 ? '最近30天' : `${date.getFullYear()}年`;
    };
    const groups = new Map<string, Conversation[]>();
    items.slice(0, limit).forEach(item => { const label = bucket(item.updatedAt); groups.set(label, [...(groups.get(label) || []), item]); });
    const timeLabel = (time: number) => {
        const label = bucket(time);
        return new Date(time).toLocaleString('zh-CN', label === '今天' || label === '昨天' ? { hour: '2-digit', minute: '2-digit' } : label === '最近7天' ? { weekday: 'long' } : { month: 'numeric', day: 'numeric' });
    };
    return <>
        <button type="button" aria-label="历史对话" title="历史对话" disabled={busy} onClick={() => { setMode('records'); setOpen(true); }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] focus-visible:outline focus-visible:outline-2 disabled:opacity-40"><History size={20} strokeWidth={1.8} aria-hidden="true" /></button>
        {history.storageError && <p role="status" className="mx-5 text-[13px] text-[var(--tm-text-secondary)]">对话暂未保存，请检查浏览器存储空间。</p>}
        <MobileBottomSheet open={open} title="历史对话" size="tall" contentLayout="fill" flushContentBottom onClose={() => setOpen(false)}>
            <div ref={scrollRoot} onScroll={event => {
                const element = event.currentTarget;
                if (!loading && limit < items.length && element.scrollHeight - element.scrollTop - element.clientHeight < 64) setLoading(true);
            }} className="min-h-0 flex-1 overflow-y-auto pb-6 overscroll-contain">
                {!items.length ? <div className="flex flex-col items-center px-5 py-16 text-center">
                    <img src={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD} alt="" className="mb-2 h-40 w-40 object-contain" />
                    <p className="text-[14px] font-normal text-[var(--tm-text-secondary)]">暂无历史对话</p>
                </div> : <>
                    {[...groups].map(([label, entries]) => <section key={label} className="mb-6">
                        <h2 className="mb-2 pt-3 text-[13px] font-normal text-[var(--tm-history-meta-text)]">{label}</h2>
                        {entries.map(item => {
                            const row = <><span className="min-w-0 flex-1 truncate text-[15px] font-normal leading-6">{item.messages.find(message => message.role === 'user')?.content || '历史对话'}</span><span className="shrink-0 text-[12px] text-[var(--tm-history-meta-text)]">{timeLabel(item.updatedAt)}</span></>;
                            return previewEnabled ? <div key={item.id} className="flex min-h-12 items-center gap-4 py-3">{row}</div> : <button key={item.id} type="button" onClick={() => { history.restore(item.id); setOpen(false); }} className="flex min-h-12 w-full items-center gap-4 py-3 text-left">{row}</button>;
                        })}
                    </section>)}
                    <div ref={sentinel} role="status" className="flex min-h-11 items-center justify-center text-[12px] text-[var(--tm-text-secondary)]">{loading ? '正在加载…' : limit >= items.length ? '已显示全部记录' : '上滑加载更多'}</div>
                </>}
            </div>
        </MobileBottomSheet>
    </>;
}
