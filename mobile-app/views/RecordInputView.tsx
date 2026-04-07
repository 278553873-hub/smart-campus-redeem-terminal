import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    CameraIcon, MicIcon, ImageIconIcon,
    ChevronRightIcon, WechatMoreIcon, WechatCloseIcon,
    ArrowRightIcon
} from '../components/Icons';

interface RecordInputViewProps {
    initialStudentIds: string[]; // From batch selection
    studentNameList: string;
    initialMode?: 'voice' | 'camera' | 'text';
    onClose: () => void;
    onAnalysisComplete: (result: any) => void;
}

type InputMode = 'voice' | 'camera' | 'text';

const RecordInputView: React.FC<RecordInputViewProps> = ({ initialStudentIds, studentNameList, initialMode = 'voice', onClose, onAnalysisComplete }) => {
    const [mode, setMode] = useState<InputMode>(initialMode);
    const [inputText, setInputText] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const [cancelThreshold, setCancelThreshold] = useState(false);
    const touchStartY = useRef<number | null>(null);

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

    const beginRecording = () => {
        setIsRecording(true);
        setCancelThreshold(false);
        setRecordDuration(0);
    };

    useEffect(() => {
        if (mode === 'voice') {
            beginRecording();
        } else {
            setIsRecording(false);
            setCancelThreshold(false);
            touchStartY.current = null;
            if (mode === 'text') {
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            }
        }
    }, [mode]);

    const handleSwitchMode = (nextMode: InputMode) => {
        if (nextMode !== 'voice') {
            setIsRecording(false);
            setCancelThreshold(false);
            setRecordDuration(0);
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
    }, [isRecording, cancelThreshold, onAnalysisComplete, initialStudentIds, studentNameList, onClose]);

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

    return (
        <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ${mode === 'camera' ? 'bg-black' : 'bg-[#F2F2F2]'}`}>

            {/* Top Bar */}
            <div className={`flex justify-between items-center px-4 z-20 h-[104px] pt-[54px] transition-colors shadow-sm ${mode === 'camera' ? 'text-white border-b border-white/10' : 'text-slate-900 bg-white border-b border-slate-100'}`}>
                <div className="flex-1 flex justify-start">
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${mode === 'camera' ? 'bg-white/10 /20' : 'bg-slate-100 '}`}
                    >
                        <div className="rotate-90"><ChevronRightIcon className={`w-5 h-5 ${mode === 'camera' ? 'text-white' : 'text-slate-600'}`} /></div>
                    </button>
                </div>

                <div className="flex flex-col items-center flex-none">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${mode === 'camera' ? 'bg-black/40 backdrop-blur-md border border-white/10' : ''}`}>
                        <span className={`text-sm font-bold max-w-[150px] truncate ${mode === 'camera' ? 'text-white' : 'text-slate-800'}`}>{studentNameList || "未选择学生"}</span>
                        {initialStudentIds.length > 0 && (
                            <span className={`text-[10px] px-1.5 rounded-sm font-bold ${mode === 'camera' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
                                {initialStudentIds.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-10"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full overflow-hidden">

                {mode === 'voice' && (
                    <div
                        className="absolute inset-0 flex flex-col"
                        onTouchStart={handleGestureStart}
                        onTouchMove={handlePressMove}
                        onMouseDown={handleGestureStart}
                        onMouseMove={handlePressMove}
                    >
                        <div className="flex-1 bg-white"></div>
                        <div className="relative h-[50%]">
                            <div className={`absolute inset-0 ${cancelThreshold ? 'bg-gradient-to-t from-[#ff8a8a]/85 via-[#ffe0e0]/70 to-transparent' : 'bg-gradient-to-t from-[#1a8fff]/85 via-[#7dc6ff]/55 to-transparent'}`}></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white text-sm">
                                <p className="tracking-widest drop-shadow-sm">
                                    {cancelThreshold ? '松开取消' : '松手发送，上移取消'}
                                </p>
                                <div className="flex items-end gap-1 mt-3">
                                    {Array.from({ length: 28 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 rounded-full ${cancelThreshold ? 'bg-white/80' : 'bg-white'} ${isRecording ? 'animate-[pulse_0.85s_ease-in-out_infinite]' : ''}`}
                                            style={{
                                                height: `${isRecording ? 18 + Math.random() * 35 : 8}px`,
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                                <p className="text-xs text-white/80">
                                    {formatDuration(recordDuration)}
                                </p>
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
                    <div className="absolute inset-0 bg-slate-50 flex flex-col p-4 animate-in fade-in">
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
                                className={`px-8 py-3.5 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center gap-2
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
