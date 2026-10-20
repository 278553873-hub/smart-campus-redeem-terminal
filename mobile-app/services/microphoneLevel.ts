/** 将真实时域采样的均方根音量转换为 0–1；静音和底噪保持零。 */
export function getMicrophoneLevel(samples: Float32Array): number {
    if (!samples.length) return 0;
    let energy = 0;
    for (const sample of samples) energy += sample * sample;
    const rms = Math.sqrt(energy / samples.length);
    if (rms < 0.003) return 0;
    return Math.max(0, Math.min(1, (20 * Math.log10(rms) + 52) / 36));
}

interface MeterEnvironment {
    getStream: () => Promise<MediaStream>;
    createContext: () => AudioContext;
    requestFrame: (callback: FrameRequestCallback) => number;
    cancelFrame: (id: number) => void;
}

/** 只分析音量，不播放或保存音频。即使权限回调迟到，stop 后也会释放流。 */
export function startMicrophoneLevel(
    onLevel: (level: number) => void,
    environment: MeterEnvironment = {
        getStream: () => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } }),
        createContext: () => {
            const Constructor = window.AudioContext ?? (window as any).webkitAudioContext;
            return new Constructor();
        },
        requestFrame: callback => requestAnimationFrame(callback),
        cancelFrame: id => cancelAnimationFrame(id),
    },
) {
    let stopped = false;
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    let analyser: AnalyserNode | undefined;
    let frame: number | undefined;
    let smoothLevel = 0;
    const stop = () => {
        if (stopped) return;
        stopped = true;
        if (frame !== undefined) environment.cancelFrame(frame);
        source?.disconnect();
        analyser?.disconnect();
        stream?.getTracks().forEach(track => track.stop());
        if (context && context.state !== 'closed') void context.close().catch(() => {});
        onLevel(0);
    };
    try {
        // 在按下手势内创建并唤醒，兼容需要用户操作才能启动音频的浏览器。
        context = environment.createContext();
        void context.resume().catch(stop);
        void environment.getStream().then(acquired => {
            if (stopped) { acquired.getTracks().forEach(track => track.stop()); return; }
            stream = acquired;
            source = context!.createMediaStreamSource(stream);
            analyser = context!.createAnalyser();
            analyser.fftSize = 1024;
            source.connect(analyser);
            const samples = new Float32Array(analyser.fftSize);
            let lastSample = -Infinity;
            const sample = (time: number) => {
                if (stopped) return;
                if (time - lastSample >= 32) {
                    lastSample = time;
                    analyser!.getFloatTimeDomainData(samples);
                    const level = getMicrophoneLevel(samples);
                    smoothLevel += (level - smoothLevel) * (level > smoothLevel ? 0.65 : 0.28);
                    onLevel(smoothLevel < 0.01 ? 0 : smoothLevel);
                }
                frame = environment.requestFrame(sample);
            };
            frame = environment.requestFrame(sample);
        }).catch(stop);
    } catch {
        // 音量采集不可用时保留静态声纹，不制造虚假的音量反馈。
        stop();
    }
    return stop;
}
