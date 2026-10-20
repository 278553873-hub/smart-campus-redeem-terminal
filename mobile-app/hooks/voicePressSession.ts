interface Recognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: any) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

export function createVoicePressSession(recognition: Recognition, callbacks: {
    submit: (text: string) => void;
    fail: () => void;
    finish: () => void;
}) {
    let released = false;
    let ended = false;
    let closed = false;
    let transcript = '';
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const close = () => {
        closed = true;
        clearTimeout(timeout);
        recognition.onresult = recognition.onerror = recognition.onend = null;
        callbacks.finish();
    };
    const complete = () => {
        if (closed || !released || !ended) return;
        close();
        if (transcript.trim()) callbacks.submit(transcript.trim());
    };
    const fail = () => {
        if (closed) return;
        close();
        try { recognition.abort(); } catch { /* 会话已结束 */ }
        callbacks.fail();
    };
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = event => {
        if (closed) return;
        transcript = Array.from(event.results as ArrayLike<any>)
            .filter(result => result.isFinal !== false)
            .map(result => result[0]?.transcript ?? '').join('');
    };
    recognition.onerror = fail;
    recognition.onend = () => { ended = true; complete(); };
    return {
        start() { try { recognition.start(); } catch { fail(); } },
        release() {
            if (closed || released) return;
            released = true;
            if (ended) { complete(); return; }
            timeout = setTimeout(fail, 8000);
            try { recognition.stop(); } catch { fail(); }
        },
        cancel() {
            if (closed) return;
            close();
            try { recognition.abort(); } catch { /* 会话已结束 */ }
        },
    };
}
