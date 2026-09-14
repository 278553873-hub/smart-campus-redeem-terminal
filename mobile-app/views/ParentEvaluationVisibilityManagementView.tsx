import React, { useId, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import ParentEvaluationVisibilitySettings, {
  ParentEvaluationVisibilityPreview,
} from '../components/class/ParentEvaluationVisibilitySettings';
import {
  FeaturePageBody,
  FeaturePanel,
  SwitchControl,
  featurePrimaryButtonClass,
} from './MeFeatureViews';
import type {
  ParentEvaluationVisibilitySettings as VisibilitySettings,
  SchoolParentEvaluationVisibilityConfig,
} from '../types';

interface ParentEvaluationVisibilityManagementViewProps {
  initialConfig: SchoolParentEvaluationVisibilityConfig;
  onSave: (config: SchoolParentEvaluationVisibilityConfig, shouldGoBack?: boolean) => void;
  onBack?: () => void;
}

export const ParentEvaluationVisibilityManagementView: React.FC<ParentEvaluationVisibilityManagementViewProps> = ({
  initialConfig,
  onSave,
  onBack,
}) => {
  const [config, setConfig] = useState<SchoolParentEvaluationVisibilityConfig>(initialConfig);
  const [showHelp, setShowHelp] = useState(false);
  const helpTooltipId = useId();

  const handleToggleAllowCustomization = (allow: boolean) => {
    const nextConfig = {
      ...config,
      allowHomeroomTeacherCustomization: allow,
    };
    setConfig(nextConfig);
    // 开关切换立即自动持久化，避免用户拨动开关后直接返回导致未生效
    onSave(nextConfig, false);
  };

  const handleSettingsChange = (settings: VisibilitySettings) => {
    setConfig(prev => ({
      ...prev,
      settings,
    }));
  };

  const handleSave = () => {
    onSave(config, true);
    onBack?.();
  };

  return (
    <FeaturePageBody
      footer={(
        <button type="button" onClick={handleSave} className={featurePrimaryButtonClass}>
          保存
        </button>
      )}
    >
      {/* 1. 最上方单独的开关卡片，参考“货币发放”配置结构 */}
      <FeaturePanel className="relative z-10 px-4 py-2" allowOverflow>
        <div className="flex min-h-[60px] items-center justify-between gap-3">
          <div className="relative flex min-w-0 items-center gap-0">
            <span className="truncate text-[14px] font-bold text-[var(--tm-text-primary)]">
              允许班主任自主设置
            </span>
            <button
              type="button"
              className="-ml-2 flex h-11 w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-full text-[var(--tm-text-disabled)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary-soft-strong)]"
              aria-label="查看自主设置说明"
              aria-describedby={showHelp ? helpTooltipId : undefined}
              aria-expanded={showHelp}
              onPointerDown={() => setShowHelp(true)}
              onPointerUp={() => setShowHelp(false)}
              onPointerCancel={() => setShowHelp(false)}
              onPointerLeave={() => setShowHelp(false)}
              onFocus={() => setShowHelp(true)}
              onBlur={() => setShowHelp(false)}
              onContextMenu={event => event.preventDefault()}
            >
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
            </button>
            {showHelp && (
              <div
                id={helpTooltipId}
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-30 w-[260px] max-w-[calc(100vw-64px)] rounded-2xl bg-[var(--tm-text-primary)] px-3.5 py-3 text-[12px] font-medium leading-5 text-white shadow-[0_14px_32px_-20px_var(--tm-shadow-neutral-color)]"
              >
                开启后，班主任可自主设置本班家长端展示规则；关闭后，全校统一按照本处设置的方案进行展示，不允许班主任私自调整
              </div>
            )}
          </div>
          <SwitchControl
            checked={config.allowHomeroomTeacherCustomization}
            onChange={handleToggleAllowCustomization}
            label="允许班主任自主设置"
          />
        </div>
      </FeaturePanel>

      {/* 2. 全校统一展示规则卡片，标题采用“货币发放”一致的 15px font-bold text-[var(--tm-text-primary)] */}
      <FeaturePanel className="space-y-4 p-4">
        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">
          全校统一展示规则
        </h2>
        <ParentEvaluationVisibilitySettings
          settings={config.settings}
          onChange={handleSettingsChange}
          showPreview={false}
        />
      </FeaturePanel>

      {/* 3. 家长端展示预览独立平铺在卡片下方，不放入任何外层卡片容器 */}
      <ParentEvaluationVisibilityPreview
        settings={config.settings}
        className="space-y-3 pt-1"
      />
    </FeaturePageBody>
  );
};

export default ParentEvaluationVisibilityManagementView;
