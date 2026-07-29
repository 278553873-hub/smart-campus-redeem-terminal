import studentGirl01 from './resources/student-avatars/girls/student-girl-01.jpg';
import studentGirl02 from './resources/student-avatars/girls/student-girl-02.jpg';
import studentGirl03 from './resources/student-avatars/girls/student-girl-03.jpg';
import studentGirl04 from './resources/student-avatars/girls/student-girl-04.jpg';
import studentGirl05 from './resources/student-avatars/girls/student-girl-05.jpg';
import studentGirl06 from './resources/student-avatars/girls/student-girl-06.jpg';
import studentGirl07 from './resources/student-avatars/girls/student-girl-07.jpg';
import studentGirl08 from './resources/student-avatars/girls/student-girl-08.jpg';
import studentGirl09 from './resources/student-avatars/girls/student-girl-09.jpg';
import studentGirl10 from './resources/student-avatars/girls/student-girl-10.jpg';
import studentGirl11 from './resources/student-avatars/girls/student-girl-11.jpg';
import studentGirl12 from './resources/student-avatars/girls/student-girl-12.jpg';
import studentGirl13 from './resources/student-avatars/girls/student-girl-13.jpg';
import studentGirl14 from './resources/student-avatars/girls/student-girl-14.jpg';
import studentGirl15 from './resources/student-avatars/girls/student-girl-15.jpg';
import studentGirl16 from './resources/student-avatars/girls/student-girl-16.jpg';
import studentGirl17 from './resources/student-avatars/girls/student-girl-17.jpg';
import studentGirl18 from './resources/student-avatars/girls/student-girl-18.jpg';
import studentGirl19 from './resources/student-avatars/girls/student-girl-19.jpg';
import studentGirl20 from './resources/student-avatars/girls/student-girl-20.jpg';
import studentBoy01 from './resources/student-avatars/boys/student-boy-avatar-01.jpg';
import studentBoy02 from './resources/student-avatars/boys/student-boy-avatar-02.jpg';
import studentBoy03 from './resources/student-avatars/boys/student-boy-avatar-03.jpg';
import studentBoy04 from './resources/student-avatars/boys/student-boy-avatar-04.jpg';
import studentBoy05 from './resources/student-avatars/boys/student-boy-avatar-05.jpg';
import studentBoy06 from './resources/student-avatars/boys/student-boy-avatar-06.jpg';
import studentBoy07 from './resources/student-avatars/boys/student-boy-avatar-07.jpg';
import studentBoy08 from './resources/student-avatars/boys/student-boy-avatar-08.jpg';
import studentBoy09 from './resources/student-avatars/boys/student-boy-avatar-09.jpg';
import studentBoy10 from './resources/student-avatars/boys/student-boy-avatar-10.jpg';
import studentBoy11 from './resources/student-avatars/boys/student-boy-avatar-11.jpg';
import studentBoy12 from './resources/student-avatars/boys/student-boy-avatar-12.jpg';
import studentBoy13 from './resources/student-avatars/boys/student-boy-avatar-13.jpg';
import studentBoy14 from './resources/student-avatars/boys/student-boy-avatar-14.jpg';
import studentBoy15 from './resources/student-avatars/boys/student-boy-avatar-15.jpg';
import studentBoy16 from './resources/student-avatars/boys/student-boy-avatar-16.jpg';
import studentBoy17 from './resources/student-avatars/boys/student-boy-avatar-17.jpg';
import studentBoy18 from './resources/student-avatars/boys/student-boy-avatar-18.jpg';
import studentBoy19 from './resources/student-avatars/boys/student-boy-avatar-19.jpg';
import studentBoy20 from './resources/student-avatars/boys/student-boy-avatar-20.jpg';

export interface StudentAvatarOption {
  id: string;
  label: string;
  src: string;
}

export interface StudentAvatarGroup {
  id: string;
  label: string;
  avatars: StudentAvatarOption[];
}

