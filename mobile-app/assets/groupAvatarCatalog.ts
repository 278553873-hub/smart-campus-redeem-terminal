import type { StudentGroupAvatarKey } from '../types';
import windmillAvatar from './resources/group-avatars/windmill.png';
import hotAirBalloonAvatar from './resources/group-avatars/hot-air-balloon.png';
import rocketAvatar from './resources/group-avatars/rocket.png';
import sailboatAvatar from './resources/group-avatars/sailboat.png';
import blocksAvatar from './resources/group-avatars/blocks.png';
import puzzleAvatar from './resources/group-avatars/puzzle.png';
import telescopeAvatar from './resources/group-avatars/telescope.png';
import bridgeAvatar from './resources/group-avatars/bridge.png';
import paperPlaneAvatar from './resources/group-avatars/paper-plane.png';
import kiteAvatar from './resources/group-avatars/kite.png';
import compassAvatar from './resources/group-avatars/compass.png';
import gearsAvatar from './resources/group-avatars/gears.png';
import lightbulbAvatar from './resources/group-avatars/lightbulb.png';
import magnetAvatar from './resources/group-avatars/magnet.png';
import foldedMapAvatar from './resources/group-avatars/folded-map.png';
import backpackAvatar from './resources/group-avatars/backpack.png';

export interface StudentGroupAvatarOption {
  key: StudentGroupAvatarKey;
  label: string;
  src: string;
}

export const studentGroupAvatarOptions: StudentGroupAvatarOption[] = [
  { key: 'windmill', label: '风车', src: windmillAvatar },
  { key: 'hot-air-balloon', label: '热气球', src: hotAirBalloonAvatar },
  { key: 'rocket', label: '火箭', src: rocketAvatar },
  { key: 'sailboat', label: '帆船', src: sailboatAvatar },
  { key: 'blocks', label: '积木塔', src: blocksAvatar },
  { key: 'puzzle', label: '拼图块', src: puzzleAvatar },
  { key: 'telescope', label: '望远镜', src: telescopeAvatar },
  { key: 'bridge', label: '拱桥', src: bridgeAvatar },
  { key: 'paper-plane', label: '纸飞机', src: paperPlaneAvatar },
  { key: 'kite', label: '风筝', src: kiteAvatar },
  { key: 'compass', label: '指南针', src: compassAvatar },
  { key: 'gears', label: '齿轮组', src: gearsAvatar },
  { key: 'lightbulb', label: '灯泡', src: lightbulbAvatar },
  { key: 'magnet', label: '磁铁', src: magnetAvatar },
  { key: 'folded-map', label: '折叠地图', src: foldedMapAvatar },
  { key: 'backpack', label: '书包', src: backpackAvatar },
];

export const studentGroupAvatarKeys = studentGroupAvatarOptions.map(option => option.key);

export const getStudentGroupAvatarOption = (avatarKey: StudentGroupAvatarKey | undefined, fallbackIndex = 0) => {
  const fallback = studentGroupAvatarOptions[
    Math.abs(fallbackIndex) % studentGroupAvatarOptions.length
  ];
  return studentGroupAvatarOptions.find(option => option.key === avatarKey) ?? fallback;
};

export const getAvailableStudentGroupAvatarKey = (
  usedKeys: Iterable<StudentGroupAvatarKey | undefined>,
  startIndex = 0,
): StudentGroupAvatarKey => {
  const used = new Set(Array.from(usedKeys).filter((key): key is StudentGroupAvatarKey => Boolean(key)));
  const normalizedStart = Math.abs(startIndex) % studentGroupAvatarKeys.length;

  for (let offset = 0; offset < studentGroupAvatarKeys.length; offset += 1) {
    const key = studentGroupAvatarKeys[(normalizedStart + offset) % studentGroupAvatarKeys.length];
    if (!used.has(key)) return key;
  }

  return studentGroupAvatarKeys[normalizedStart];
};
