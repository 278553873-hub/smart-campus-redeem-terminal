import React, { useEffect, useId, useRef, useState } from 'react';
import { Button, Form, Input, Radio } from '@arco-design/web-react';
import { KeyRound, LockKeyhole, Monitor, QrCode, UserRound } from 'lucide-react';
import { PasswordRevealButton } from '../mobile-app/components/ui/PasswordRevealButton';
import SchoolPcScanLogin from './SchoolPcScanLogin';
import './schoolPcLogin.css';

type LoginMethod = 'password' | 'code';
type LoginView = 'scan' | 'account' | 'verify';

interface SchoolPcLoginProps {
  isSchoolAdministrator: boolean;
  onLogin: (username: string) => void;
}

export default function SchoolPcLogin({ isSchoolAdministrator, onLogin }: SchoolPcLoginProps) {
  const id = useId();
  const [method, setMethod] = useState<LoginMethod>('password');
  const [username, setUsername] = useState('');
  const [credential, setCredential] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<LoginView>('scan');
  const [phoneError, setPhoneError] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginTimer = useRef<number | null>(null);
  const phoneField = useRef<HTMLInputElement | null>(null);
  const credentialField = useRef<HTMLInputElement | null>(null);
  const isPassword = method === 'password';
  const showScan = view !== 'account';
  const isVerifying = view === 'verify';
  const credentialLabel = isPassword ? '密码' : '验证码';
  const messageId = `${id}-credential-message`;
  const scanToggleLabel = showScan ? '切换为账号登录' : '微信扫码更便捷';
  const titleId = `${id}-${view}-title`;
  const completeScan = () => onLogin(isVerifying ? username : '');

  useEffect(() => () => {
    if (loginTimer.current !== null) window.clearTimeout(loginTimer.current);
  }, []);

  const changeMethod = (nextMethod: LoginMethod) => {
    setMethod(nextMethod);
    setCredential('');
    setShowPassword(false);
    setError('');
    setPhoneError(false);
    setDemoCode('');
  };

  const requirePhone = () => {
    if (username.trim()) return true;
    setPhoneError(true);
    phoneField.current?.focus();
    return false;
  };

  const getDemoCode = () => {
    if (!requirePhone()) return;
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    setDemoCode(String(100_000 + random % 900_000));
    setError('');
    credentialField.current?.focus();
  };

  const handleLogin = () => {
    if (loginTimer.current !== null) return;

    if (!requirePhone()) return;

    if (!credential.trim()) {
      setError(`请输入${credentialLabel}`);
      credentialField.current?.focus();
      return;
    }

    setIsLoading(true);
    loginTimer.current = window.setTimeout(() => {
      loginTimer.current = null;
      setIsLoading(false);
      setCredential('');
      setDemoCode('');
      if (isSchoolAdministrator && isPassword) {
        setView('verify');
      } else {
        onLogin(username);
      }
    }, 800);
  };

  return (
    <main className="school-pc-login" lang="zh-CN" aria-labelledby={titleId}>
      <div className="school-pc-login__viewport">
        <div className="school-pc-login__layout">
          <div className="school-pc-login__hero">
            <p className="school-pc-login__hero-title">乐途AI智慧教育<wbr /><span>管理平台</span></p>
            <p className="school-pc-login__hero-slogan">让每一个孩子的成长都被点亮</p>
            <picture>
              <source media="(min-width: 841px)" srcSet="/assets/school-pc-login/ai-workspace-hero.webp" />
              <img width={1536} height={1024} alt="" />
            </picture>
          </div>

          <div className="school-pc-login__panel">
            <Button
              className="school-pc-login__scan-toggle"
              type="text"
              htmlType="button"
              disabled={isLoading}
              onClick={() => {
                setView(showScan ? 'account' : 'scan');
                setShowPassword(false);
              }}
            >
              <span key={scanToggleLabel} className="school-pc-login__scan-hint">{scanToggleLabel}</span>
              <span className="school-pc-login__scan-corner" data-scan-return={showScan} aria-hidden="true">
                {showScan ? <Monitor size={36} strokeWidth={2.3} /> : <QrCode size={46} strokeWidth={2.3} />}
              </span>
            </Button>
            <div className="school-pc-login__content">
              {showScan && (
                <section className="school-pc-login__pane">
                  <h1 id={titleId} className={isVerifying ? 'school-pc-login__verify-title' : undefined}>
                    {isVerifying ? '管理员登录，双重验证' : '微信扫码，安全登录'}
                  </h1>
                  {isVerifying && (
                    <p className="school-pc-login__message school-pc-login__verify-description">
                      账号密码校验通过，为保障系统安全，请扫码完成二次验证
                    </p>
                  )}
                  <SchoolPcScanLogin key={view} mode={isVerifying ? 'verify' : 'login'} onComplete={completeScan} />
                </section>
              )}
              <section className="school-pc-login__pane" inert={showScan}>
                <h1 id={`${id}-account-title`}>欢迎登录</h1>
                <Radio.Group
                  className="school-pc-login__methods"
                  data-method={method}
                  type="button"
                  name={`${id}-method`}
                  aria-label="登录方式"
                  value={method}
                  onChange={changeMethod}
                  disabled={isLoading}
                >
                  <Radio value="password">密码登录</Radio>
                  <Radio value="code">验证码登录</Radio>
                </Radio.Group>

                <Form className="school-pc-login__form" layout="vertical" onSubmit={handleLogin}>
                  <div className="school-pc-login__field">
                    <label htmlFor={`${id}-username`}>手机号</label>
                    <Input
                      ref={(input) => { phoneField.current = input?.dom ?? null; }}
                      id={`${id}-username`}
                      name="username"
                      autoComplete="username"
                      spellCheck={false}
                      value={username}
                      onChange={(next) => {
                        setUsername(next);
                        setPhoneError(false);
                        setDemoCode('');
                      }}
                      placeholder="请输入手机号"
                      prefix={<UserRound size={18} aria-hidden="true" />}
                      aria-invalid={phoneError}
                      aria-describedby={phoneError ? `${id}-phone-error` : undefined}
                      status={phoneError ? 'error' : undefined}
                      disabled={isLoading}
                    />
                    {phoneError && <p id={`${id}-phone-error`} className="school-pc-login__message" data-error="true" role="alert">请输入手机号</p>}
                  </div>

                  <div className="school-pc-login__field">
                    <label htmlFor={`${id}-credential`}>{credentialLabel}</label>
                    <div className="school-pc-login__credential" data-method={method}>
                      <Input
                        key={method}
                        ref={(input) => { credentialField.current = input?.dom ?? null; }}
                        className={isPassword ? 'school-pc-login__password' : undefined}
                        id={`${id}-credential`}
                        name={isPassword ? 'password' : 'verification-code'}
                        type={isPassword && !showPassword ? 'password' : 'text'}
                        autoComplete={isPassword ? 'current-password' : 'one-time-code'}
                        aria-describedby={messageId}
                        aria-invalid={Boolean(error)}
                        aria-required="true"
                        status={error ? 'error' : undefined}
                        value={credential}
                        onChange={(value) => {
                          setCredential(value);
                          setError('');
                        }}
                        placeholder={`请输入${credentialLabel}`}
                        prefix={isPassword ? <LockKeyhole size={18} aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
                        disabled={isLoading}
                      />
                      {isPassword && (
                        <PasswordRevealButton
                          visible={showPassword}
                          onToggle={() => setShowPassword((visible) => !visible)}
                          className="school-pc-login__reveal"
                          size={18}
                        />
                      )}
                      {!isPassword && (
                        <Button className="school-pc-login__get-code" htmlType="button" onClick={getDemoCode} disabled={isLoading}>
                          {demoCode ? '重新获取' : '获取验证码'}
                        </Button>
                      )}
                    </div>
                    <p id={messageId} className="school-pc-login__message" data-error={Boolean(error)} aria-live="polite">
                      {error || (isPassword ? '演示登录可使用任意手机号和密码。' : '演示登录可使用任意手机号和验证码。')}
                      {!error && !isPassword && demoCode && <span className="school-pc-login__demo-code">本次演示验证码 {demoCode}</span>}
                    </p>
                  </div>

                  <Button className="school-pc-login__submit" type="primary" htmlType="submit" long loading={isLoading} disabled={isLoading}>登录</Button>
                </Form>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
