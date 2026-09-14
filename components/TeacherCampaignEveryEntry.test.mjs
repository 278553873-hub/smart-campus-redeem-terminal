import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootApp = fs.readFileSync('App.tsx', 'utf8');
const mobileApp = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const campaignDomain = fs.readFileSync('mobile-app/data/teacherCampaigns.ts', 'utf8');
const campaignPreloader = fs.readFileSync('mobile-app/utils/preloadCampaignImage.ts', 'utf8');

assert.match(rootApp, /<MobileApp[\s\S]*?campaignPreviewEveryEntry[\s\S]*?\/>/, '教师手机端演示入口应开启每次进入活动预览。');
assert.match(mobileApp, /campaignPreviewEveryEntry\?: boolean/, '教师手机端应提供独立的每次进入预览开关。');
assert.match(mobileApp, /ignoreImpressionHistory: campaignPreviewEveryEntry/, '预览模式应忽略历史展示记录。');
assert.match(mobileApp, /if \(!campaignPreviewEveryEntry\) \{[\s\S]*?setCampaignOpportunityConsumed\(false\)/, '预览模式下切换页面不应重新开启展示机会。');
assert.match(campaignDomain, /options\.ignoreImpressionHistory \|\| !hasTeacherCampaignImpression/, '活动选择器应仅在明确开启预览时绕过历史频控。');
assert.match(mobileApp, /TEACHER_CAMPAIGN_MIN_DELAY_MS = 600/, '活动弹窗应在首页稳定至少 600 毫秒后展示。');
assert.match(mobileApp, /Promise\.all\(\[[\s\S]*?minimumDelay,[\s\S]*?preloadCampaignImage\(campaign\.imageUrl\)/, '最短等待与图片预加载应并行完成。');
assert.match(mobileApp, /if \(!imageReady\) return;/, '图片失败或超时后不应挂载空白弹窗。');
assert.match(campaignPreloader, /timeoutMs = 2400/, '图片预加载应设置有限等待时间。');
assert.match(campaignPreloader, /image\.decode\(\)/, '图片展示前应完成浏览器解码。');

console.log('教师手机端活动每次进入预览断言通过');
