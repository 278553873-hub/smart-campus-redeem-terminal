import { useSyncExternalStore } from 'react';
import { ASSETS } from '../assets/images';
import type { Student } from '../types';

/**
 * 演示用「学生人脸库」。
 *
 * 解决的问题：老师在「更新人脸」页录入人脸后，学生卡片上的形象要跟着变成采集照。
 * 人脸库是跨页面的共享状态，所以收在这里统一维护，页面不各自存一份。
 *
 * 说明：真实产品里人脸底图和学生头像（avatar）是两份数据；演示为了表达
 * 「已录入人脸」的状态，把采集照合并到学生头像上展示。
 */

const faceByStudentId = new Map<string, string>();
const seededClassIds = new Set<string>();
const cursorByClassGender = new Map<string, number>();
const listeners = new Set<() => void>();
let version = 0;

const getGenderKey = (student: Student) => (student.gender === 'female' ? 'female' : 'male');

const getFacePool = (student: Student) => (
  getGenderKey(student) === 'female' ? ASSETS.AVATAR.FACE_SAMPLE_GIRLS : ASSETS.AVATAR.FACE_SAMPLE_BOYS
);

const recordFace = (student: Student, classId: string) => {
  if (!student || faceByStudentId.has(student.id)) return;
  const key = classId + ':' + getGenderKey(student);
  const cursor = cursorByClassGender.get(key) ?? 0;
  cursorByClassGender.set(key, cursor + 1);
  const pool = getFacePool(student);
  faceByStudentId.set(student.id, pool[cursor % pool.length]);
};

/**
 * 按现有演示规则预置某个班级的人脸库：花名册前 60% 的学生视为已录入。
 * 同一个班级只处理一次；只初始化数据，不通知订阅者，因此可以安全地在渲染期调用。
 */
export const seedClassFaceLibrary = (classId: string, students: Student[]) => {
  if (!classId || seededClassIds.has(classId)) return;
  seededClassIds.add(classId);
  const recordedCount = Math.ceil(students.length * 0.6);
  students.slice(0, recordedCount).forEach(student => {
    if (student.avatar) recordFace(student, classId);
  });
};

/** 老师完成一次人脸录入，全端学生卡片随之更新。 */
export const markStudentFaceRecorded = (student: Student, classId: string) => {
  if (faceByStudentId.has(student.id)) return;
  recordFace(student, classId);
  version += 1;
  listeners.forEach(listener => listener());
};

export const isStudentFaceRecorded = (studentId: string) => faceByStudentId.has(studentId);

export const getStudentFaceSrc = (studentId: string) => faceByStudentId.get(studentId);

/** 学生头像的唯一取值入口：已录入人脸用采集照，否则用学生自己的头像。 */
export const resolveStudentAvatar = (student: Student) => faceByStudentId.get(student.id) ?? student.avatar;

/** 批量把采集照合并进学生列表，供页面直接沿用 student.avatar 的既有写法。 */
export const applyFaceAvatars = (students: Student[]) => students.map(student => {
  const faceSrc = faceByStudentId.get(student.id);
  return faceSrc && faceSrc !== student.avatar ? { ...student, avatar: faceSrc } : student;
});

export const subscribeStudentFaceLibrary = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getStudentFaceLibraryVersion = () => version;

/** 订阅人脸库变化，让展示学生头像的页面在录入后自动刷新。 */
export const useStudentFaceLibrary = () => useSyncExternalStore(
  subscribeStudentFaceLibrary,
  getStudentFaceLibraryVersion,
  getStudentFaceLibraryVersion,
);
