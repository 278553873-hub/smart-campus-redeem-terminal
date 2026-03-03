import React, { useState } from 'react';
import { BackIcon, CameraIcon, ImageIconIcon, CheckCircleIcon, WechatMoreIcon, WechatCloseIcon } from '../../components/Icons';
import { MOCK_STUDENTS_CLASS_1 } from '../../constants';

interface FaceUpdateViewProps {
    classId: string;
    onBack: () => void;
}

export const FaceUpdateView: React.FC<FaceUpdateViewProps> = ({ classId, onBack }) => {
    // 模拟学生人脸录入状态
    const [students, setStudents] = useState(
        MOCK_STUDENTS_CLASS_1.map((s, i) => ({
            ...s,
            hasFaceData: i < 5, // 前面5个有头像
            isUploading: false
        }))
    );

    const handleUploadMock = (id: string, action: 'camera' | 'album') => {
        // 模拟上传过程
        setStudents(prev => prev.map(s => s.id === id ? { ...s, isUploading: true } : s));

        setTimeout(() => {
            setStudents(prev => prev.map(s => s.id === id ? { ...s, isUploading: false, hasFaceData: true } : s));
        }, 1500);
    };

    const countHasData = students.filter(s => s.hasFaceData).length;
    const progress = (countHasData / students.length) * 100;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-20 h-[44px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex-1 flex justify-start">
                    <button onClick={onBack} className="p-1 -ml-2 text-slate-900 active:bg-slate-100 rounded-full transition-colors">
                        <BackIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-[17px] font-bold text-slate-900 flex-none">批量更新人脸库</div>

                <div className="flex-1 flex justify-end">
                    {/* Simulated WeChat Capsule */}
                    <div className="flex items-center bg-white/50 border border-slate-200/80 rounded-full px-3 h-[30px] gap-3 shadow-sm">
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatMoreIcon className="w-5 h-5" /></div>
                        <div className="w-[1px] h-3.5 bg-slate-200"></div>
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatCloseIcon className="w-4 h-4" /></div>
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-5 m-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight">{countHasData}<span className="text-base text-slate-400 font-bold ml-1">/ {students.length}</span></div>
                        <div className="text-sm font-bold text-slate-500 mt-0.5">人脸数据已录入</div>
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Student List Grid */}
            <div className="px-4 pb-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    {students.map(student => (
                        <div key={student.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 overflow-hidden relative group">
                            {/* Status logic */}
                            {student.hasFaceData ? (
                                <div className="absolute top-2 right-2 z-10 p-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                </div>
                            ) : null}

                            {/* Avatar or Placeholder */}
                            <div className="aspect-[3/4] rounded-xl mb-3 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                                {student.isUploading ? (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                                        <span className="text-[10px] text-white font-bold">处理中</span>
                                    </div>
                                ) : null}

                                {student.hasFaceData ? (
                                    <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${student.isUploading ? 'scale-110 blur-sm' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
                                            <CameraIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">缺少人脸</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center font-bold text-slate-800 text-[15px] mb-3">{student.name}</div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 relative z-0">
                                <button
                                    onClick={() => handleUploadMock(student.id, 'camera')}
                                    disabled={student.isUploading}
                                    className={`flex-1 py-2 flex items-center justify-center rounded-lg font-bold text-xs transition-colors
                                        ${student.hasFaceData
                                            ? 'bg-slate-50 text-slate-500 '
                                            : 'bg-blue-50 text-blue-600 active:bg-blue-100'}`}
                                >
                                    <CameraIcon className="w-3.5 h-3.5 mr-1" />
                                    {student.hasFaceData ? '重拍' : '拍照'}
                                </button>
                                <button
                                    onClick={() => handleUploadMock(student.id, 'album')}
                                    disabled={student.isUploading}
                                    className={`flex-1 py-2 flex items-center justify-center rounded-lg font-bold text-xs transition-colors
                                        ${student.hasFaceData
                                            ? 'bg-slate-50 text-slate-500 '
                                            : 'bg-indigo-50 text-indigo-600 active:bg-indigo-100'}`}
                                >
                                    <ImageIconIcon className="w-3.5 h-3.5 mr-1" />
                                    {student.hasFaceData ? '相册' : '上传'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaceUpdateView;
