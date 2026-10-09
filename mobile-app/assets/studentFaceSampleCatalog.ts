import faceGirl01 from './resources/student-face-samples/face-girl-01.jpg';
import faceGirl02 from './resources/student-face-samples/face-girl-02.jpg';
import faceGirl03 from './resources/student-face-samples/face-girl-03.jpg';
import faceGirl04 from './resources/student-face-samples/face-girl-04.jpg';
import faceGirl05 from './resources/student-face-samples/face-girl-05.jpg';
import faceGirl06 from './resources/student-face-samples/face-girl-06.jpg';
import faceGirl07 from './resources/student-face-samples/face-girl-07.jpg';
import faceGirl08 from './resources/student-face-samples/face-girl-08.jpg';
import faceGirl09 from './resources/student-face-samples/face-girl-09.jpg';
import faceGirl10 from './resources/student-face-samples/face-girl-10.jpg';
import faceBoy01 from './resources/student-face-samples/face-boy-01.jpg';
import faceBoy02 from './resources/student-face-samples/face-boy-02.jpg';
import faceBoy03 from './resources/student-face-samples/face-boy-03.jpg';
import faceBoy04 from './resources/student-face-samples/face-boy-04.jpg';
import faceBoy05 from './resources/student-face-samples/face-boy-05.jpg';
import faceBoy06 from './resources/student-face-samples/face-boy-06.jpg';
import faceBoy07 from './resources/student-face-samples/face-boy-07.jpg';
import faceBoy08 from './resources/student-face-samples/face-boy-08.jpg';
import faceBoy09 from './resources/student-face-samples/face-boy-09.jpg';
import faceBoy10 from './resources/student-face-samples/face-boy-10.jpg';

/**
 * 人脸采集示例素材：演示「更新人脸」页时，已录入学生展示这批采集照风格头像。
 * 与系统卡通头像（studentAvatarCatalog）区分：卡通头像是学生未上传统照片时的默认头像，
 * 这里的是模拟人脸采集结果。人物均为虚构角色，不指向任何真实人物。
 */
export const studentFaceSampleGirls: string[] = [
  faceGirl01,
  faceGirl02,
  faceGirl03,
  faceGirl04,
  faceGirl05,
  faceGirl06,
  faceGirl07,
  faceGirl08,
  faceGirl09,
  faceGirl10,
];

export const studentFaceSampleBoys: string[] = [
  faceBoy01,
  faceBoy02,
  faceBoy03,
  faceBoy04,
  faceBoy05,
  faceBoy06,
  faceBoy07,
  faceBoy08,
  faceBoy09,
  faceBoy10,
];

export const getStudentFaceSample = (gender: 'male' | 'female', index: number) => {
  const pool = gender === 'male' ? studentFaceSampleBoys : studentFaceSampleGirls;
  return pool[Math.abs(index) % pool.length];
};
