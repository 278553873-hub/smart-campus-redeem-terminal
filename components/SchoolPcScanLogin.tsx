import React, { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@arco-design/web-react';
import QRCode from 'qrcode';

const scanSeconds = 300;
const sessionPath = 'api/school-pc-demo-scan';
const miniProgramCode = '/assets/school-pc-login/wechat-mini-program-code.png';

interface ScanCode {
  image: string;
  expiresAt: number;
}

export default function SchoolPcScanLogin({ onVerified }: { onVerified?: () => void }) {
  const isVerification = Boolean(onVerified);
  const completeVerification = useEffectEvent(() => onVerified?.());
  const [code, setCode] = useState<ScanCode | null>(() => isVerification ? null : {
    image: miniProgramCode,
    expiresAt: Date.now() + scanSeconds * 1_000,
  });
  const [currentTime, setCurrentTime] = useState(Date.now);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const expiresAt = code?.expiresAt;
  const remaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - currentTime) / 1_000)) : null;

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      if (now >= expiresAt) window.clearInterval(timer);
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!isVerification) return;

    const controller = new AbortController();
    const { signal } = controller;
    const endpoint = new URL(sessionPath, document.baseURI);
    let timer: number | undefined;
    let pollToken: string | undefined;

    const checkStatus = async (token: string) => {
      try {
        const response = await fetch(`${endpoint.href}/status`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (signal.aborted) return;
        if (response.status === 410) {
          setCurrentTime(Date.now());
          setError('二维码已失效，点击刷新');
          return;
        }
        if (response.ok && (await response.json()).confirmed) {
          if (!signal.aborted) completeVerification();
          return;
        }
      } catch {
        // 暂时断网时继续等待同一次确认。
      }
      if (!signal.aborted) timer = window.setTimeout(() => void checkStatus(token), 1_000);
    };

    const startVerification = async () => {
      try {
        const response = await fetch(endpoint, { method: 'POST', signal });
        if (response.status !== 201) throw new Error('Failed to start demo verification');
        const session = await response.json();
        pollToken = session.pollToken;
        const now = Date.now();
        const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
        const phonePage = new URL('demos/school-pc-scan-confirm.html', isLocal && session.networkUrl ? session.networkUrl : document.baseURI);
        phonePage.hash = session.scanToken;
        const image = await QRCode.toDataURL(phonePage.href, { width: 448, margin: 4, errorCorrectionLevel: 'M' });
        if (signal.aborted) return;
        setCode({ image, expiresAt: now + session.lifetimeSeconds * 1_000 });
        setCurrentTime(Date.now());
        void checkStatus(session.pollToken);
      } catch {
        if (!signal.aborted) setError('二维码加载失败，点击重试');
      }
    };

    void startVerification();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
      if (pollToken) {
        void fetch(endpoint, { method: 'DELETE', headers: { Authorization: `Bearer ${pollToken}` } }).catch(() => {});
      }
    };
  }, [attempt, isVerification]);

  const refresh = () => {
    const now = Date.now();
    setCurrentTime(now);
    setError('');
    setCode(isVerification ? null : { image: miniProgramCode, expiresAt: now + scanSeconds * 1_000 });
    if (isVerification) setAttempt(current => current + 1);
  };

  return (
    <div className="school-pc-login__scan-body">
      <div className="school-pc-login__scan-image">
        {error || remaining === 0 ? (
          <Button type="text" onClick={refresh}>{error || '刷新二维码'}</Button>
        ) : code ? (
          <img
            src={code.image}
            width={430}
            height={430}
            alt={isVerification ? '管理员验证二维码' : '微信小程序码'}
          />
        ) : (
          <span role="status">正在生成二维码…</span>
        )}
      </div>
      {!error && remaining !== null && (
        remaining > 0
          ? <p className="school-pc-login__scan-countdown" role="timer">有效期剩余 {remaining} 秒</p>
          : <p className="school-pc-login__scan-countdown" role="status">本次扫码已超时</p>
      )}
    </div>
  );
}
