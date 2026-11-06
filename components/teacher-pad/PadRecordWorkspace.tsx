import React, { useEffect, useState } from 'react';
import ClassRecordLogView from '../../mobile-app/views/ClassRecordLogView';
import RecordInputView from '../../mobile-app/views/RecordInputView';
import TeacherRecordInputBar from '../../mobile-app/components/TeacherRecordInputBar';
import { useHoldToTalk } from '../../mobile-app/hooks/useHoldToTalk';
import { MOCK_CLASSES } from '../../mobile-app/constants';
import type { TeacherSpaceOption } from '../../mobile-app/domain/teacherSpaceAccess';

export default function PadRecordWorkspace({
    currentSpace, onIndicators, onInputOpenChange, onModalChange,
}: { currentSpace: TeacherSpaceOption; onIndicators: () => void; onInputOpenChange?: (open: boolean) => void; onModalChange?: (open: boolean) => void }) {
    const [cameraOpen, setCameraOpen] = useState(false);
    useEffect(() => { onInputOpenChange?.(cameraOpen); }, [cameraOpen, onInputOpenChange]);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [inputText, setInputText] = useState('');
    const [guidePending, setGuidePending] = useState(true);
    const [pending, setPending] = useState<any>(null);

    const complete = (result: { type: string; text: string }) => {
        setGuidePending(false);
        setPending({ ...result, requestId: crypto.randomUUID() });
        setShowKeyboard(false);
        setInputText('');
        setCameraOpen(false);
    };
    // 沿用手机端的按住、上滑取消与音量反馈；演示会话不接入正式识别服务。
    const voice = useHoldToTalk(() => {}, () => {}, {
        createSession: callbacks => {
            let closed = false;
            return {
                start() { setGuidePending(false); },
                release() {
                    if (closed) return;
                    closed = true;
                    callbacks.finish();
                    complete({ type: 'voice', text: '三年级二班早操队伍整齐，做操规范。' });
                },
                cancel() { closed = true; callbacks.finish(); },
            };
        },
    });

    return <div className="pad-record-workspace">
        <div hidden={cameraOpen} className="pad-record-base">
        <div className="pad-record-adapted">
            <ClassRecordLogView activeTab="class" onTabChange={() => {}} canRecordClass availableRecordScopes={['class']}
                onToggleModal={onModalChange} showFirstRecordGuide={guidePending} isMainView onBack={() => {}} onViewIndicators={onIndicators} classes={MOCK_CLASSES}
                currentSpace={currentSpace} newRecordData={pending} onClearNewRecord={() => setPending(null)} />
        </div>
        <div className="pad-shared-input">
            <TeacherRecordInputBar showKeyboard={showKeyboard} showTabBar={false}
                inputText={inputText} hasSelectionTarget emptySelectionPrompt="请选择班级"
                isMultiSelectMode={false} selectedTargetCount={0} selectedTargetUnit="个班级"
                voicePressState={voice.state} voice={voice} onInputChange={setInputText}
                onSubmit={() => { if (inputText.trim()) complete({ type: 'text', text: inputText }); }}
                onCloseKeyboard={() => setShowKeyboard(false)} onCameraClick={() => setCameraOpen(true)}
                onKeyboardClick={() => setShowKeyboard(true)} />
        </div>
        </div>
        {cameraOpen && <div className="pad-input-overlay">
            <RecordInputView initialStudentIds={[]} candidateStudentIds={[]} studentNameList="班级记录"
                initialMode="camera" onClose={() => setCameraOpen(false)} onAnalysisComplete={complete} />
        </div>}
    </div>;
}
