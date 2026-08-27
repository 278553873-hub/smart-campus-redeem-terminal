import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Copy, Download, Link, MessageCircle, QrCode, Send } from 'lucide-react';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import type { ClassInfo } from '../../types';
import { copyText } from '../../utils/copyText';

export type ClassInviteAudience = 'teacher' | 'parent';
type InviteStep = 'methods' | 'wechat-select' | 'wechat-confirm' | 'qr' | 'link';

interface ClassInviteFlowProps {
  open: boolean;
  audience: ClassInviteAudience;
  classInfo?: ClassInfo;
  studentTeam?: { id: string; name: string };
  inviterName: string;
  schoolName: string;
  onClose: () => void;
}

const actionClass = 'flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]';
const iconClass = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]';
const primaryButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]';

const ClassInviteFlow: React.FC<ClassInviteFlowProps> = ({ open, audience, classInfo, studentTeam, inviterName, schoolName, onClose }) => {
  const [step, setStep] = useState<InviteStep>('methods');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('methods');
    setSelectedChats([]);
    setCopySuccess(false);
    setSent(false);
  }, [audience, classInfo?.id, open, studentTeam?.id]);

  const inviter = inviterName.endsWith('老师') ? inviterName : `${inviterName}老师`;
  const targetName = studentTeam?.name ?? classInfo?.name ?? '';
  const targetCode = studentTeam?.id ?? classInfo?.classCode ?? '';
  const isStudentTeamInvite = Boolean(studentTeam);
  const title = isStudentTeamInvite ? '邀请协作老师' : audience === 'teacher' ? '邀请老师加入' : '邀请家长加入';
  const qrAsset = audience === 'teacher' ? '/assets/ai_literacy_qr.png' : '/assets/compass_qr.png';
  const inviteText = isStudentTeamInvite
    ? `${inviter}邀请你成为「${targetName}」的协作老师，共同评价团队学生。点击链接 ai-literacy://join-team?code=${targetCode}，直接加入。`
    : audience === 'teacher'
      ? `${inviter}邀请你加入「${targetName}」，共同参与班级管理。点击链接 ai-literacy://join-class?code=${targetCode}，直接加入班级。`
      : `家长您好，${inviter}邀请您绑定「${targetName}」的学生，查看孩子的日常评价记录和成长报告。点击链接 ai-literacy://bind-student?code=${targetCode}，直接完成绑定。`;
  const qrText = isStudentTeamInvite
    ? `${inviter}邀请你成为「${targetName}」的协作老师，微信扫描二维码即可加入。`
    : audience === 'teacher'
      ? `${inviter}邀请你加入「${targetName}」，微信扫描二维码即可加入班级。`
      : `家长您好，${inviter}邀请您绑定「${targetName}」的学生，微信扫描二维码即可完成绑定。`;
  const chats = useMemo(() => ['陈老师', '一年级备课组', '李老师', '王老师'], []);

  const closeFlow = () => {
    setStep('methods');
    onClose();
  };

  const backToMethods = () => {
    setCopySuccess(false);
    setSent(false);
    setStep('methods');
  };

  const handleCopy = async () => {
    const success = await copyText(inviteText);
    setCopySuccess(success);
  };

  const toggleChat = (chat: string) => {
    setSelectedChats(current => current.includes(chat) ? current.filter(item => item !== chat) : [...current, chat]);
  };

  const sheetTitle = step === 'methods'
    ? title
    : step === 'wechat-select'
      ? '选择聊天'
      : step === 'wechat-confirm'
        ? '确认发送'
        : step === 'qr'
          ? '二维码邀请'
          : '链接邀请';

  return (
    <MobileBottomSheet open={open} title={sheetTitle} onClose={closeFlow}>
      {step !== 'methods' && (
        <button type="button" onClick={backToMethods} className="mb-[var(--tm-space-2)] flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] pr-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <ChevronLeft className="h-4 w-4" />返回邀请方式
        </button>
      )}

      {step === 'methods' && (
        <div className="space-y-[var(--tm-space-2)]">
          {audience === 'teacher' && (
            <button type="button" onClick={() => setStep('wechat-select')} className={actionClass}>
              <span className={iconClass}><MessageCircle className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1">通过微信邀请</span>
              <span className="rounded-full bg-[var(--tm-brand-reward-soft)] px-[var(--tm-space-2)] py-[var(--tm-space-1)] text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-brand-reward-strong)]">推荐</span>
            </button>
          )}
          <button type="button" onClick={() => setStep('qr')} className={actionClass}>
            <span className={iconClass}><QrCode className="h-[18px] w-[18px]" /></span>
            二维码邀请
          </button>
          <button type="button" onClick={() => setStep('link')} className={actionClass}>
            <span className={iconClass}><Link className="h-[18px] w-[18px]" /></span>
            通过链接邀请
          </button>
        </div>
      )}

      {step === 'wechat-select' && (
        <div>
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            {chats.map(chat => {
              const selected = selectedChats.includes(chat);
              return (
                <button key={chat} type="button" onClick={() => toggleChat(chat)} className={`flex min-h-[56px] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-inner)] px-[var(--tm-space-3)] text-left text-[length:var(--tm-font-size-body)] font-semibold ${selected ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)]'}`} aria-pressed={selected}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-compact)] [box-shadow:var(--tm-shadow-control)]">{chat.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1 truncate">{chat}</span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={selectedChats.length === 0} onClick={() => setStep('wechat-confirm')} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}>
            下一步{selectedChats.length > 0 ? `（${selectedChats.length}）` : ''}
          </button>
        </div>
      )}

      {step === 'wechat-confirm' && (
        <div>
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)]">
            <div className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">发送给</div>
            <div className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{selectedChats.join('、')}</div>
            <div className="mt-[var(--tm-space-4)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-control)]">
              <div className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">AI素养评价</div>
              <div className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{inviter}邀请你加入「{targetName}」</div>
            </div>
          </div>
          <button type="button" onClick={() => setSent(true)} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}>
            {sent ? <Check className="h-[18px] w-[18px]" /> : <Send className="h-[18px] w-[18px]" />}
            {sent ? '已发送' : '发送'}
          </button>
        </div>
      )}

      {step === 'qr' && (
        <div>
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)] text-center">
            <div className="text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{audience === 'teacher' ? '加入AI素养评价' : '绑定学生'}</div>
            <img src={qrAsset} alt={audience === 'teacher' ? 'AI素养评价小程序二维码' : '素养指南针小程序二维码'} className="mx-auto mt-[var(--tm-space-4)] aspect-square w-40 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] object-contain p-[var(--tm-space-3)]" />
            <p className="mt-[var(--tm-space-4)] text-left text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">{qrText}</p>
          </div>
          <a href={qrAsset} download={`${targetName}-${audience === 'teacher' ? '老师' : '家长'}邀请.png`} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}>
            <Download className="h-[18px] w-[18px]" />保存图片
          </a>
        </div>
      )}

      {step === 'link' && (
        <div>
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">{inviteText}</div>
          <div className="mt-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{schoolName}</div>
          <button type="button" onClick={handleCopy} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}>
            {copySuccess ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
            {copySuccess ? '已复制邀请文案' : '复制邀请文案'}
          </button>
        </div>
      )}
    </MobileBottomSheet>
  );
};

export default ClassInviteFlow;
