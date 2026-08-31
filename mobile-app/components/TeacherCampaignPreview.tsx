import React from 'react';
import PhoneMockup from '../../components/PhoneMockup';
import type { TeacherCampaign } from '../data/teacherCampaigns';
import { teacherBrandCssVariables } from '../styles/teacherMobileTokens';
import ClassRecordLogView from '../views/ClassRecordLogView';
import TeacherBottomNavigation from './TeacherBottomNavigation';
import TeacherCampaignModal from './TeacherCampaignModal';
import TeacherMobileScreenBackground from './TeacherMobileScreenBackground';
import TeacherRecordInputBar from './TeacherRecordInputBar';

interface TeacherCampaignPreviewProps {
    campaign: TeacherCampaign | null;
}

export default function TeacherCampaignPreview({ campaign }: TeacherCampaignPreviewProps) {
    return (
        <div
            className="teacher-mobile-app h-full min-h-[480px] w-full"
            style={teacherBrandCssVariables as React.CSSProperties}
            aria-hidden="true"
        >
            <PhoneMockup
                showDeviceFrame
                contentTopInsetMode="status-bar"
                screenBackground={<TeacherMobileScreenBackground variant="record" recordMode="class" />}
                screenOverlay={(
                    <TeacherCampaignModal
                        campaign={campaign}
                        onClose={() => undefined}
                        onOpenDetail={() => undefined}
                    />
                )}
            >
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
                    <main className="has-floating-tabbar min-h-0 flex-1 overflow-hidden">
                        <ClassRecordLogView
                            activeTab="class"
                            onTabChange={() => undefined}
                            showFirstRecordGuide={false}
                            onBack={() => undefined}
                            isMainView
                            onStartRecord={() => undefined}
                            onToggleModal={() => undefined}
                            canRecordClass
                            onViewIndicators={() => undefined}
                        />
                    </main>

                    <TeacherRecordInputBar
                        showKeyboard={false}
                        showTabBar
                        inputText=""
                        hasSelectionTarget
                        emptySelectionPrompt="请选择学生"
                        isMultiSelectMode={false}
                        selectedTargetCount={0}
                        selectedTargetUnit="人"
                        voicePressState="idle"
                        onCloseKeyboard={() => undefined}
                        onCameraClick={() => undefined}
                        onVoicePointerDown={() => undefined}
                        onVoiceContextMenu={event => event.preventDefault()}
                        onKeyboardClick={() => undefined}
                    />

                    <TeacherBottomNavigation activeTab="record" onTabChange={() => undefined} />
                </div>
            </PhoneMockup>
        </div>
    );
}
