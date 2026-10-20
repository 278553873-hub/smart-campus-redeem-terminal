import React, { useState } from 'react';
import { ASSETS } from '../assets/images';

interface TeacherAvatarProps {
  src?: string;
}

/** 教师资料头像：无上传图片或加载失败时使用统一默认图。姓名由相邻内容提供。 */
export default function TeacherAvatar({ src }: TeacherAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const uploadedSrc = src?.trim();
  const imageSrc = uploadedSrc && uploadedSrc !== failedSrc ? uploadedSrc : ASSETS.AVATAR.TEACHER_DEFAULT;

  return (
    <img
      key={imageSrc}
      src={imageSrc}
      alt=""
      className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] object-cover"
      onError={imageSrc === uploadedSrc ? () => setFailedSrc(uploadedSrc) : undefined}
    />
  );
}
