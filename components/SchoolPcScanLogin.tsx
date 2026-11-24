import React, { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@arco-design/web-react';
import QRCode from 'qrcode';

const sessionPath = 'api/school-pc-demo-scan';

interface ScanCode {
  image: string;
  expiresAt: number;
}

export default function SchoolPcScanLogin({ mode, onComplete }: { mode: 'login' | 'verify'; onComplete: () => void }) {
  const completeScan = useEffectEvent(() => onComplete());
  const [code, setCode] = useState<ScanCode | null>(null);
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
    const controller = new AbortController();
    const { signal } = controller;
    const endpoint = new URL(sessionPath, document.baseURI);
    const startUrl = new URL(endpoint);
    startUrl.searchParams.set('mode', mode);
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
          if (!signal.aborted) completeScan();
          return;
        }
      } catch {
        // 暂时断网时继续等待同一次确认。
      }
      if (!signal.aborted) timer = window.setTimeout(() => void checkStatus(token), 1_000);
    };

    const startScan = async () => {
      try {
        const response = await fetch(startUrl, { method: 'POST', signal });
        if (response.status !== 201) throw new Error('Failed to start demo login session');
        const session = await response.json();
        pollToken = session.pollToken;
        const now = Date.now();
        const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
        const phonePage = new URL('demos/school-pc-scan-confirm.html', isLocal && session.networkUrl ? session.networkUrl : document.baseURI);
        if (mode === 'login') phonePage.searchParams.set('mode', mode);
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

    void startScan();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
      if (pollToken) {
        void fetch(endpoint, { method: 'DELETE', headers: { Authorization: `Bearer ${pollToken}` } }).catch(() => {});
      }
    };
  }, [attempt, mode]);

  const refresh = () => {
    setError('');
    setCode(null);
    setAttempt(current => current + 1);
  };

  return (
    <div className="school-pc-login__scan-body">
      <div className="school-pc-login__scan-image">
        {error || remaining === 0 ? (
          <Button type="text" onClick={refresh}>{error || '刷新二维码'}</Button>
        ) : code ? (
          <img
            src={code.image}
            width={448}
            height={448}
            alt={mode === 'verify' ? '管理员验证二维码' : '微信扫码登录二维码'}
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
