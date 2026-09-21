import { useEffect, useState } from 'react';

/** 按当前时间给出教师端统一的问候语。 */
export const getAssistantGreeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
};

/** 打字机节奏：换行与句读保留短停顿，普通字符保持稳定速度。 */
export const getAssistantTypeDelay = (char: string) => {
  if (char === '\n') return 280;
  if (char === '，') return 150;
  if (char === '。') return 220;
  return 56;
};

/** 开场白逐字显示；开启减少动态效果时直接给出完整文案。 */
export const useAssistantTypewriter = (message: string) => {
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedMessage(message);
      return undefined;
    }

    let index = 0;
    let timer: number | undefined;
    const typeNext = () => {
      index += 1;
      setTypedMessage(message.slice(0, index));
      if (index >= message.length) return;
      timer = window.setTimeout(typeNext, getAssistantTypeDelay(message[index - 1]));
    };
    timer = window.setTimeout(typeNext, 240);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [message]);

  return typedMessage;
};
