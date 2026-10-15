import React from 'react';

interface AvatarItem {
  id: string;
  src: string;
}

interface MobileAvatarCollageProps {
  avatars: AvatarItem[];
  fallbackSrc: string;
  label: string;
}

const layerPositions = ['left-0 z-30', 'left-2 z-20', 'left-4 z-10'];

/** 同尺寸头像向右层叠，首位学生完整置前；后方圆弧表达多人，总人数由文字摘要表达。 */
export default function MobileAvatarCollage({ avatars, fallbackSrc, label }: MobileAvatarCollageProps) {
  if (avatars.length === 0) return null;
  const single = avatars.length === 1;
  return (
    <span role="img" aria-label={label} className="relative isolate block h-11 w-[calc(var(--tm-size-touch)+var(--tm-space-4))] shrink-0">
      {avatars.slice(0, 3).map((avatar, index) => (
        <img
          key={avatar.id}
          src={avatar.src || fallbackSrc}
          alt=""
          decoding="async"
          onError={event => {
            const image = event.currentTarget;
            if (image.getAttribute('src') !== fallbackSrc) image.src = fallbackSrc;
          }}
          className={`absolute top-0 h-11 w-11 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover ${layerPositions[index]} ${single ? '' : 'ring-1 ring-[var(--tm-bg-surface)]'}`}
        />
      ))}
    </span>
  );
}
