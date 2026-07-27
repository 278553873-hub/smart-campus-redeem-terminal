import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(({
  value,
  onChange,
  minHeight = 44,
  maxHeight = 84,
  ...props
}, forwardedRef) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [maxHeight, minHeight, value]);

  return <textarea ref={textareaRef} rows={1} value={value} onChange={onChange} {...props} />;
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export default AutoResizeTextarea;
