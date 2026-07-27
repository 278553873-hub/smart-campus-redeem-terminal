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

export const studentGirlAvatars = studentGirlAvatarGroups.flatMap(group => group.avatars.map(avatar => avatar.src));
