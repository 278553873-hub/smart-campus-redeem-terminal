import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const shareFlow = read('./WechatInviteShareFlow.tsx');
const appScreen = read('../ui/MobileWechatAppScreen.tsx');
const shareChats = read('../../data/wechatShareChats.ts');
const inviteFlow = read('./ClassInviteFlow.tsx');
const statusBar = read('../../../components/SimulatedIosStatusBar.tsx');
const phoneMockup = read('../../../components/PhoneMockup.tsx');

// 整屏仿真：通过微信邀请是跳到微信，而不是在小程序内自建聊天列表。
assert.match(appScreen, /absolute inset-0 z-\[1200\]/, '跳转微信必须铺满整个手机屏幕，盖住小程序页面和邀请方式弹窗。');
assert.match(appScreen, /teacher-mobile-overlay-root/, '微信整屏应挂到手机壳的整屏弹层根节点。');
assert.match(appScreen, /SimulatedIosStatusBar/, '微信整屏应自带系统状态栏。');
assert.match(statusBar, /h-\[54px\]/, '系统状态栏仿真高度应保持 54px。');
assert.match(phoneMockup, /<SimulatedMiniProgramChrome \/>/, '手机壳复用公共原生模拟层。');
assert.match(read('../../../components/SimulatedMiniProgramChrome.tsx'), /<SimulatedIosStatusBar/, '公共原生层与微信整屏共用状态栏。');

// 微信「选择聊天」页：关闭 / 选择聊天 / 多选、搜索、最近转发、最近聊天、折叠的聊天。
assert.match(shareFlow, /选择聊天/, '应还原微信选择聊天页标题。');
assert.match(shareFlow, /关闭/, '选择聊天页必须提供关闭返回小程序。');
assert.match(shareFlow, /多选/, '选择聊天页应保留微信的多选入口。');
assert.match(shareFlow, /搜索/, '选择聊天页应保留微信搜索框。');
assert.match(shareFlow, /最近转发/, '选择聊天页应展示最近转发。');
assert.match(shareFlow, /最近聊天/, '选择聊天页应展示最近聊天。');
assert.match(shareFlow, /创建聊天/, '最近聊天右侧应保留创建聊天入口。');
assert.match(shareFlow, /转到企业微信/, '最近聊天右侧应保留转到企业微信入口。');
assert.match(shareFlow, /其他应用/, '最近聊天右侧应保留其他应用入口。');
assert.match(shareFlow, /折叠的聊天/, '选择聊天页底部应展示折叠的聊天。');

// 微信「发送给」半屏：接收人、小程序卡片、消息输入、取消和发送。
assert.match(shareFlow, /发送给/, '选择接收人后应展示微信发送给半屏。');
assert.match(shareFlow, /邀请你加入【/, '小程序卡片应展示邀请加入的标题。');
assert.match(shareFlow, /立即加入/, '小程序卡片主图应保留立即加入按钮。');
assert.match(shareFlow, /小程序/, '小程序卡片应标注小程序来源。');
assert.match(shareFlow, /发消息/, '发送给半屏应保留微信发消息输入框。');
assert.match(shareFlow, />取消</, '发送给半屏应提供取消操作。');
assert.match(shareFlow, /bg-\[var\(--tm-platform-wechat\)\]/, '发送按钮应使用微信平台色 Token。');
assert.match(shareFlow, /已发送/, '发送成功后应给出微信原生的已发送反馈。');

// 微信界面不应带进产品品牌色，避免看起来像小程序自绘页面。
assert.doesNotMatch(shareFlow, /--tm-brand/, '微信原生界面不应使用产品品牌色。');
assert.doesNotMatch(appScreen, /--tm-brand/, '微信整屏容器不应使用产品品牌色。');

// 演示会话数据与视图分离，且包含单聊、群聊和文件传输助手。
assert.match(shareChats, /文件传输助手/, '演示会话应包含文件传输助手。');
assert.match(shareChats, /memberCount/, '演示会话应支持群聊人数。');
assert.match(shareFlow, /WECHAT_SHARE_CHATS/, '会话列表应读取演示数据而不是写死在视图里。');

// 邀请流程接入：通过微信邀请直接跳转，发送完成后回到班级页面。
assert.ok(inviteFlow.includes('onClick={() => setWechatShareOpen(true)}'), '点击通过微信邀请应直接跳转微信。');
assert.ok(inviteFlow.includes('onSent={closeFlow}'), '微信发送完成后应结束邀请流程回到页面。');
assert.match(inviteFlow, /audience === 'teacher' && [(][\s\S]*<WechatInviteShareFlow/, '微信邀请只对邀请老师开放。');

console.log('WeChat invite share assertions passed');