export const studentGirlAvatarGroups: StudentAvatarGroup[] = [
  {
    id: 'ponytail',
    label: '马尾',
    avatars: [
      { id: 'girl-01', label: '高马尾黄头绳', src: studentGirl01 },
      { id: 'girl-07', label: '侧马尾紫蝴蝶结', src: studentGirl07 },
      { id: 'girl-12', label: '半扎马尾红蝴蝶结', src: studentGirl12 },
      { id: 'girl-15', label: '低马尾橙头绳', src: studentGirl15 },
    ],
  },
  {
    id: 'twin-ponytail',
    label: '双马尾',
    avatars: [
      { id: 'girl-02', label: '双马尾蓝头绳', src: studentGirl02 },
      { id: 'girl-10', label: '高双马尾白头绳', src: studentGirl10 },
      { id: 'girl-18', label: '低双马尾红头绳', src: studentGirl18 },
    ],
  },
  {
    id: 'bun',
    label: '丸子头',
    avatars: [
      { id: 'girl-06', label: '高丸子头青发带', src: studentGirl06 },
      { id: 'girl-04', label: '双丸子粉头绳', src: studentGirl04 },
      { id: 'girl-14', label: '编发双丸子', src: studentGirl14 },
    ],
  },
  {
    id: 'short',
    label: '短发',
    avatars: [
      { id: 'girl-03', label: '短波波红发夹', src: studentGirl03 },
      { id: 'girl-08', label: '齐耳短发双色发夹', src: studentGirl08 },
      { id: 'girl-13', label: '齐耳短发星星发夹', src: studentGirl13 },
      { id: 'girl-20', label: '直短发交叉发夹', src: studentGirl20 },
    ],
  },
  {
    id: 'long',
    label: '长发与发箍',
    avatars: [
      { id: 'girl-05', label: '长直发黄发箍', src: studentGirl05 },
      { id: 'girl-09', label: '中长发绿发箍', src: studentGirl09 },
      { id: 'girl-16', label: '中分长发蓝发箍', src: studentGirl16 },
      { id: 'girl-19', label: '微卷中长发紫发箍', src: studentGirl19 },
    ],
  },
  {
    id: 'braid',
    label: '编发',
    avatars: [
      { id: 'girl-11', label: '双麻花辫绿头绳', src: studentGirl11 },
      { id: 'girl-17', label: '侧麻花辫雏菊发夹', src: studentGirl17 },
    ],
  },
];

export const studentBoyAvatarGroups: StudentAvatarGroup[] = [
  {
    id: 'very-short',
    label: '极短发',
    avatars: [
      { id: 'boy-01', label: '清爽圆寸', src: studentBoy01 },
      { id: 'boy-02', label: '短寸碎顶', src: studentBoy02 },
      { id: 'boy-03', label: '渐变短寸', src: studentBoy03 },
    ],
  },
  {
    id: 'textured-short',
    label: '短碎发',
    avatars: [
      { id: 'boy-04', label: '活力短碎发', src: studentBoy04 },
      { id: 'boy-05', label: '上扬碎发', src: studentBoy05 },
      { id: 'boy-06', label: '自然乱碎发', src: studentBoy06 },
      { id: 'boy-07', label: '立体短刺', src: studentBoy07 },
      { id: 'boy-08', label: '斜刘海碎发', src: studentBoy08 },
    ],
  },
  {
    id: 'side-part',
    label: '侧分',
    avatars: [
      { id: 'boy-09', label: '棕色侧分', src: studentBoy09 },
      { id: 'boy-10', label: '经典左侧分', src: studentBoy10 },
      { id: 'boy-11', label: '黑色右侧分', src: studentBoy11 },
      { id: 'boy-12', label: '逗号刘海', src: studentBoy12 },
      { id: 'boy-13', label: '顺滑侧扫', src: studentBoy13 },
    ],
  },
  {
    id: 'fringe',
    label: '刘海',
    avatars: [
      { id: 'boy-14', label: '齐刘海锅盖', src: studentBoy14 },
      { id: 'boy-15', label: '弧形蘑菇头', src: studentBoy15 },
      { id: 'boy-16', label: '中分帘式', src: studentBoy16 },
      { id: 'boy-17', label: '法式短刘海', src: studentBoy17 },
    ],
  },
  {
    id: 'curly',
    label: '卷发',
    avatars: [
      { id: 'boy-18', label: '黑色自然卷', src: studentBoy18 },
      { id: 'boy-19', label: '棕色波浪卷', src: studentBoy19 },
      { id: 'boy-20', label: '黑色小卷', src: studentBoy20 },
    ],
  },
];

export const studentGirlAvatars = studentGirlAvatarGroups.flatMap(group => group.avatars.map(avatar => avatar.src));
export const studentBoyAvatars = studentBoyAvatarGroups.flatMap(group => group.avatars.map(avatar => avatar.src));

export const getSystemStudentAvatar = (gender: 'male' | 'female', seed: number) => {
  const avatarPool = gender === 'male' ? studentBoyAvatars : studentGirlAvatars;
  return avatarPool[Math.abs(seed) % avatarPool.length];
};
