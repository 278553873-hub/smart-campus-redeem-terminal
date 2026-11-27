import React from 'react';
import { Award, BookOpen, Heart, Star, Trophy } from 'lucide-react';
import type { MedalIcon, MedalIconKey } from '../../domain/medal';

const iconMap: Record<MedalIconKey, React.ComponentType<{ className?: string }>> = {
  award: Award,
  book: BookOpen,
  heart: Heart,
  star: Star,
  trophy: Trophy,
};

interface MedalIconViewProps {
  icon: MedalIcon;
  className?: string;
}

const MedalIconView: React.FC<MedalIconViewProps> = ({ icon, className = 'h-5 w-5' }) => {
  if (typeof icon === 'object') {
    return <img src={icon.src} alt={icon.alt ?? ''} className={`object-contain ${className}`} />;
  }
  const Icon = iconMap[icon];
  return <Icon className={className} />;
};

export default MedalIconView;
