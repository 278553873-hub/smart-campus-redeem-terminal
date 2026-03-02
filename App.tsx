
import React, { useState } from 'react';
import { ViewState, Student, Product, BankAccount, Deposit } from './types';
import { EXCHANGE_RATE, BANK_CONFIG } from './constants';
import FaceScanner from './components/FaceScanner';
import Dashboard from './components/Dashboard';
import ExchangeView from './components/ExchangeView';
import ShopView from './components/ShopView';
import BankView from './components/BankView';
import GrowthView from './components/GrowthView';
import TeacherDashboard from './components/TeacherDashboard';
import AdminApp from './components/AdminApp';
import MobileApp from './mobile-app/App';
import './mobile-app/index.css';
import { ChevronLeft, Sparkles, ArrowRight, MonitorSmartphone, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { playSound } from './utils/sound';

const INITIAL_STUDENT: Student = {
  id: 'st_001',
  name: '郑小磊',
  avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400&h=400',
  points: 1250,
  campusCoins: 245,
  class: '四年级一班'
};

const INITIAL_BANK: BankAccount = {
  currentBalance: 0,
  deposits: [
    {
      id: 'dep_1',
      type: 'fixed',
      amount: 100,
      startDate: Date.now() - 86400000 * 5,
      termDays: 7,
      interestRate: 0.01,
      status: 'active',
      label: '1周定期'
    },
    {
      id: 'dep_2',
      type: 'current',
      amount: 50,
      startDate: Date.now() - 86400000 * 2,
      termDays: 0,
      interestRate: BANK_CONFIG.DAILY_RATE,
      status: 'active',
      label: '活期存单'
    }
  ]
};

const TerminalApp: React.FC = () => {
  const [view, setView] = useState<ViewState>('welcome');
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [bank, setBank] = useState<BankAccount>(INITIAL_BANK);
  const [isLoading, setIsLoading] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(5000);

  // 1. Idle Screensaver & Click Sound Feedback
  React.useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let intervalTimer: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
      setIdleSecondsLeft(5000);

      if (view !== 'welcome' && view !== 'scanning') {
        intervalTimer = setInterval(() => {
          setIdleSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        idleTimer = setTimeout(() => {
          setView('welcome');
          setStudent(INITIAL_STUDENT);
          setBank(INITIAL_BANK);
          setIsLoading(false);
        }, 5000000); // 5000s timeout
      }
    };

    const handleInteraction = () => {
      playSound('click');
      resetTimer();
    };

    document.addEventListener('click', handleInteraction, true);
    document.addEventListener('touchstart', handleInteraction, true);
    resetTimer();

    return () => {
      document.removeEventListener('click', handleInteraction, true);
      document.removeEventListener('touchstart', handleInteraction, true);
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
    };
  }, [view]);

  // Loading wrapper for actions
  const withLoading = (action: () => void, successSound: 'coin' | 'success' = 'success') => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      action();
      playSound(successSound);
      setIsLoading(false);
    }, 1200);
  };

  const bankBalance = bank.deposits.reduce((s, d) => s + d.amount, 0);

  const handleExchange = (pointsToRedeem: number) => {
    withLoading(() => {
      const coinsGained = Math.floor(pointsToRedeem / EXCHANGE_RATE);
      setStudent(prev => ({
        ...prev,
        points: prev.points - pointsToRedeem,
        campusCoins: prev.campusCoins + coinsGained
      }));
      setView('dashboard');
    }, 'coin');
  };

  const handlePurchase = (product: Product) => {
    withLoading(() => {
      if (student.campusCoins >= product.price) {
        setStudent(prev => ({
          ...prev,
          campusCoins: prev.campusCoins - product.price
        }));
      }
    }, 'success');
  };

  const handleCreateDeposit = (amount: number, days: number, rate: number, label: string, type: 'fixed' | 'current') => {
    withLoading(() => {
      if (student.campusCoins >= amount) {
        const newDeposit: Deposit = {
          id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type,
          amount,
          startDate: Date.now(),
          termDays: days,
          interestRate: rate,
          status: 'active',
          label
        };
        setStudent(prev => ({ ...prev, campusCoins: prev.campusCoins - amount }));
        setBank(prev => ({
          ...prev,
          deposits: [...prev.deposits, newDeposit]
        }));
      }
    }, 'success');
  };

  const handleWithdrawDeposit = (deposit: Deposit) => {
    withLoading(() => {
      const elapsedDays = (Date.now() - deposit.startDate) / 86400000;
      let interestGained = 0;

      if (deposit.type === 'current') {
        interestGained = deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
      } else {
        const isMatured = elapsedDays >= deposit.termDays;
        if (isMatured) {
          interestGained = deposit.amount * deposit.interestRate;
        } else {
          interestGained = deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
        }
      }

      const finalAmount = Math.round(deposit.amount + interestGained);

      setBank(prev => ({
        ...prev,
        deposits: prev.deposits.filter(d => d.id !== deposit.id)
      }));
      setStudent(prev => ({
        ...prev,
        campusCoins: prev.campusCoins + finalAmount
      }));
    }, 'coin');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-10 pt-16 pb-12 animate-in fade-in duration-1000">
            <div className="relative group mt-6">
              <div className="absolute -inset-8 bg-blue-400 rounded-full blur-[80px] opacity-20 animate-pulse transition-all"></div>
              <img
                src="/assets/school_cover.png"
                alt="School Feature"
                className="relative w-56 h-56 rounded-[3rem] shadow-2xl mb-8 mx-auto border-8 border-white transition-transform duration-500 object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black text-blue-900 tracking-tighter leading-none">
                校园星光<br />
                <span className="text-blue-600 mt-2 block">货柜机</span>
              </h1>
              <div className="text-xl text-slate-400 mt-5 font-bold flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-slate-200"></div>
                点滴进步，成就未来
                <div className="h-px w-6 bg-slate-200"></div>
              </div>
            </div>

            <div className="pt-8 w-full max-w-sm mt-auto">
              <button
                onClick={() => setView('scanning')}
                className="w-full px-10 py-6 bg-blue-600 text-white text-3xl font-black rounded-[2.5rem] flex flex-col items-center justify-center gap-1"
                style={{
                  boxShadow: '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                  transition: 'all 0.1s'
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(8px)'; e.currentTarget.style.boxShadow = '0 0px 0 #1e40af, 0 5px 10px rgba(0,0,0,0.1)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)'; }}
              >
                <div className="flex items-center gap-3">开始刷脸 <ArrowRight size={28} /></div>
              </button>
              <p className="text-slate-300 font-bold mt-8 text-sm uppercase tracking-widest">请靠近终端屏幕</p>
            </div>
          </div>
        );
      case 'scanning':
        return <FaceScanner onSuccess={() => { playSound('success'); setView('dashboard'); }} />;
      case 'dashboard':
        return <Dashboard student={student} onNavigate={setView} bankBalance={bankBalance} />;
      case 'exchange':
        return <ExchangeView student={student} onExchange={handleExchange} onBack={() => setView('dashboard')} />;
      case 'shop':
        return <ShopView student={student} onPurchase={handlePurchase} onBack={() => setView('dashboard')} />;
      case 'bank':
        return <BankView
          student={student}
          bank={bank}
          onDeposit={(amt, days, rate, label, type) => handleCreateDeposit(amt, days, rate, label, type as any)}
          onWithdrawDeposit={handleWithdrawDeposit}
          onBack={() => setView('dashboard')}
        />;
      case 'growth':
        return <GrowthView student={student} onBack={() => setView('dashboard')} />;
      default:
        return <div>错误状态</div>;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#f0f9ff] flex items-center justify-center overflow-hidden py-4">
      {/* 21.5寸竖屏货柜机比例 (约 9:16) */}
      <div
        className="glass-panel overflow-hidden flex flex-col relative pt-8"
        style={{ width: '100%', height: '100%', maxWidth: '540px', maxHeight: '960px', borderRadius: '3rem', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.15)' }}
      >
        {/* 顶部硬件模拟 (摄像头区域) */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black/5 z-[100] flex justify-center items-center pointer-events-none">
          <div className="w-24 h-4 bg-black/80 rounded-b-xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-900/50"></div>
            <div className="w-1 h-1 rounded-full bg-green-400"></div>
          </div>
        </div>

        {view !== 'welcome' && view !== 'scanning' && (
          <div className="absolute top-10 right-6 z-[90] bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 transform translate-y-2 pointer-events-none">
            <div className={`w-2 h-2 rounded-full ${idleSecondsLeft <= 10 ? 'bg-red-500 animate-ping' : 'bg-green-400 animate-pulse'}`}></div>
            <span className="text-white text-xs font-bold tracking-widest drop-shadow-sm">{idleSecondsLeft}s 后自动退出</span>
          </div>
        )}

        {view !== 'welcome' && view !== 'scanning' && view !== 'dashboard' && (
          <div className="h-16 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center space-x-1 text-blue-600 font-bold text-lg active:bg-blue-50 px-3 py-1.5 rounded-xl"
            >
              <ChevronLeft size={24} />
              <span>返回首页</span>
            </button>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative">
          {renderView()}
        </main>
        {/* 全局 Loading 拦截层 */}
        {isLoading && (
          <div className="absolute inset-0 z-[100] bg-white/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center">
              <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
              <div className="text-lg font-black text-blue-900">处理中...</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const AppSwitcher: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<'terminal' | 'teacher' | 'admin'>('terminal');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      {currentApp === 'terminal' && <TerminalApp />}
      {currentApp === 'teacher' && <TeacherDashboard />}
      {currentApp === 'admin' && <MobileApp />}

      {/* 侧边悬浮控制台 (抽屉效果，避免遮挡导航) */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9999] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDemoOpen ? 'translate-x-0' : 'translate-x-[calc(100%-32px)]'}`}
        onMouseEnter={() => setIsDemoOpen(true)}
        onMouseLeave={() => setIsDemoOpen(false)}
      >
        <div className="flex bg-white/95 backdrop-blur-md rounded-l-2xl border border-r-0 border-slate-200 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden items-center group cursor-pointer">

          {/* 触发把手 (固定 32px 宽) */}
          <div className="w-8 shrink-0 flex flex-col gap-1 items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors py-6 border-r border-slate-100 bg-slate-50/50 self-stretch">
            <span className="text-[10px] font-black">D</span>
            <span className="text-[10px] font-black">E</span>
            <span className="text-[10px] font-black">M</span>
            <span className="text-[10px] font-black">O</span>
          </div>

          {/* 控制面板 */}
          <div className="flex flex-col gap-2 p-3 bg-white">
            <div className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest mb-1">
              环境切换
            </div>
            <button
              onClick={() => setCurrentApp('terminal')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'terminal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="货柜机 - 学生端"
            >
              <MonitorSmartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold">货柜机</span>
            </button>
            <button
              onClick={() => setCurrentApp('teacher')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'teacher' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="教师端 - 办公室大屏"
            >
              <Monitor size={22} className="mb-1" />
              <span className="text-[9px] font-bold">PC端</span>
            </button>
            <button
              onClick={() => setCurrentApp('admin')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'admin' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="管理端 - 手机控制"
            >
              <Smartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold">App</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSwitcher;
