import { ASSETS } from '../assets/images';
import { getStudentGroupAvatarOption } from '../assets/groupAvatarCatalog';
import type { StudentGroupAvatarKey } from '../types';

/**
 * 「通过微信邀请」里微信选择聊天页的演示会话。
 *
 * 邀请老师时老师面对的是自己的微信，所以这里只做演示数据：
 * 单聊用教师字母头像，群聊用四宫格拼图头像，文件传输助手用微信绿底图标头像。
 */
export interface WechatShareChat {
  id: string;
  name: string;
  /** 群聊人数，单聊不展示。 */
  memberCount?: number;
  /** 文件传输助手这类微信内置会话使用平台图标头像。 */
  kind?: 'chat' | 'fileTransfer';
  /** 单聊一张头像，群聊四宫格拼图。 */
  avatars: string[];
}

const groupAvatars = (keys: StudentGroupAvatarKey[]) => keys.map(key => getStudentGroupAvatarOption(key).src);

export const WECHAT_SHARE_CHATS: WechatShareChat[] = [
  { id: 'chat-lin', name: '林老师', avatars: [ASSETS.AVATAR.TEACHER_LIN] },
  {
    id: 'chat-chinese-group',
    name: '语文备课组',
    memberCount: 8,
    avatars: groupAvatars(['windmill', 'kite', 'compass', 'puzzle']),
  },
  { id: 'chat-file-transfer', name: '文件传输助手', kind: 'fileTransfer', avatars: [] },
  {
    id: 'chat-math-group',
    name: '数学教研组',
    memberCount: 12,
    avatars: groupAvatars(['rocket', 'sailboat', 'blocks', 'telescope']),
  },
  { id: 'chat-wang', name: '王老师', avatars: [ASSETS.AVATAR.TEACHER_WANG] },
  {
    id: 'chat-grade-group',
    name: '三年级教师群',
    memberCount: 26,
    avatars: groupAvatars(['bridge', 'paper-plane', 'gears', 'lightbulb']),
  },
  { id: 'chat-liu', name: '刘老师', avatars: [ASSETS.AVATAR.TEACHER_LIU] },
];

/** 最近转发只展示最近联系过的几个会话，顺序与微信一致。 */
export const WECHAT_RECENT_FORWARD_CHAT_IDS = [
  'chat-lin',
  'chat-chinese-group',
  'chat-file-transfer',
  'chat-wang',
  'chat-math-group',
];
