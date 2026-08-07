import React from 'react';

interface MobileEmptyStateProps {
    imageSrc: string;
    title: string;
    className?: string;
    imageClassName?: string;
}

const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
    imageSrc,
    title,
    className = '',
    imageClassName = 'w-[68%] min-w-[168px] max-w-[224px]',
}) => (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} role="status">
        <img src={imageSrc} alt="" className={`${imageClassName} object-contain`} />
        <p className="mt-2 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-secondary)]">{title}</p>
    </div>
);

export default MobileEmptyState;
