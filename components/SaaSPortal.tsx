import React, { useMemo, useState } from 'react';
import {
  Settings,
  User,
  Zap,
  Monitor,
  MonitorSmartphone,
  ShieldCheck,
  Eye,
  EyeOff,
  BookOpen,
  LayoutGrid,
  PhoneCall,
  ChevronRight,
  X,
  Sparkles,
  MicVocal,
  Clapperboard,
  GalleryVerticalEnd,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import PlatformBrandMark from './PlatformBrandMark';

export type PcPortalApp = 'teacher' | 'all-in-one' | 'smart-big-screen';

interface SaaSPortalProps {
  isLoggedIn: boolean;
  teacherProfile: { name: string; role: string; school: string; };
  onLoginSuccess: (profile: { name: string; role: string; school: string; }) => void;
  onLogout: () => void;
  onNavigate: (app: PcPortalApp) => void;
}

const sectionHeaderToneMap = {
  blue: 'border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f9ff_100%)] text-blue-600',
  violet: 'border-violet-100 bg-[linear-gradient(135deg,#f5f3ff_0%,#f5f3ff_100%)] text-violet-600',
  emerald: 'border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdfa_100%)] text-emerald-600',
} as const;

interface PortalSectionHeaderProps {
  title: string;
  icon: LucideIcon;
  tone?: keyof typeof sectionHeaderToneMap;
  compact?: boolean;
}

const PortalSectionHeader: React.FC<PortalSectionHeaderProps> = ({ title, icon: Icon, tone = 'blue', compact = false }) => (
  <div className={`flex shrink-0 items-center gap-3 ${compact ? 'mb-0' : 'mb-5'}`}>
    <div className={`flex shrink-0 items-center justify-center border shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${compact ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} ${sectionHeaderToneMap[tone]}`}>
      <Icon size={compact ? 16 : 18} strokeWidth={2.2} />
    </div>
    <h2 className={`whitespace-nowrap ${compact ? 'text-[17px]' : 'text-[20px]'} font-black tracking-[-0.02em] text-slate-900`}>{title}</h2>
  </div>
);

const SaaSPortal: React.FC<SaaSPortalProps> = ({ isLoggedIn, teacherProfile, onLoginSuccess, onLogout, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [credential, setCredential] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginTab, setLoginTab] = useState<'password' | 'code'>('password');
  const [storyWorkshopOpen, setStoryWorkshopOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credential === '123456') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoginError(false);
        const trimmed = username.trim();
        const loginProfile = /[一-龥]/.test(trimmed)
          ? {
            ...teacherProfile,
            name: trimmed.endsWith('老师') ? trimmed : `${trimmed}老师`,
          }
          : teacherProfile;
        onLoginSuccess(loginProfile);
      }, 800);
      return;
    }
    setLoginError(true);
    setTimeout(() => setLoginError(false), 2000);
  };

  const activeApps = [
    {
      id: 'teacher',
      name: '管理后台',
      desc: '高效管理班级与学生信息',
      icon: Settings,
      color: 'from-[#3b82f6] to-[#22d3ee]',
      shadow: 'shadow-blue-400/50',
      panelClass: 'border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6faff_74%,#eaf3ff_100%)]',
      bottomGlow: 'from-[#dbeafe] via-[#eff6ff] to-transparent',
      watermarkClass: 'text-blue-100/90',
      arrowClass: 'border-blue-200/80 bg-white text-blue-500 shadow-[0_12px_24px_rgba(59,130,246,0.16)]',
      target: 'teacher' as const,
      meta: '有效期至：2027-09-01',
      studentsCount: '开通学生：2530',
    },
    {
      id: 'smart-big-screen',
      name: '课堂大屏',
      desc: '课堂数据实时呈现与互动',
      icon: Monitor,
      color: 'from-[#10b981] to-[#2dd4bf]',
      shadow: 'shadow-emerald-400/50',
      panelClass: 'border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f4fffb_72%,#e7fbf7_100%)]',
      bottomGlow: 'from-[#ccfbf1] via-[#ecfdf5] to-transparent',
      watermarkClass: 'text-emerald-100/90',
      arrowClass: 'border-emerald-200/80 bg-white text-emerald-500 shadow-[0_12px_24px_rgba(16,185,129,0.16)]',
      target: 'smart-big-screen' as const,
      meta: '有效期至：2027-09-01',
    },
  ];

  const favoriteApps = [
    {
      id: 'picture-workshop',
      name: '绘本工坊',
      icon: BookOpen,
      color: 'from-[#8b5cf6] to-[#a78bfa]',
      shadow: 'shadow-violet-400/40',
      desc: 'AI 美育产品，将学生的手绘作品生成视频',
      price: '按 token 计费',
      ctaLabel: '了解更多',
    },
  ];

  const storyWorkshopHighlights = [
    {
      title: '原创优先',
      desc: '以学生原始手绘为核心输入，重点保留童真线条、构图和表达，而不是直接替代创作。',
      icon: <BookOpen size={18} />,
      tone: 'bg-violet-50 text-violet-600',
    },
    {
      title: '成果闭环',
      desc: '把画面、文字、声音、动画、字幕与配乐串成完整链路，让课堂作品直接升级为数字成果。',
      icon: <Clapperboard size={18} />,
      tone: 'bg-sky-50 text-sky-600',
    },
    {
      title: '教学适配',
      desc: '围绕课堂真实流程设计，方便教师组织创作、收集作品、展示成果并长期沉淀案例。',
      icon: <GraduationCap size={18} />,
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const storyWorkshopCapabilities = [
    '上传多页手绘作品，支持排序、裁剪与页面管理',
    '逐页补充故事文案，支持 AI 文案优化',
    '学生真人录音与 AI 配音双模式',
    '基于原画生成动画、字幕、配乐与完整成片',
  ];

  const storyWorkshopScenes = ['美术课堂成果升级', '校园艺术节展演', '开放日展示传播', '学生数字作品集沉淀'];

  const storyWorkshopFlow = [
    '上传多页原创画作',
    '补充文案或录制旁白',
    'AI生成动画、字幕与配乐',
    '输出绘本、视频与作品库',
  ];

  const storyWorkshopDeliverables = [
    {
      title: '课程展示成片',
      desc: '每个主题都能快速产出可播放的绘本视频，方便课堂汇报、班级展示和家长回看。',
      tag: '课堂即用',
    },
    {
      title: '学生数字作品集',
      desc: '把分散的画作持续沉淀为个人或班级作品库，便于阶段汇报、学期留档和成长记录。',
      tag: '长期沉淀',
    },
    {
      title: '学校品牌案例',
      desc: '将优质作品升级为开放日、艺术节、公众号都能直接使用的数字传播内容。',
      tag: '对外传播',
    },
  ];

  const promoCards = [
    {
      id: 'point-bank',
      title: '积分银行',
      tags: ['学生端', '一体机端'],
      lines: ['查询个人的校园币', '以及进行银行存储'],
      tone: 'orange',
      icon: <MonitorSmartphone size={35} />,
      btnLabel: '立即访问',
      action: () => window.open('?app=all-in-one', '_blank'),
    },
    {
      id: 'ai-literacy',
      title: 'AI素养评价',
      tags: ['教师端', '微信小程序'],
      lines: ['便捷录入日常行为', '随时查看素养报告'],
      tone: 'blue',
      qrCode: '/assets/ai_literacy_qr.png',
    },
    {
      id: 'compass',
      title: '素养指南针',
      tags: ['家长端', '微信小程序'],
      lines: ['绑定学生信息后', '可以随时查看报告'],
      tone: 'emerald',
      qrCode: '/assets/compass_qr.png',
    },
  ];

  const emotionalMessages = [
    '辛苦你继续照亮课堂，很多成长都在你看不见的地方发生。',
    '谢谢你把耐心留给每一个孩子，今天的认真会被孩子们记住。',
    '因为你的守护，教室里的每一次进步都更有力量。',
    '孩子们的自信，往往从你一句温柔而坚定的鼓励开始。',
    '感谢你把平凡的一天，教成了孩子们值得回忆的一课。',
    '你今天投入的每一分认真，都会变成孩子向前走的一小步。',
  ];

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
        style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #fdfcfd 50%, #fff0f5 100%)' }}
      >
        <div className="absolute top-[15%] left-[15%] w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[250px] h-[250px] bg-pink-200/40 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/60 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#2a68ff] rounded flex items-center justify-center shadow-md shadow-blue-200 shrink-0 text-white">
              <PlatformBrandMark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">乐途AI智慧教育平台</h2>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">学校端安全登录</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setLoginTab('password'); setCredential(''); }}
              className={`flex-1 py-2.5 rounded text-sm font-bold transition-all ${loginTab === 'password' ? 'bg-[#2a68ff] border border-[#2a68ff] text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              密码登录
            </button>
            <button
              type="button"
              onClick={() => { setLoginTab('code'); setCredential(''); }}
              className={`flex-1 py-2.5 rounded text-sm font-bold transition-all ${loginTab === 'code' ? 'bg-[#2a68ff] border border-[#2a68ff] text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              验证码登录
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="flex text-[11px] font-bold text-slate-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span>
                手机号
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入手机号（演示环境任意输入）"
                  className="w-full h-[42px] pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-[#2a68ff] focus:ring-1 focus:ring-[#2a68ff] transition-all"
                />
              </div>
            </div>

            {loginTab === 'password' ? (
              <div>
                <label className="flex text-[11px] font-bold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="请输入密码（演示密码：123456）"
                    className="w-full h-[42px] pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-[#2a68ff] focus:ring-1 focus:ring-[#2a68ff] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? '点击隐藏密码' : '点击显示密码'}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex text-[11px] font-bold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>
                  验证码
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="请输入验证码（演示验证码：123456）"
                    className="w-full h-[42px] pl-9 pr-24 py-2.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-[#2a68ff] focus:ring-1 focus:ring-[#2a68ff] transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#2a68ff] bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    获取验证码
                  </button>
                </div>
              </div>
            )}

            <div className="h-4 flex items-center">
              {loginError && <span className="text-red-500 text-[11px] font-bold animate-in slide-in-from-top-1">账号或密码错误，请重试</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[40px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '立即登录'}
            </button>

            <div className="flex justify-end pt-1">
              <button type="button" className="text-[11px] font-bold text-[#2a68ff] hover:underline">
                忘记密码？
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][today.getDay()]}`;
  const emotionalMessage = useMemo(() => {
    const seed = `${teacherProfile.name}-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % emotionalMessages.length;
    return emotionalMessages[index];
  }, [teacherProfile.name]);

  const handleFavoriteAppClick = (appId: string) => {
    if (appId === 'picture-workshop') {
      setStoryWorkshopOpen(true);
    }
  };

  return (
    <div className="h-full bg-[#f5f7fa] font-sans overflow-y-auto [scrollbar-gutter:stable]">
      <main className="p-6 xl:p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-5">

          {/* ── 顶部欢迎横幅 ── */}
          <section className="relative overflow-hidden rounded-lg bg-white px-8 py-6 shadow-sm border border-slate-100">
            {/* 右侧品牌化轻插画区 */}
            <div className="pointer-events-none absolute inset-y-0 right-6 hidden w-[340px] xl:block">
              <div className="relative h-full w-full">
                <div className="absolute right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-sky-100/70 blur-3xl" />
                <div className="absolute right-0 top-10 h-24 w-24 rounded-full bg-cyan-100/65 blur-2xl" />
                <div className="absolute left-20 bottom-5 h-20 w-20 rounded-full bg-blue-100/60 blur-2xl" />

                <div className="absolute right-8 top-1/2 h-[126px] w-[220px] -translate-y-1/2 rounded-[2rem] border border-sky-100/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.92)_0%,rgba(255,255,255,0.96)_54%,rgba(236,254,255,0.92)_100%)] shadow-[0_24px_52px_rgba(148,163,184,0.14)]">
                  <div className="absolute inset-x-0 top-0 h-12 rounded-t-[2rem] bg-gradient-to-r from-blue-100/55 via-white/20 to-cyan-100/55" />
                  <div className="absolute left-5 top-6 h-2 w-16 rounded-full bg-blue-100/90" />
                  <div className="absolute left-5 top-12 h-2 w-11 rounded-full bg-slate-100" />
                  <div className="absolute left-5 bottom-6 flex gap-2">
                    <span className="h-9 w-9 rounded-2xl bg-blue-50 shadow-sm" />
                    <span className="h-9 w-9 rounded-2xl bg-cyan-50 shadow-sm" />
                    <span className="h-9 w-9 rounded-2xl bg-emerald-50 shadow-sm" />
                  </div>
                  <PlatformBrandMark className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-200/75" size={54} />
                </div>

                <div className="absolute left-4 top-7 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-blue-100/80 bg-white/90 text-blue-500 shadow-[0_18px_34px_rgba(59,130,246,0.12)]">
                  <Settings size={26} strokeWidth={2.1} />
                </div>
                <div className="absolute left-14 bottom-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-violet-100/80 bg-white/92 text-violet-500 shadow-[0_18px_34px_rgba(139,92,246,0.10)]">
                  <BookOpen size={22} strokeWidth={2.1} />
                </div>
                <div className="absolute right-28 bottom-7 flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-emerald-100/80 bg-white/92 text-emerald-500 shadow-[0_16px_28px_rgba(16,185,129,0.10)]">
                  <Monitor size={19} strokeWidth={2.1} />
                </div>
              </div>
            </div>
            <div className="relative xl:max-w-[calc(100%-360px)]">
              <h1 className="text-[28px] font-black text-slate-800 tracking-tight leading-tight">
                {teacherProfile.name}，您好！ 👏
              </h1>
              <p className="mt-1.5 text-[15px] font-medium text-slate-500">{emotionalMessage}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-medium text-slate-500">{dateStr}</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[13px] font-medium text-blue-500">{teacherProfile.school}</span>
              </div>
            </div>
          </section>

          {/* ── 主内容两栏布局 ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1000px_1fr] gap-6">

            {/* 左栏 */}
            <div className="flex flex-col gap-6">

              {/* 我的应用 */}
              <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
                <PortalSectionHeader title="我的应用" icon={Settings} tone="blue" />

                <div className="grid grid-cols-2 gap-4">
                  {activeApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => app.target && onNavigate(app.target)}
                      className={`group relative overflow-hidden rounded-lg border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(148,163,184,0.18)] active:scale-95 ${app.panelClass}`}
                    >
                      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${app.bottomGlow}`} />
                      <div className="pointer-events-none absolute -right-4 top-6 opacity-100">
                        <app.icon size={148} strokeWidth={1.3} className={app.watermarkClass} />
                      </div>
                      <div className="relative flex h-full min-h-[198px] flex-col">
                        <div className={`inline-flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-[0_20px_40px_rgba(59,130,246,0.18)] ${app.shadow} transition-transform duration-300 group-hover:scale-105`}>
                          <app.icon size={30} strokeWidth={2.2} className="text-white" />
                        </div>
                        <div className="mt-7 max-w-[72%]">
                          <div className="text-[20px] font-black tracking-[-0.03em] text-slate-900">{app.name}</div>
                          <div className="mt-2 text-[14px] font-semibold leading-6 text-slate-500">{app.desc}</div>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
                          <div className="flex flex-col gap-0.5">
                            {(app as any).studentsCount && (
                              <span className="text-[14px] font-semibold tracking-[0.01em] text-slate-400">{(app as any).studentsCount}</span>
                            )}
                            <span className="text-[14px] font-semibold tracking-[0.01em] text-slate-400">{app.meta}</span>
                          </div>
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5 ${app.arrowClass}`}>
                            <ChevronRight size={20} strokeWidth={2.2} />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* 更多应用 */}
              <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
                <PortalSectionHeader title="更多应用" icon={LayoutGrid} tone="violet" />

                <div className="grid grid-cols-2 gap-4">
                  {favoriteApps.map((app) => (
                    <article
                      key={app.id}
                      className="group flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-5 text-left transition-all hover:border-blue-100 hover:bg-white hover:shadow-sm"
                    >
                      <div className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} shadow-md ${app.shadow} transition-transform group-hover:scale-105 duration-300`}>
                        <app.icon size={30} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="text-[20px] font-black tracking-[-0.02em] text-slate-900">{app.name}</div>
                        <p className="mt-1.5 text-[14px] font-medium leading-6 text-slate-500">{app.desc}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[14px] font-bold text-slate-600">{app.price}</span>
                          <button
                            type="button"
                            onClick={() => handleFavoriteAppClick(app.id)}
                            className={`text-[13px] font-bold flex items-center gap-0.5 transition-colors ${app.id === 'picture-workshop' ? 'text-blue-500 hover:text-blue-700 active:scale-95' : 'text-slate-300 cursor-default'}`}
                          >
                            {app.ctaLabel} {app.id === 'picture-workshop' && <ChevronRight size={13} />}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* 右栏 */}
            <aside className="flex h-full flex-col gap-6">

              {/* 联系我们 */}
              <section className="rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-none">
                <div className="flex flex-col gap-3">
                  <PortalSectionHeader title="服务与支持" icon={PhoneCall} tone="emerald" compact />
                  <div className="flex items-center gap-3">
                    {[
                      { name: '曹老师', phone: '18011564926' },
                      { name: '贾老师', phone: '13908238448' },
                    ].map((adviser) => (
                      <div key={adviser.phone} className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 transition-colors hover:border-slate-300">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                          <User size={12} />
                        </div>
                        <span className="text-[12px] font-bold text-slate-700">{adviser.name}</span>
                        <span className="text-[12px] font-semibold text-slate-400">|</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                          <PhoneCall size={11} />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-500 tabular-nums">{adviser.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 卡片组：三个卡片并排 */}
              <div className="grid grid-cols-3 gap-5 flex-1">
                {promoCards.map((card) => {
                  const theme = card.tone === 'blue'
                    ? {
                      sectionClass: 'border-blue-100 bg-[linear-gradient(180deg,#f2f7ff_0%,#e1edff_100%)] shadow-[0_18px_36px_rgba(59,130,246,0.16)] hover:shadow-[0_24px_44px_rgba(59,130,246,0.22)]',
                      iconBgClass: 'border border-blue-100 bg-white shadow-[0_14px_28px_rgba(59,130,246,0.10)] text-slate-800',
                      tagClass: 'bg-blue-500',
                      titleClass: 'text-blue-950',
                      lineClass: 'text-slate-600',
                      decorClass: 'bg-blue-200/40',
                    }
                    : card.tone === 'emerald'
                      ? {
                        sectionClass: 'border-emerald-100 bg-[linear-gradient(180deg,#effcf7_0%,#daf7ee_100%)] shadow-[0_18px_36px_rgba(16,185,129,0.14)] hover:shadow-[0_24px_44px_rgba(16,185,129,0.20)]',
                        iconBgClass: 'border border-emerald-100 bg-white shadow-[0_14px_28px_rgba(16,185,129,0.10)] text-slate-800',
                        tagClass: 'bg-emerald-500',
                        titleClass: 'text-emerald-950',
                        lineClass: 'text-slate-600',
                        decorClass: 'bg-emerald-200/45',
                      }
                      : {
                        sectionClass: 'border-orange-100 bg-[linear-gradient(180deg,#fff9f2_0%,#ffe9cf_100%)] shadow-[0_18px_36px_rgba(249,115,22,0.14)] hover:shadow-[0_24px_44px_rgba(249,115,22,0.20)]',
                        iconBgClass: 'bg-gradient-to-br from-[#f97316] to-[#fbbf24] shadow-[0_14px_28px_rgba(249,115,22,0.24)] text-white',
                        tagClass: 'bg-orange-500',
                        titleClass: 'text-orange-950',
                        lineClass: 'text-slate-600',
                        decorClass: 'bg-orange-200/45',
                      };

                  return (
                    <section
                      key={card.id}
                      className={`relative overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:-translate-y-0.5 flex flex-col text-center ${theme.sectionClass}`}
                    >
                      <div className={`pointer-events-none absolute -right-10 top-3 h-28 w-28 rounded-full blur-2xl ${theme.decorClass}`} />

                      {/* 顶部图标/二维码区域 */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-[78px] h-[78px] flex items-center justify-center mb-4 rounded-xl ${theme.iconBgClass}`}>
                          {card.qrCode ? (
                            <img
                              src={card.qrCode}
                              alt={card.title}
                              className="w-full h-full object-contain mix-blend-multiply p-1.5"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const sibling = target.nextElementSibling as HTMLElement;
                                if (sibling) sibling.style.display = 'grid';
                              }}
                            />
                          ) : (
                            card.icon
                          )}
                          {/* 占位格子 */}
                          {card.qrCode && (
                            <div className="hidden w-full h-full grid grid-cols-7 gap-0.5 p-1.5">
                              {Array.from({ length: 49 }, (_, idx) => {
                                const filled = [0, 1, 5, 6, 7, 13, 14, 20, 28, 30, 31, 34, 35, 41, 42, 43, 47, 48].includes(idx);
                                return <span key={idx} className={`rounded-[2px] ${filled ? 'bg-slate-500' : 'bg-slate-200/60'}`} />;
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 文案区域（统一高度、顶部对齐） */}
                      <div className="relative flex-1 flex flex-col justify-start">
                        <div className={`mb-2.5 text-[19px] font-black tracking-[-0.02em] ${theme.titleClass}`}>{card.title}</div>

                        {/* 标签 */}
                        <div className="flex flex-nowrap whitespace-nowrap justify-center gap-1.5 mb-2.5">
                          {card.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white ${theme.tagClass}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 简介 */}
                        <div className="space-y-0.5">
                          {card.lines.map((line) => (
                            <p key={line} className={`text-[12px] font-medium leading-relaxed ${theme.lineClass}`}>{line}</p>
                          ))}
                        </div>
                      </div>

                      {/* 底部按钮（仅限积分银行有） */}
                      {card.btnLabel && (
                        <div className="mt-4">
                          <button
                            onClick={card.action}
                            className="w-full py-2 rounded-lg bg-white border border-orange-200 text-orange-500 text-[13px] font-bold hover:bg-orange-50 transition-colors shadow-sm"
                          >
                            {card.btnLabel}
                          </button>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className={`fixed inset-0 z-[120] flex items-start justify-center px-8 py-8 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${storyWorkshopOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-md" onClick={() => setStoryWorkshopOpen(false)} />
        <div
          className={`relative flex max-h-[calc(100vh-64px)] w-full max-w-[1040px] flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.18)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${storyWorkshopOpen ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/92 px-8 py-4 backdrop-blur-xl">
            <div>
              <div className="text-[11px] font-black tracking-[0.16em] text-slate-400">产品介绍</div>
              <div className="mt-1 text-[18px] font-black text-slate-900">AI绘本工坊</div>
            </div>
            <button
              type="button"
              onClick={() => setStoryWorkshopOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:border-slate-300 hover:text-slate-600 active:scale-95"
              aria-label="关闭绘本工坊介绍"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8 overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-[linear-gradient(135deg,#f7f6ff_0%,#eef5ff_48%,#ffffff_100%)] px-8 py-8">
              <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-violet-100/75 blur-3xl" />
              <div className="absolute right-28 top-14 h-32 w-32 rounded-full bg-sky-100/70 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-fuchsia-100/50 blur-3xl" />
              <div className="relative grid grid-cols-[1.08fr_0.92fr] items-start gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1 text-[11px] font-black tracking-[0.18em] text-violet-600 backdrop-blur-md">
                    <Sparkles size={14} />
                    AI赋能美育
                  </div>
                  <h3 className="mt-5 text-[34px] font-black tracking-[-0.04em] text-slate-900">
                    AI绘本工坊
                  </h3>
                  <p className="mt-3 max-w-[620px] text-[17px] font-bold leading-8 text-slate-700">
                    让孩子从“画一张画”，走向“完成一件可展示、可讲述、可传播的数字艺术作品”。
                  </p>
                  <p className="mt-3 max-w-[620px] text-[14px] font-medium leading-7 text-slate-500">
                    以学生原创手绘为起点，串联文案、旁白、动画、字幕、配乐与成果展示，让课堂作品真正走出纸面，成为学校、教师、家长都能看见的数字成果。
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {storyWorkshopHighlights.map((item) => (
                      <article key={item.title} className="rounded-[1.75rem] border border-white/80 bg-white/75 px-5 py-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)] backdrop-blur-md">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                          {item.icon}
                        </div>
                        <div className="mt-4 text-[15px] font-black text-slate-900">{item.title}</div>
                        <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">{item.desc}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="relative pt-8">
                  <div className="absolute inset-x-10 top-0 h-48 rounded-[2rem] bg-gradient-to-br from-violet-300/20 to-sky-200/20 blur-2xl" />
                  <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(76,29,149,0.12)] backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-black tracking-[0.16em] text-slate-400">成果链路</div>
                        <div className="mt-1 text-[18px] font-black text-slate-900">从手绘到数字艺术作品</div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg shadow-violet-300/40">
                        <BookOpen size={20} />
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {storyWorkshopFlow.map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[12px] font-black text-white">
                            0{index + 1}
                          </div>
                          <p className="text-[14px] font-bold text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(135deg,#111827_0%,#312e81_100%)] px-4 py-4 text-white">
                      <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-white/60">
                        <Zap size={14} />
                        产品内核
                      </div>
                      <p className="mt-2 text-[14px] font-medium leading-6 text-white/85">
                        我们不是“帮孩子生成内容”，而是帮助孩子把原创内容表达得更完整。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-[1.15fr_0.85fr] items-start gap-6">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                  <div className="text-[12px] font-black tracking-[0.16em] text-slate-400">核心价值</div>
                  <p className="mt-3 text-[15px] font-medium leading-7 text-slate-600">
                    面向学校与教育机构的美育数字创作平台，围绕
                    <span className="font-black text-slate-800">“创作采集、AI增强、视频生成、作品编辑、成果展示”</span>
                    打通完整闭环，让课堂作品真正沉淀为学校可展示、家长可分享、学生可留存的数字成果。
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                      <div className="text-[13px] font-black text-slate-800">对教师</div>
                      <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-500">显著降低数字成果制作门槛，快速形成高展示度课程交付成果。</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                      <div className="text-[13px] font-black text-slate-800">对学校</div>
                      <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-500">打造“科技 + 美育”特色课程与成果品牌，持续沉淀数字美育资源库。</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                      <div className="text-[13px] font-black text-slate-800">对学生</div>
                      <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-500">提升创作成就感、图像表达与故事表达能力，让原创作品拥有更完整的展示形态。</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                      <div className="text-[13px] font-black text-slate-800">对家长</div>
                      <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-500">更直观看见孩子的创作成果与成长过程，形成可分享、可留存、可回看的成长记录。</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-slate-400">
                    <MicVocal size={14} />
                    关键能力
                  </div>
                  <div className="mt-4 space-y-3">
                    {storyWorkshopCapabilities.map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-black text-blue-600">
                          {index + 1}
                        </div>
                        <p className="text-[14px] font-medium leading-6 text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-slate-400">
                    <GalleryVerticalEnd size={14} />
                    典型场景
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {storyWorkshopScenes.map((scene) => (
                      <span key={scene} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-600">
                        {scene}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <section className="mt-6 rounded-[2rem] border border-violet-200/70 bg-[linear-gradient(135deg,#f3f0ff_0%,#efe9ff_55%,#e8f2ff_100%)] p-6 shadow-[0_18px_40px_rgba(139,92,246,0.12)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3.5 py-1.5 text-[12px] font-black tracking-[0.14em] text-violet-600">
                    <Sparkles size={14} />
                    可交付成果
                  </div>
                  <div className="mt-4 text-[28px] font-black tracking-[-0.035em] text-slate-900">学校最终能留下什么</div>
                  <p className="mt-2 text-[14px] font-medium leading-7 text-slate-600">
                    不只是一节课的展示效果，而是可反复使用、可持续沉淀、可对外传播的数字内容资产。
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_12px_30px_rgba(139,92,246,0.10)]">
                  <div className="text-[11px] font-black tracking-[0.16em] text-violet-500">价值落点</div>
                  <p className="mt-2 text-[14px] font-bold leading-6 text-violet-700/90">
                    让课堂成果从一次性展示，升级为学校可持续运营的内容资产。
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {storyWorkshopDeliverables.map((item) => (
                  <article key={item.title} className="rounded-[1.5rem] border border-white/80 bg-white/82 px-5 py-5 shadow-[0_12px_28px_rgba(139,92,246,0.08)]">
                    <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black tracking-[0.12em] text-violet-600">
                      {item.tag}
                    </div>
                    <div className="mt-4 text-[16px] font-black text-slate-900">{item.title}</div>
                    <p className="mt-2 text-[13px] font-medium leading-6 text-slate-600">{item.desc}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaaSPortal;
