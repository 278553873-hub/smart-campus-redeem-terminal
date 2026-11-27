import React from 'react';
import StackedGlassCardBackground, { stackedGlassCardGeometry } from '../ui/StackedGlassCardBackground';

const { rearOffset, notchDepth, notchShift } = stackedGlassCardGeometry;
export const studentDetailProfileLayout = {
    '--profile-rear-offset': `${rearOffset}px`,
    '--profile-notch-depth': `${notchDepth}px`,
    '--profile-notch-shift': `${notchShift * 100}%`,
} as React.CSSProperties;

export default function StudentDetailProfileGlass() {
    return <StackedGlassCardBackground className="student-detail-profile-glass" />;
}
