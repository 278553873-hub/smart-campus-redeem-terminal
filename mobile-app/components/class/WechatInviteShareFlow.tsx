import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, FolderInput, MessageCircle, Mic, Search, Smile, Trophy } from 'lucide-react';
import MobileWechatAppScreen from '../ui/MobileWechatAppScreen';
import { ASSETS } from '../../assets/images';
import { WECHAT_RECENT_FORWARD_CHAT_IDS, WECHAT_SHARE_CHATS, type WechatShareChat } from '../../data/wechatShareChats';

interface WechatInviteShareFlowProps {
  open: boolean;
  /** 被邀请加入的班级或团队名称。 */
  targetName: string;
  onClose: () => void;
  onSent: () => void;
}

type ShareStep = 'picker' | 'confirm';

/** 微信官方小程序分享卡片的主图，用产品既有的长颈鹿插画表达「邀请老师加入」。 */
const CARD_COVER = ASSETS.DEFAULT_STATE.BOARD;
const SENT_TOAST_DURATION = 1200;

const ChatAvatar = ({ chat, className }: { chat: WechatShareChat; className: string }) => {
  if (chat.kind === 'fileTransfer') {
    return (
      <span className={`flex shrink-0 items-center justify-center bg-[var(--tm-platform-wechat)] ${className}`}>
        <FolderInput className="h-1/2 w-1/2 text-white" strokeWidth={2} />
      </span>
    );
  }

  return (
    <span className={`flex shrink-0 overflow-hidden bg-[#E7E7E7] ${className}`}>
      {chat.avatars.length > 1 ? (
        <span className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[1px]">
          {chat.avatars.slice(0, 4).map((avatar, index) => (
            <img key={`${chat.id}-avatar-${index}`} src={avatar} alt="" className="h-full w-full object-cover" />
          ))}
        </span>
      ) : (
        <img src={chat.avatars[0]} alt="" className="h-full w-full object-cover" />
      )}
    </span>
  );
};

const ChatLabel = ({ chat, className }: { chat: WechatShareChat; className: string }) => (
  <span className={className}>
    {chat.name}
    {chat.memberCount ? <span className="ml-[2px] text-[15px] text-[#B0B0B0]">（{chat.memberCount}人）</span> : null}
  </span>
);

/**
 * 「通过微信邀请」的微信原生分享仿真。
 *
 * 老师点「通过微信邀请」后不应该停在小程序内自建的聊天列表里，
 * 而是跳到微信：先在选择聊天页挑接收人，再在发送给半屏里确认发送小程序卡片。
 * 这里完整还原这两个微信原生界面，让演示与实际使用一致。
 */
