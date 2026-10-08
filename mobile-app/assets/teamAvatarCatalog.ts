import type { StudentTeamAvatarKey } from '../types';
import sportsBasketball from './resources/team-avatars/sports-basketball.png?avatar-v=3';
import sportsVolleyball from './resources/team-avatars/sports-volleyball.png?avatar-v=3';
import sportsTableTennis from './resources/team-avatars/sports-table-tennis.png?avatar-v=3';
import danceShoe from './resources/team-avatars/dance-dance-shoe.png?avatar-v=3';
import danceMusicNote from './resources/team-avatars/dance-music-note.png?avatar-v=3';
import danceMicrophone from './resources/team-avatars/dance-microphone.png?avatar-v=3';
import technologyRocket from './resources/team-avatars/technology-rocket.png?avatar-v=3';
import technologyRobot from './resources/team-avatars/technology-robot.png?avatar-v=3';
import technologyCode from './resources/team-avatars/technology-code.png?avatar-v=3';
import readingOpenBook from './resources/team-avatars/reading-open-book.png?avatar-v=3';
import readingSpeechBubble from './resources/team-avatars/reading-speech-bubble.png?avatar-v=3';
import readingStorybook from './resources/team-avatars/reading-storybook.png?avatar-v=3';
import craftPaintbrush from './resources/team-avatars/craft-paintbrush.png?avatar-v=3';
import craftKnitting from './resources/team-avatars/craft-knitting.png?avatar-v=3';
import craftPalette from './resources/team-avatars/craft-palette.png?avatar-v=3';
import growthHeart from './resources/team-avatars/growth-heart.png?avatar-v=3';
import growthHandshake from './resources/team-avatars/growth-handshake.png?avatar-v=3';
import growthSprout from './resources/team-avatars/growth-sprout.png?avatar-v=3';

export interface StudentTeamAvatarOption {
  key: StudentTeamAvatarKey;
  label: string;
  category: string;
  src: string;
}

export const studentTeamAvatarOptions: StudentTeamAvatarOption[] = [
  { key: 'sports-basketball', label: '篮球', category: '运动类', src: sportsBasketball },
  { key: 'sports-volleyball', label: '气排球', category: '运动类', src: sportsVolleyball },
  { key: 'sports-table-tennis', label: '乒乓球', category: '运动类', src: sportsTableTennis },
  { key: 'dance-shoe', label: '舞蹈', category: '舞蹈类', src: danceShoe },
  { key: 'dance-music-note', label: '音符', category: '舞蹈类', src: danceMusicNote },
  { key: 'dance-microphone', label: '麦克风', category: '舞蹈类', src: danceMicrophone },
  { key: 'technology-rocket', label: '火箭', category: '科技类', src: technologyRocket },
  { key: 'technology-robot', label: '机器人', category: '科技类', src: technologyRobot },
  { key: 'technology-code', label: '编程', category: '科技类', src: technologyCode },
  { key: 'reading-open-book', label: '书本', category: '阅读表达类', src: readingOpenBook },
  { key: 'reading-speech-bubble', label: '朗读', category: '阅读表达类', src: readingSpeechBubble },
  { key: 'reading-storybook', label: '绘本', category: '阅读表达类', src: readingStorybook },
  { key: 'craft-paintbrush', label: '画笔', category: '美术手工类', src: craftPaintbrush },
  { key: 'craft-knitting', label: '毛线', category: '美术手工类', src: craftKnitting },
  { key: 'craft-palette', label: '调色板', category: '美术手工类', src: craftPalette },
  { key: 'growth-heart', label: '爱心', category: '成长公益类', src: growthHeart },
  { key: 'growth-handshake', label: '握手', category: '成长公益类', src: growthHandshake },
  { key: 'growth-sprout', label: '幼苗', category: '成长公益类', src: growthSprout },
];

export const getStudentTeamAvatarOption = (avatarKey: StudentTeamAvatarKey | undefined, fallbackIndex = 0) => {
  const fallback = studentTeamAvatarOptions[Math.abs(fallbackIndex) % studentTeamAvatarOptions.length];
  return studentTeamAvatarOptions.find(option => option.key === avatarKey) ?? fallback;
};

export const getStudentTeamAvatarImage = (avatarKey: StudentTeamAvatarKey | undefined, _colorKey?: unknown, fallbackIndex = 0) => (
  getStudentTeamAvatarOption(avatarKey, fallbackIndex).src
);
