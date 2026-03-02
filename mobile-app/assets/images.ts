
import coverBoy from './resources/boy.png';
import coverGirl from './resources/girl.png';
import avatarBoy from './resources/avatar-boy.png';
import avatarGirl from './resources/avatar-girl.png';
import subjectReportIcon from './resources/subject-report.png';
import termReportIcon from './resources/term-report.png';
import certificateImg from './resources/certificate.png';
import genericGrowthImg from './resources/generic_growth.png';
import pingpongCertImg from './resources/pingpong_cert.png';
import aiBotImg from './resources/ai-bot.png';

import avatarBoy1 from './resources/avatar_boy_1.png';
import avatarBoy2 from './resources/avatar_boy_2.png';
import avatarBoy3 from './resources/avatar_boy_3.png';
import avatarBoy4 from './resources/avatar_boy_4.png';
import avatarBoy5 from './resources/avatar_boy_5.png';
import avatarBoy6 from './resources/avatar_boy_6.png';
import avatarBoy7 from './resources/avatar_boy_7.png';
import avatarGirl1 from './resources/avatar_girl_1.png';
import avatarGirl2 from './resources/avatar_girl_2.png';
import avatarGirl3 from './resources/avatar_girl_3.png';
import avatarGirl4 from './resources/avatar_girl_4.png';
import avatarGirl5 from './resources/avatar_girl_5.png';
import avatarGirl6 from './resources/avatar_girl_6.png';
import avatarGirl7 from './resources/avatar_girl_7.png';

// Resource file for project images
// Using Base64 SVGs to ensure images always load without external dependencies or local file setup.

const svgPrefix = "data:image/svg+xml;base64,";

// Helper to encode SVG string to Base64
const encodeSVG = (svgString: string) => svgPrefix + btoa(unescape(encodeURIComponent(svgString)));

// 1. Avatars
const boyAvatarSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#E5F1FF"/>
  <circle cx="50" cy="45" r="20" fill="#3B82F6"/>
  <path d="M30 85 Q50 100 70 85 V100 H30 Z" fill="#3B82F6"/>
  <circle cx="50" cy="45" r="18" fill="#FFD7B5"/>
  <path d="M30 35 Q50 10 70 35" fill="none" stroke="#1E3A8A" stroke-width="8" stroke-linecap="round"/>
  <circle cx="43" cy="45" r="2" fill="#1E3A8A"/>
  <circle cx="57" cy="45" r="2" fill="#1E3A8A"/>
  <path d="M45 55 Q50 60 55 55" fill="none" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const girlAvatarSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#FFF0F5"/>
  <path d="M20 50 Q10 70 30 90 L70 90 Q90 70 80 50 Q90 30 50 10 Q10 30 20 50" fill="#EC4899"/>
  <circle cx="50" cy="50" r="18" fill="#FFD7B5"/>
  <circle cx="43" cy="50" r="2" fill="#831843"/>
  <circle cx="57" cy="50" r="2" fill="#831843"/>
  <path d="M45 60 Q50 63 55 60" fill="none" stroke="#831843" stroke-width="2" stroke-linecap="round"/>
  <path d="M25 90 Q50 100 75 90" fill="#EC4899"/>
</svg>`;

const genericBoyAvatarSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#E2E8F0"/>
  <circle cx="50" cy="40" r="18" fill="#94A3B8"/>
  <path d="M25 90 C 25 65, 75 65, 75 90 Z" fill="#94A3B8"/>
</svg>`;

const genericGirlAvatarSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#FCE7F3"/>
  <circle cx="50" cy="40" r="18" fill="#F472B6"/>
  <path d="M25 90 C 25 65, 75 65, 75 90 Z" fill="#F472B6"/>
</svg>`;

const teacherWangSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#F8FAFC"/>
  <text x="50" y="65" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#94A3B8" font-weight="bold">王</text>
  <circle cx="50" cy="50" r="45" stroke="#CBD5E1" stroke-width="2" fill="none"/>
</svg>`;

const teacherLinSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#FFF7ED"/>
  <text x="50" y="65" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#FDBA74" font-weight="bold">林</text>
  <circle cx="50" cy="50" r="45" stroke="#FFEDD5" stroke-width="2" fill="none"/>
</svg>`;

const teacherLiuSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#F0FDF4"/>
  <text x="50" y="65" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#86EFAC" font-weight="bold">刘</text>
  <circle cx="50" cy="50" r="45" stroke="#DCFCE7" stroke-width="2" fill="none"/>
</svg>`;

// 2. Activities
const activitySportsSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
  <rect width="600" height="400" fill="#F0F9FF"/>
  <path d="M0 300 L600 300 L600 400 L0 400 Z" fill="#22C55E"/>
  <path d="M50 300 L150 200 L250 300 Z" fill="#16A34A" opacity="0.5"/>
  <path d="M400 300 L500 150 L600 300 Z" fill="#16A34A" opacity="0.5"/>
  <circle cx="100" cy="100" r="40" fill="#FDBA74"/>
  <text x="300" y="200" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#1E3A8A" font-weight="bold" opacity="0.2">SPORTS DAY</text>
  <path d="M50 350 Q300 320 550 350" stroke="white" stroke-width="10" stroke-dasharray="20 20" fill="none"/>
</svg>`;

const activityScienceSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
  <rect width="600" height="400" fill="#1E293B"/>
  <circle cx="300" cy="200" r="50" fill="#3B82F6"/>
  <ellipse cx="300" cy="200" rx="140" ry="40" stroke="#60A5FA" stroke-width="2" fill="none" transform="rotate(45 300 200)"/>
  <ellipse cx="300" cy="200" rx="140" ry="40" stroke="#60A5FA" stroke-width="2" fill="none" transform="rotate(-45 300 200)"/>
  <circle cx="400" cy="100" r="5" fill="white" opacity="0.8"/>
  <circle cx="100" cy="300" r="8" fill="white" opacity="0.6"/>
  <text x="300" y="350" font-family="sans-serif" font-size="30" text-anchor="middle" fill="#94A3B8" font-weight="bold" opacity="0.5">SCIENCE MUSEUM</text>
</svg>`;

const schoolSchoolSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
    <rect width="600" height="400" fill="#FFFBEB"/>
    <rect x="150" y="100" width="300" height="300" fill="#FCD34D"/>
    <polygon points="130,100 300,20 470,100" fill="#F59E0B"/>
    <rect x="250" y="250" width="100" height="150" fill="#78350F"/>
    <text x="300" y="80" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#78350F" font-weight="bold">FUTURE SCHOOL</text>
</svg>
`;

export const ASSETS = {
  AVATAR: {
    BOY: avatarBoy,
    GIRL: avatarGirl,
    GENERIC_BOY: encodeSVG(genericBoyAvatarSVG),
    GENERIC_GIRL: encodeSVG(genericGirlAvatarSVG),
    BOYS: [avatarBoy1, avatarBoy2, avatarBoy3, avatarBoy4, avatarBoy5, avatarBoy6, avatarBoy7, avatarBoy],
    GIRLS: [avatarGirl1, avatarGirl2, avatarGirl3, avatarGirl4, avatarGirl5, avatarGirl6, avatarGirl7, avatarGirl],
    TEACHER_WANG: encodeSVG(teacherWangSVG),
    TEACHER_LIN: encodeSVG(teacherLinSVG),
    TEACHER_LIU: encodeSVG(teacherLiuSVG),
  },
  COVER: {
    BOY: coverBoy,
    GIRL: coverGirl
  },
  ACTIVITY: {
    SPORTS: encodeSVG(activitySportsSVG),
    SCIENCE: encodeSVG(activityScienceSVG),
    SCHOOL: encodeSVG(schoolSchoolSVG),
  },
  MANAGEMENT: {
    SUBJECT: subjectReportIcon,
    TERM: termReportIcon,
    AI_BOT: aiBotImg,
  },
  HIGHLIGHTS: {
    CERTIFICATE: certificateImg,
    GENERIC_GROWTH: genericGrowthImg,
    PINGPONG_CERT: pingpongCertImg,
  }
};