const WechatInviteShareFlow: React.FC<WechatInviteShareFlowProps> = ({ open, targetName, onClose, onSent }) => {
  const [step, setStep] = useState<ShareStep>('picker');
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const onCloseRef = useRef(onClose);
  const onSentRef = useRef(onSent);
  onCloseRef.current = onClose;
  onSentRef.current = onSent;

  const recentChats = useMemo(
    () => WECHAT_RECENT_FORWARD_CHAT_IDS
      .map(id => WECHAT_SHARE_CHATS.find(chat => chat.id === id))
      .filter((chat): chat is WechatShareChat => Boolean(chat)),
    [],
  );
  const selectedChats = useMemo(
    () => selectedChatIds
      .map(id => WECHAT_SHARE_CHATS.find(chat => chat.id === id))
      .filter((chat): chat is WechatShareChat => Boolean(chat)),
    [selectedChatIds],
  );

  useEffect(() => {
    if (!open) {
      setSent(false);
      return;
    }
    setStep('picker');
    setMultiSelect(false);
    setSelectedChatIds([]);
    setSent(false);
  }, [open]);

  useEffect(() => {
    if (!sent) return undefined;
    const timer = window.setTimeout(() => onSentRef.current(), SENT_TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [sent]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (step === 'confirm') setStep('picker');
      else onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, step]);

  const toggleChat = (chatId: string) => {
    setSelectedChatIds(current => (
      current.includes(chatId) ? current.filter(id => id !== chatId) : [...current, chatId]
    ));
  };

  const openConfirmSheet = (chat: WechatShareChat) => {
    if (multiSelect) {
      toggleChat(chat.id);
      return;
    }
    setSelectedChatIds([chat.id]);
    setStep('confirm');
  };

  const confirmMultiSelection = () => {
    if (selectedChatIds.length === 0) return;
    setStep('confirm');
  };

  const backToPicker = () => setStep('picker');

  return (
    <MobileWechatAppScreen open={open} label="微信选择聊天">
      <div className="absolute inset-0 flex flex-col pt-[var(--wechat-status-bar-height)]">
        <header className="relative flex h-11 shrink-0 items-center justify-between px-4">
          <button type="button" onClick={onClose} className="flex min-h-[44px] min-w-[44px] items-center text-[17px] text-[#191919]">关闭</button>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-[#191919]">选择聊天</span>
          {multiSelect ? (
            <button
              type="button"
              onClick={confirmMultiSelection}
              disabled={selectedChatIds.length === 0}
              className="flex min-h-[44px] min-w-[44px] items-center justify-end text-[17px] text-[#191919] disabled:opacity-35"
            >
              完成
            </button>
          ) : (
            <button type="button" onClick={() => setMultiSelect(true)} className="flex min-h-[44px] min-w-[44px] items-center justify-end text-[17px] text-[#191919]">多选</button>
          )}
        </header>

        <div className="mt-1 shrink-0 px-2">
          <div className="flex h-9 items-center justify-center gap-1 rounded-[8px] bg-white text-[17px] text-[#B2B2B2]">
            <Search className="h-[15px] w-[15px]" strokeWidth={2.5} aria-hidden="true" />
            搜索
          </div>
        </div>

        <section className="mt-8 shrink-0 px-3">
          <h2 className="text-[15px] font-semibold text-[#191919]">最近转发</h2>
          <div className="mt-3 flex gap-4 overflow-hidden">
            {recentChats.map(chat => (
              <button
                key={chat.id}
                type="button"
                onClick={() => openConfirmSheet(chat)}
                className="w-14 shrink-0 text-center"
              >
                <ChatAvatar chat={chat} className="mx-auto h-14 w-14 rounded-[8px]" />
                <span className="mt-2 line-clamp-2 text-[13px] leading-4 text-[#7F7F7F]">{chat.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-0 mt-[30px] flex min-h-0 flex-1 flex-col">
          <div className="flex h-[33px] shrink-0 items-center justify-between bg-[#F7F7F7] pl-4 pr-3">
            <h2 className="text-[15px] font-semibold text-[#191919]">最近聊天</h2>
            <div className="flex items-center gap-2 text-[13px] text-[#4C5871]">
              <span>创建聊天</span>
              <span className="text-[#C7C7C7]">|</span>
              <span>转到企业微信</span>
              <span className="ml-2">其他应用</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
            {WECHAT_SHARE_CHATS.map((chat, index) => {
              const selected = selectedChatIds.includes(chat.id);
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => openConfirmSheet(chat)}
                  aria-pressed={multiSelect ? selected : undefined}
                  className={`flex h-[63px] w-full items-center gap-3 border-b-[0.5px] border-[#DCDCDC] px-4 text-left ${index === 0 ? 'bg-[#F7F7F7]' : 'bg-white'} active:bg-[#F2F2F2]`}
                >
                  <ChatAvatar chat={chat} className="h-10 w-10 rounded-[5px]" />
                  <ChatLabel chat={chat} className="min-w-0 flex-1 truncate text-[17px] text-[#191919]" />
                  {multiSelect && (
                    <span
                      aria-hidden="true"
                      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-platform-wechat)] bg-[var(--tm-platform-wechat)] text-white' : 'border-[#D8D8D8]'}`}
                    >
                      {selected && <Check className="h-[14px] w-[14px]" strokeWidth={3} />}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="flex h-[52px] items-center gap-3 bg-white px-5">
              <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#E7E7E7] text-[#8C8C8C]">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="flex-1 text-[17px] text-[#191919]">折叠的聊天</span>
              <ChevronRight className="h-5 w-5 text-[#C7C7C7]" aria-hidden="true" />
            </div>
          </div>
        </section>
      </div>

      {step === 'confirm' && !sent && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <button type="button" aria-label="取消发送" onClick={backToPicker} className="absolute inset-0 bg-black/50" />
          <section
            role="dialog"
            aria-label="发送给"
            className="relative flex h-[527px] w-full flex-col rounded-t-[12px] bg-[#EEEEEE] px-6 pt-6"
          >
            <h3 className="text-[17px] font-bold text-[#191919]">发送给</h3>

            <div className="mt-[18px] space-y-3">
              {selectedChats.map(chat => (
                <div key={`sent-to-${chat.id}`} className="flex items-center gap-3">
                  <ChatAvatar chat={chat} className="h-[46px] w-[46px] rounded-[6px]" />
                  <ChatLabel chat={chat} className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[#191919]" />
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7C7]" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="mx-auto mt-5 w-[172px] rounded-[6px] bg-white p-[5px] [box-shadow:0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-1 text-[10px] leading-none text-[#8A8A8A]">
                <Trophy className="h-[11px] w-[11px]" aria-hidden="true" />
                AI素养评价
              </div>
              <div className="mt-[6px] text-[12px] font-semibold leading-[17px] text-[#191919]">邀请你加入【{targetName}】</div>
              <div className="relative mt-[6px] h-[125px] overflow-hidden rounded-[4px] bg-gradient-to-b from-[#FDF7EC] to-[#FCF2DA]">
                <img src={CARD_COVER} alt="" className="absolute -right-1 bottom-0 h-[100px] w-auto max-w-none object-contain" />
                <div className="relative pl-[10px] pt-[42px]">
                  <div className="text-[17px] font-bold text-[#40331F]">邀请老师加入</div>
                  <div className="mt-2 flex h-[26px] w-[104px] items-center justify-center rounded-full bg-[#F6AB1E] text-[13px] font-bold text-white">立即加入</div>
                </div>
              </div>
              <div className="mt-[6px] flex items-center gap-1 text-[10px] leading-none text-[#8A8A8A]">
                <span className="flex h-[11px] w-[11px] items-center justify-center rounded-full border border-[#B2B2B2]" aria-hidden="true">
                  <span className="h-[3px] w-[3px] rounded-full bg-[#B2B2B2]" />
                </span>
                小程序
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-11 min-w-0 flex-1 items-center rounded-[8px] bg-white pl-[10px] pr-[6px]">
                <input
                  type="text"
                  aria-label="发消息"
                  placeholder="发消息"
                  className="min-w-0 flex-1 bg-transparent text-[17px] text-[#191919] outline-none placeholder:text-[#B2B2B2]"
                />
                <Mic className="h-5 w-5 shrink-0 text-[#5A5A5A]" aria-hidden="true" />
              </div>
              <Smile className="h-[26px] w-[26px] shrink-0 text-[#5A5A5A]" aria-hidden="true" />
            </div>

            <div className="mx-auto mt-6 flex w-[250px] gap-[10px]">
              <button type="button" onClick={backToPicker} className="h-[46px] flex-1 rounded-[8px] bg-[#E1E1E1] text-[17px] text-[#191919] active:bg-[#D5D5D5]">取消</button>
              <button
                type="button"
                onClick={() => setSent(true)}
                className="h-[46px] flex-1 rounded-[8px] bg-[var(--tm-platform-wechat)] text-[17px] font-semibold text-white active:bg-[var(--tm-platform-wechat-pressed)]"
              >
                发送
              </button>
            </div>
          </section>
        </div>
      )}

      {sent && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div role="status" aria-live="polite" className="flex h-[120px] w-[120px] flex-col items-center justify-center gap-2 rounded-[10px] bg-black/65">
            <Check className="h-9 w-9 text-white" strokeWidth={3} aria-hidden="true" />
            <span className="text-[16px] text-white">已发送</span>
          </div>
        </div>
      )}
    </MobileWechatAppScreen>
  );
};

export default WechatInviteShareFlow;
