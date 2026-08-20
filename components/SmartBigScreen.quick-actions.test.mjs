import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const dockSource = readFileSync(new URL('./classroom/ClassroomQuickActionDock.tsx', import.meta.url), 'utf8');
const iconUrl = new URL('../public/assets/classroom/quick-action-giraffe.png', import.meta.url);
const secondaryIconUrl = new URL('../public/assets/classroom/open-app-icon.png', import.meta.url);

assert.ok(existsSync(iconUrl), '课堂快捷功能应使用已入库的长颈鹿图标资源');
assert.ok(existsSync(secondaryIconUrl), '第二个课堂快捷功能应使用已入库的打开应用图标资源');
assert.match(screenSource, /ClassroomQuickActionDock/, '课堂大屏应复用课堂快捷功能悬浮组件');
assert.match(screenSource, /onToggleVoice=\{toggleVoiceCapture\}/, '麦克风子入口应保留原有语音录入逻辑');
assert.doesNotMatch(screenSource, /handleVoiceDockPointer/, '课堂大屏页面不应继续承载悬浮入口拖拽细节');

assert.match(dockSource, /h-16 w-16/, '主悬浮入口应保持64像素尺寸');
assert.match(dockSource, /scale-\[1\.12\]/, '主悬浮入口的默认长颈鹿图标应在按钮内适度放大');
assert.match(dockSource, /MIC_FAN_OFFSET = \{ x: 21, y: 77 \}/, '麦克风应沿接近竖直方向的扇形半径展开');
assert.match(dockSource, /ASSISTANT_FAN_OFFSET = \{ x: 69, y: 40 \}/, '第二功能应沿左上扇形方向展开');
assert.match(dockSource, /resolveFanDirection/, '拖动主入口后应根据屏幕剩余空间镜像扇形方向');
assert.match(dockSource, /translate3d\(\$\{offset\.x\}px, \$\{offset\.y\}px, 0\) scale\(1\)/, '子入口应从主入口中心沿半径运动');
assert.match(dockSource, /transitionDuration: isVisible \? '220ms' : '160ms'/, '展开和收起应使用符合物理感知的不同持续时间');
assert.match(dockSource, /setIsExpanded\(false\);[\s\S]*setPosition\(clampPosition/, '拖拽主入口时应先收起子功能');
assert.doesNotMatch(dockSource, /flex-col gap-3/, '两个子入口不应继续垂直堆叠');
assert.match(dockSource, /h-12 w-12/g, '子入口应保持48像素点击区域');
assert.match(dockSource, /aria-expanded=\{isExpanded\}/, '主入口应向辅助技术暴露展开状态');
assert.match(dockSource, /event\.key !== 'Enter' && event\.key !== ' '/, '主入口应明确支持回车和空格键展开');
assert.match(dockSource, /event\.key !== 'Escape'/, '快捷功能应支持按Esc键收起');
assert.match(dockSource, /if \(isVoiceListening\) \{[\s\S]*setFanDirection\(resolveFanDirection\(\)\);[\s\S]*setIsExpanded\(true\);[\s\S]*else if \(wasVoiceListeningRef\.current\)[\s\S]*setIsExpanded\(false\);/, '录音开始时应保持麦克风展开，录音结束时应恢复收起状态');
assert.match(dockSource, /aria-hidden=\{!isVoiceListening\}/, '未录音时不应向辅助技术暴露录音状态');
assert.match(dockSource, /isVoiceListening[\s\S]*pointer-events-none scale-75 opacity-0/, '录音期间应隐藏并禁用主悬浮入口');
assert.match(dockSource, /getActionMotionStyle\(assistantOffset, isExpanded && !isVoiceListening\)/, '录音期间应收起第二个子功能入口');
assert.match(dockSource, /if \(isVoiceListening\) setIsExpanded\(false\);[\s\S]*onToggleVoice\(\);/, '再次点击麦克风时应先收起麦克风再恢复主入口');
assert.match(dockSource, /onSecondaryAction\?\.\(\)/, '第二个子入口应预留后续业务接入点');
assert.match(dockSource, /src=\{secondaryIconSrc\}/, '第二个子入口不应继续复用默认长颈鹿占位图标');
assert.doesNotMatch(dockSource, /bg-white shadow-\[0_12px_28px_rgba\(15,23,42,0\.18\)\] ring-1/, '第二个子入口不应在附件图标外增加白色底框');
assert.match(dockSource, /src=\{secondaryIconSrc\}[\s\S]*?scale-\[1\.16\]/, '第二个子入口应裁去附件素材自身的透明留白和白色外沿');

console.log('SmartBigScreen quick action checks passed.');
