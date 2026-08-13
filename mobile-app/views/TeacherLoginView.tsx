import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Info,
  X,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileToast from '../components/ui/MobileToast';

interface TeacherLoginViewProps {
  onLogin: () => void;
}

type LoginSheet = 'wechat' | 'phone' | null;
type PhoneLoginMode = 'sms' | 'password';

const phoneNumberPattern = /^1\d{10}$/;

const wechatLoginButtonClass = 'mx-auto flex h-14 w-full max-w-[300px] items-center justify-center rounded-full bg-[var(--tm-platform-wechat)] px-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition-[transform,background-color,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-platform-wechat-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-55';
const recentLoginButtonClass = 'mx-auto flex h-14 w-full max-w-[300px] flex-col items-center justify-center rounded-full bg-[var(--tm-brand-primary)] px-4 py-2 text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition-[transform,background-color,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-55';
const phoneLoginLinkClass = 'flex min-h-11 items-center justify-center px-4 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)] transition-colors active:text-[var(--tm-brand-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
const sheetPrimaryButtonClass = 'mx-auto flex min-h-12 w-full max-w-[300px] items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition-[transform,background-color,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-55';
const fieldClass = 'h-[52px] w-full rounded-[var(--tm-radius-control)] border border-transparent bg-[var(--tm-bg-surface-soft)] px-4 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] outline-none transition-[border-color,background-color,box-shadow] placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary-soft-strong)] focus:bg-[var(--tm-bg-surface)] focus:ring-2 focus:ring-[var(--tm-brand-primary-soft)]';

