import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    CameraIcon, MicIcon, ImageIconIcon,
    ChevronRightIcon,
    ArrowRightIcon,
    KeyboardIcon
} from '../components/Icons';
import { VoiceSiriOrbCanvas } from '../components/VoiceSiriOrbCanvas';

interface RecordInputViewProps {
    initialStudentIds: string[]; // From batch selection
    studentNameList: string;
    initialMode?: 'voice' | 'camera' | 'text';
    onClose: () => void;
    onAnalysisComplete: (result: any) => void;
}

type InputMode = 'voice' | 'camera' | 'text';
type MicState = 'idle' | 'listening' | 'fallback' | 'error';

const getAudioContext = () => {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    return AudioContextCtor ? new AudioContextCtor() : null;
};

const RecordInputView: React.FC<RecordInputViewProps> = ({ initialStudentIds, studentNameList, initialMode = 'voice', onClose, onAnalysisComplete }) => {
    const [mode, setMode] = useState<InputMode>(initialMode);
    const [inputText, setInputText] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const [cancelThreshold, setCancelThreshold] = useState(false);
    const [voiceLevel, setVoiceLevel] = useState(0.18);
    const [micState, setMicState] = useState<MicState>('idle');
    const touchStartY = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Timer for recording
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const stopAudioCapture = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        audioContextRef.current?.close().catch(() => undefined);
        audioContextRef.current = null;
        setVoiceLevel(0.18);
    }, []);

    const startAudioCapture = useCallback(async () => {
        stopAudioCapture();
        if (!navigator.mediaDevices?.getUserMedia) {
            setMicState('fallback');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = getAudioContext();
            if (!audioContext) {
                stream.getTracks().forEach(track => track.stop());
                setMicState('fallback');
                return;
            }

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.82;
            audioContext.createMediaStreamSource(stream).connect(analyser);

            mediaStreamRef.current = stream;
            audioContextRef.current = audioContext;
            setMicState('listening');

            const samples = new Uint8Array(analyser.fftSize);
            let smoothLevel = 0.18;
            const tick = () => {
                analyser.getByteTimeDomainData(samples);
                let sum = 0;
                for (const sample of samples) {
                    const centered = (sample - 128) / 128;
                    sum += centered * centered;
                }
                const rms = Math.sqrt(sum / samples.length);
                const normalized = Math.min(1, rms * 5.8);
                smoothLevel = smoothLevel * 0.72 + Math.max(0.1, normalized) * 0.28;
                setVoiceLevel(Number(smoothLevel.toFixed(3)));
                animationFrameRef.current = requestAnimationFrame(tick);
            };
            tick();
        } catch {
            setMicState('error');
            setVoiceLevel(0.22);
        }
    }, [stopAudioCapture]);

    const beginRecording = () => {
        setIsRecording(true);
        setCancelThreshold(false);
        setRecordDuration(0);
        setMicState('idle');
        void startAudioCapture();
    };

    useEffect(() => {
        if (mode === 'voice') {
            beginRecording();
        } else {
            setIsRecording(false);
            setCancelThreshold(false);
            stopAudioCapture();
            touchStartY.current = null;
            if (mode === 'text') {
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            }
        }
        return () => {
            if (mode === 'voice') {
                stopAudioCapture();
            }
        };
    }, [mode, startAudioCapture, stopAudioCapture]);

    const handleSwitchMode = (nextMode: InputMode) => {
        if (nextMode !== 'voice') {
            setIsRecording(false);
            setCancelThreshold(false);
            setRecordDuration(0);
            stopAudioCapture();
            touchStartY.current = null;
        }
        setMode(nextMode);
    };

    const handleCameraCapture = () => {
        // Simulate capture
        setTimeout(() => {
            onAnalysisComplete({
                type: 'camera',
                text: "",
                mockStudents: initialStudentIds
            });
        }, 500);
    };

    const handleGestureStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        if (touchStartY.current !== null) return;
        const point = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        touchStartY.current = point;
    };

    const handlePressMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        if (!isRecording || touchStartY.current === null) return;
        const point = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const delta = touchStartY.current - point;
        setCancelThreshold(delta > 90);
    };

    const finalizePress = useCallback((forceCancel = false) => {
        if (!isRecording) return;
        const shouldCancel = forceCancel || cancelThreshold;
        setIsRecording(false);
        setCancelThreshold(false);
        stopAudioCapture();
        touchStartY.current = null;
        if (shouldCancel) {
            setRecordDuration(0);
            onClose();
            return;
        }

        setTimeout(() => {
            onAnalysisComplete({
                type: 'voice',
                text: "今天数学课，" + (studentNameList || "大家") + "表现都很积极，主动回答问题。",
                mockStudents: initialStudentIds
            });
        }, 300);
    }, [isRecording, cancelThreshold, onAnalysisComplete, initialStudentIds, studentNameList, onClose, stopAudioCapture]);

    useEffect(() => {
        if (!isRecording) return;
        const handleRelease = () => finalizePress();
        const handleCancel = () => finalizePress(true);
        window.addEventListener('mouseup', handleRelease);
        window.addEventListener('touchend', handleRelease);
        window.addEventListener('touchcancel', handleCancel);
        return () => {
            window.removeEventListener('mouseup', handleRelease);
            window.removeEventListener('touchend', handleRelease);
            window.removeEventListener('touchcancel', handleCancel);
        };
    }, [isRecording, finalizePress]);

    const visualVoiceLevel = Math.max(voiceLevel, micState === 'listening' ? 0.24 : 0.34);
    const shouldShowStudentContext = mode !== 'camera' || Boolean(studentNameList) || initialStudentIds.length > 0;
    const studentContextLabel = studentNameList || '未选择学生';

    return (
        <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ${mode === 'camera' ? 'bg-black' : 'teacher-record-soft-page'}`}>

            {/* Top Bar */}
            <div className={`flex justify-between items-center px-4 z-20 h-[104px] pt-[54px] transition-colors shadow-sm ${mode === 'camera' ? 'text-white border-b border-white/10' : 'text-slate-900 bg-white/82 backdrop-blur-xl border-b border-white/70'}`}>
                <div className="flex-1 flex justify-start">
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${mode === 'camera' ? 'bg-white/10 /20' : 'bg-white/80 shadow-sm border border-white/80 '}`}
                    >
                        <div className="rotate-90"><ChevronRightIcon className={`w-5 h-5 ${mode === 'camera' ? 'text-white' : 'text-slate-600'}`} /></div>
                    </button>
                </div>

                <div className="flex flex-none flex-col items-center">
                    {shouldShowStudentContext && (
                        <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${mode === 'camera' ? 'border border-white/10 bg-black/40 backdrop-blur-md' : ''}`}>
                            <span className={`max-w-[150px] truncate text-sm font-bold ${mode === 'camera' ? 'text-white' : 'text-slate-800'}`}>{studentContextLabel}</span>
                            {initialStudentIds.length > 0 && (
                                <span className={`rounded-md px-1.5 text-[11px] font-semibold ${mode === 'camera' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
                                    {initialStudentIds.length}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 w-10"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full overflow-hidden">

                {mode === 'voice' && (
                    <div
                        className="absolute inset-0 flex flex-col overflow-hidden teacher-record-soft-page"
                        onTouchStart={handleGestureStart}
                        onTouchMove={handlePressMove}
                        onMouseDown={handleGestureStart}
                        onMouseMove={handlePressMove}
                    >
                        <div className="pointer-events-none absolute inset-0">
                            <div
                                className="absolute left-1/2 top-[36%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/12 blur-3xl transition-transform duration-150"
                                style={{ transform: `translate(-50%, -50%) scale(${1 + voiceLevel * 0.42})` }}
                            />
                            <div
                                className="absolute left-1/2 top-[50%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0EA5E9]/10 blur-3xl transition-transform duration-150"
                                style={{ transform: `translate(-50%, -50%) scale(${1 + voiceLevel * 0.36})` }}
                            />
                        </div>

                        <div className="relative flex flex-1 flex-col items-center justify-center px-8 pb-28 text-center">
                            <div className="mb-8">
                                <p className={`text-[13px] font-bold tracking-[0.28em] ${cancelThreshold ? 'text-orange-600' : 'text-blue-500'}`}>
                                    {cancelThreshold ? '松开取消' : '正在聆听'}
                                </p>
                                <p className="mt-3 text-xs font-medium leading-relaxed text-slate-400">
                                    {micState === 'error' ? '未获得麦克风权限，已使用演示动效' : '声音越清晰，光球反馈越明显'}
                                </p>
                            </div>

                            <div className="relative flex h-72 w-72 items-center justify-center">
                                <VoiceSiriOrbCanvas
                                    level={visualVoiceLevel}
                                    canceling={cancelThreshold}
                                    className="h-[280px] w-[280px]"
                                />
                            </div>

                            <div className="mt-8 rounded-full border border-white/80 bg-white/76 px-5 py-2.5 shadow-sm backdrop-blur-xl">
                                <p className="text-xs font-bold text-slate-500">
                                    {cancelThreshold ? '松开后取消本次语音' : '松手发送 · 上移取消'}
                                    <span className="ml-3 font-mono text-blue-500">
                                        {formatDuration(recordDuration)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 px-4 pb-safe pb-6">
                            <div className="teacher-record-soft-dock flex items-center gap-4 px-3 py-3">
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSwitchMode('camera');
                                    }}
                                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/92 text-[#8A7BFF] shadow-[0_14px_28px_rgba(97,119,163,0.14)] active:scale-95 transition-transform"
                                    aria-label="切换到拍照录入"
                                >
                                    <CameraIcon className="h-7 w-7" />
                                </button>

                                <div className="teacher-record-voice-pill flex h-16 min-w-0 flex-1 items-center justify-center gap-3 text-white select-none active:scale-[0.99] transition-transform">
                                    <MicIcon className="h-6 w-6" />
                                    <span className="text-[18px] font-bold tracking-wide">
                                        {cancelThreshold ? '松开 取消' : '按住 说话'}
                                    </span>
                                </div>

                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSwitchMode('text');
                                    }}
                                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/92 text-[#9B6DFF] shadow-[0_14px_28px_rgba(97,119,163,0.14)] active:scale-95 transition-transform"
                                    aria-label="切换到文字录入"
                                >
                                    <KeyboardIcon className="h-7 w-7" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'camera' && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="w-full h-1/3 border-b border-white absolute top-0"></div>
                            <div className="w-full h-1/3 border-b border-white absolute bottom-0"></div>
                            <div className="h-full w-1/3 border-r border-white absolute left-0"></div>
                            <div className="h-full w-1/3 border-r border-white absolute right-0"></div>
                        </div>

                        <div className="text-white/40 flex flex-col items-center gap-2">
                            <CameraIcon className="w-12 h-12" />
                            <span className="text-sm tracking-widest">轻触拍照</span>
                        </div>
                    </div>
                )}

                {mode === 'text' && (
                    <div className="absolute inset-0 teacher-record-soft-page flex flex-col p-4 animate-in fade-in">
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="在这里输入记录内容，AI将自动分析指标..."
                            className="flex-1 w-full resize-none outline-none text-slate-700 text-base leading-relaxed bg-transparent p-2 mt-[56px]"
                        />
                        <div className="flex justify-between items-center pt-4 pb-2 pb-safe border-t border-slate-200/50">
                            <button onClick={() => handleSwitchMode('voice')} className="p-3 text-slate-500 bg-white rounded-full shadow-sm">
                                <MicIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => {
                                    if (!inputText.trim()) return;
                                    onAnalysisComplete({
                                        type: 'text',
                                        text: inputText,
                                        mockStudents: initialStudentIds
                                    });
                                }}
                                className={`px-8 py-3.5 rounded-2xl font-semibold text-white shadow-md transition-all active:scale-95 flex items-center gap-2
                               ${inputText.trim() ? 'bg-indigo-600 shadow-indigo-200 ' : 'bg-slate-300'}`}
                            >
                                发送识别
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {mode === 'camera' && (
                <div className="pb-safe pt-6 pb-8 px-3 bg-black">
                    <div className="flex items-center justify-between px-6">
                        <button
                            onClick={() => handleSwitchMode('voice')}
                            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20"
                        >
                            <ArrowRightIcon className="w-5 h-5 rotate-180" />
                        </button>

                        <button
                            onClick={handleCameraCapture}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <div className="w-16 h-16 rounded-full bg-white"></div>
                        </button>

                        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20">
                            <ImageIconIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RecordInputView;
