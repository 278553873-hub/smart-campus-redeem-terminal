import React from 'react';
import rankingBadgeSheet from '../../assets/resources/ranking-badges-metallic.png';

interface MobileRankingBadgeProps {
    rank: number;
    size?: 'compact' | 'standard';
    /** 表格只标识前三名；已有排名列则保留后续名次数字。 */
    showOtherRanks?: boolean;
    award?: boolean;
}

// imagegen 生成的透明图集：三个等尺寸裁切窗口，保持金属光泽和数字原貌。
const badgeSheet = { width: 1672, height: 940, tileWidth: 440, tileHeight: 490, top: 204, left: [96, 614, 1134] } as const;

/** 名次由业务层提供；前三名使用生成的金银铜图片，后续名次保持普通数字。 */
export default function MobileRankingBadge({ rank, size = 'standard', showOtherRanks = true, award = true }: MobileRankingBadgeProps) {
    if (!Number.isInteger(rank) || rank < 1) return null;
    const badgeLeft = award ? badgeSheet.left[rank - 1] : undefined;
    if (badgeLeft === undefined && !showOtherRanks) return null;
    const badgeSize = `var(--tm-ranking-size-${size})`;
    const dimensions = { width: badgeSize, height: `calc(${badgeSize} * ${badgeSheet.tileHeight / badgeSheet.tileWidth})` };

    if (badgeLeft === undefined) return (
        <span aria-label={`第${rank}名`} className="inline-flex shrink-0 items-center justify-center justify-self-center text-[length:var(--tm-font-size-meta)] font-semibold tabular-nums text-[var(--tm-text-secondary)]" style={dimensions}>
            {rank}
        </span>
    );

    return (
        <span
            role="img"
            aria-label={`第${rank}名`}
            className="inline-flex shrink-0 justify-self-center bg-no-repeat align-middle"
            style={{
                ...dimensions,
                backgroundImage: `url(${rankingBadgeSheet})`,
                backgroundSize: `${badgeSheet.width / badgeSheet.tileWidth * 100}% ${badgeSheet.height / badgeSheet.tileHeight * 100}%`,
                backgroundPosition: `${badgeLeft / (badgeSheet.width - badgeSheet.tileWidth) * 100}% ${badgeSheet.top / (badgeSheet.height - badgeSheet.tileHeight) * 100}%`,
            }}
        />
    );
}