const TeacherLoginView: React.FC<TeacherLoginViewProps> = ({ onLogin }) => {
  // Demo convenience only; production login must require explicit user consent.
  const [agreed, setAgreed] = useState(true);
  const [activeSheet, setActiveSheet] = useState<LoginSheet>(null);
  const [phoneLoginMode, setPhoneLoginMode] = useState<PhoneLoginMode>('sms');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const loginTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCountdown(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    if (loginTimerRef.current !== null) window.clearTimeout(loginTimerRef.current);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(''), 1800);
  };

  const openSheet = (sheet: Exclude<LoginSheet, null>) => {
    if (!agreed) {
      showToast('请先阅读并同意隐私保护指引');
      return;
    }
    setFormMessage('');
    setActiveSheet(sheet);
  };

  const closeActiveSheet = () => {
    if (loginTimerRef.current !== null) {
      window.clearTimeout(loginTimerRef.current);
      loginTimerRef.current = null;
    }
    setSubmitting(false);
    setActiveSheet(null);
  };

  const completeLogin = () => {
    setSubmitting(true);
    loginTimerRef.current = window.setTimeout(() => {
      loginTimerRef.current = null;
      onLogin();
    }, 420);
  };

  const loginWithRecentAccount = () => {
    if (!agreed) {
      showToast('请先阅读并同意隐私保护指引');
      return;
    }
    completeLogin();
  };

  const requestVerificationCode = () => {
    if (!phoneNumberPattern.test(phone.trim())) {
      setFormMessage('请输入正确的手机号');
      return;
    }
    setFormMessage('验证码已发送');
    setCountdown(60);
  };

  const submitPhoneLogin = () => {
    if (!phoneNumberPattern.test(phone.trim())) {
      setFormMessage('请输入正确的手机号');
      return;
    }
    if (phoneLoginMode === 'sms' && verificationCode.trim().length < 4) {
      setFormMessage('请输入验证码');
      return;
    }
    if (phoneLoginMode === 'password' && password.length < 6) {
      setFormMessage('密码至少需要 6 位');
      return;
    }
    setFormMessage('');
    completeLogin();
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] antialiased">
      <main className="flex min-h-0 flex-1 flex-col px-[var(--tm-space-6)] pb-[calc(var(--tm-space-5)+env(safe-area-inset-bottom))] pt-[calc(var(--tm-space-8)*4)]">
        <div className="flex flex-col items-center text-center">
          <div className="h-[84px] w-[84px] overflow-hidden rounded-full [box-shadow:var(--tm-shadow-card)]">
            <img
              src={ASSETS.MANAGEMENT.TEACHER_LOGIN_ICON}
              alt="AI素养评价产品图标"
              className="h-full w-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10"
            />
          </div>
          <h1 className="mt-[var(--tm-space-6)] text-balance text-[length:var(--tm-font-size-page-title)] font-bold leading-tight">欢迎使用 AI素养评价</h1>
          <p className="mt-[var(--tm-space-2)] text-pretty text-[length:var(--tm-font-size-body)] font-normal leading-5 text-[var(--tm-text-secondary)]">看见每一个孩子的成长</p>
        </div>

        <div className="mt-[calc(var(--tm-space-8)*2)] flex w-full flex-col items-center">
          <button type="button" onClick={loginWithRecentAccount} disabled={submitting} className={recentLoginButtonClass}>
            <span className="text-[length:var(--tm-font-size-card-title)] font-bold leading-5">最近登录</span>
            <span className="mt-0.5 text-[length:var(--tm-font-size-meta)] font-medium leading-4 opacity-80">190****0000</span>
          </button>
          <button type="button" onClick={() => openSheet('wechat')} disabled={submitting} className={`${wechatLoginButtonClass} mt-[var(--tm-space-3)]`}>
            一键登录
          </button>
          <button type="button" onClick={() => openSheet('phone')} className={phoneLoginLinkClass}>
            手机号登录/注册
          </button>
        </div>

        <label className="mt-auto flex min-h-11 cursor-pointer items-center justify-center gap-2 text-[length:var(--tm-font-size-meta)] leading-5 text-[var(--tm-text-secondary)]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={event => setAgreed(event.target.checked)}
            className="h-4 w-4 shrink-0 accent-[var(--tm-brand-primary)]"
          />
          <span>我已阅读并同意《隐私保护指引》</span>
        </label>
      </main>

      <MobileBottomSheet
        open={activeSheet === 'wechat'}
        title="申请获取并验证你的手机号"
        onClose={closeActiveSheet}
        showHandle={false}
        header={(
          <header className="flex shrink-0 items-center gap-3 bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-5)] pb-[var(--tm-space-3)] pt-[var(--tm-space-6)]">
            <img
              src={ASSETS.MANAGEMENT.TEACHER_LOGIN_ICON}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10"
            />
            <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">AI素养评价</span>
            <Info className="h-5 w-5 shrink-0 text-[var(--tm-text-disabled)]" aria-hidden="true" />
          </header>
        )}
      >
        <div className="-mx-[var(--tm-space-4)] flex min-h-[50vh] flex-col bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-5)] pb-[var(--tm-space-2)]">
          <div className="px-1 pt-[var(--tm-space-4)]">
            <h2 className="text-[length:var(--tm-font-size-page-title)] font-bold leading-tight text-[var(--tm-text-primary)]">申请获取并验证你的手机号</h2>
            <p className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-section-title)] leading-6 text-[var(--tm-text-tertiary)]">用户正常进行授权登录</p>
          </div>

          <div className="mt-[var(--tm-space-6)] overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)]">
            {['152****1332', '199****8610'].map((maskedPhone, index) => (
              <button
                key={maskedPhone}
                type="button"
                onClick={completeLogin}
                disabled={submitting}
                className="relative flex min-h-[82px] w-full flex-col items-center justify-center px-4 text-center transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-[var(--tm-border-subtle)] last:after:hidden active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-55"
              >
                <span className="text-[length:var(--tm-font-size-section-title)] font-medium tabular-nums text-[var(--tm-text-primary)]">{maskedPhone}</span>
                {index === 0 && <span className="mt-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-platform-wechat)]">上次提供</span>}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={closeActiveSheet}
            className="mt-[var(--tm-space-4)] flex min-h-16 w-full items-center justify-center rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-section-title)] font-medium text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
          >
            不允许
          </button>

          <button
            type="button"
            onClick={closeActiveSheet}
            className="mt-auto flex min-h-14 w-full items-center justify-center text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-link)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
          >
            管理号码
          </button>

          {submitting && <span role="status" className="sr-only">正在登录</span>}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={activeSheet === 'phone'}
        title="手机号登录/注册"
        onClose={closeActiveSheet}
        header={(
          <header className="shrink-0 px-4">
            <div className="mx-auto flex h-14 w-full max-w-[300px] items-center justify-between">
              <div className="flex h-full items-center gap-[var(--tm-space-5)]" role="tablist" aria-label="手机号登录方式">
                {([
                  ['sms', '验证码登录'],
                  ['password', '密码登录'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={phoneLoginMode === mode}
                    onClick={() => {
                      setPhoneLoginMode(mode);
                      setFormMessage('');
                    }}
                    className={`relative h-14 text-[length:var(--tm-font-size-section-title)] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${phoneLoginMode === mode ? 'text-[var(--tm-text-primary)] after:bg-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-tertiary)] after:bg-transparent'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={closeActiveSheet} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭手机号登录">
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
        )}
      >
        <div className="mx-auto w-full max-w-[300px] pb-[var(--tm-space-4)] pt-[var(--tm-space-5)]">
          <div className="space-y-[var(--tm-space-4)]">
            <div>
              <label htmlFor="teacher-login-phone" className="sr-only">手机号</label>
              <input
                id="teacher-login-phone"
                value={phone}
                onChange={event => {
                  setPhone(event.target.value.replace(/\D/g, '').slice(0, 11));
                  setFormMessage('');
                }}
                inputMode="tel"
                autoComplete="tel"
                placeholder="请输入手机号"
                className={fieldClass}
              />
            </div>

            {phoneLoginMode === 'sms' ? (
              <div>
                <label htmlFor="teacher-login-code" className="sr-only">验证码</label>
                <span className="flex gap-2">
                  <input
                    id="teacher-login-code"
                    value={verificationCode}
                    onChange={event => {
                      setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      setFormMessage('');
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="请输入验证码"
                    className={`${fieldClass} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={requestVerificationCode}
                    disabled={countdown > 0}
                    className="min-h-[52px] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)] transition-colors active:bg-[var(--tm-brand-primary-soft)] disabled:text-[var(--tm-text-disabled)]"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </span>
              </div>
            ) : (
              <div>
                <label htmlFor="teacher-login-password" className="sr-only">密码</label>
                <span className="relative block">
                  <input
                    id="teacher-login-password"
                    value={password}
                    onChange={event => {
                      setPassword(event.target.value);
                      setFormMessage('');
                    }}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="请输入密码"
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="min-h-9 py-2" aria-live="polite">
            {formMessage && (
              <p role={formMessage === '验证码已发送' ? 'status' : 'alert'} className={`text-[length:var(--tm-font-size-meta)] font-medium ${formMessage === '验证码已发送' ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-status-negative-strong)]'}`}>
                {formMessage}
              </p>
            )}
          </div>

          <button type="button" onClick={submitPhoneLogin} disabled={submitting} className={sheetPrimaryButtonClass}>
            {submitting ? '正在登录...' : phoneLoginMode === 'sms' ? '注册/登录' : '登录'}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileToast message={toastMessage} />
    </div>
  );
};

export default TeacherLoginView;
