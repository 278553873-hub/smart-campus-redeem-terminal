import React, { useMemo, useState } from 'react';
import { ArrowLeft, Camera, ChevronRight, Mic, Type, Sparkles } from 'lucide-react';
import PhoneMockup from './PhoneMockup';

type PageKey =
  | 'login'
  | 'phone'
  | 'profile'
  | 'home'
  | 'classCreate'
  | 'studentAdd'
  | 'record'
  | 'textInput'
  | 'photoAward'
  | 'aiResult'
  | 'editResult'
  | 'classList'
  | 'classDetail'
  | 'studentDetail'
  | 'classReport'
  | 'termReport'
  | 'mine'
  | 'advisor';

type ViewState = 'normal' | 'loading' | 'empty' | 'network' | 'denied';
type RecordStage = 'idle' | 'recording' | 'transcribing' | 'identifying' | 'saved';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

interface PageMeta {
  title: string;
  subtitle: string;
  modules: string[];
  ctas: Array<{ label: string; priority: Priority; position: string }>;
  states: Record<ViewState, string>;
}

const pageOrder: PageKey[] = [
  'login',
  'phone',
  'profile',
  'home',
  'classCreate',
  'studentAdd',
  'record',
  'aiResult',
  'classReport',
  'termReport',
  'mine',
];

const pageMeta: Record<PageKey, PageMeta> = {
  login: {
    title: '注册登录',
    subtitle: '从教师微信小程序进入，完成微信授权。',
    modules: ['顶部返回/标题', '小程序身份说明', '微信授权登录', '协议入口'],
    ctas: [
      { label: '微信授权登录', priority: 'P0', position: '页面底部主按钮' },
      { label: '查看协议', priority: 'P2', position: '按钮下方文字链' },
    ],
    states: {
      normal: '展示微信授权登录入口。',
      loading: '正在进入，主按钮禁用。',
      empty: '不适用。',
      network: '网络不可用，展示重试。',
      denied: '微信授权被拒绝，展示重新授权。',
    },
  },
  phone: {
    title: '手机号绑定',
    subtitle: '绑定手机号用于账号安全和后续联系。',
    modules: ['手机号授权说明', '微信手机号授权', '手动手机号输入', '验证码输入'],
    ctas: [
      { label: '一键绑定手机号', priority: 'P0', position: '页面底部主按钮' },
      { label: '手动输入', priority: 'P1', position: '手机号授权下方' },
    ],
    states: {
      normal: '展示手机号绑定入口。',
      loading: '绑定中，按钮禁用。',
      empty: '手机号为空时提示。',
      network: '绑定失败，展示重试。',
      denied: '手机号授权拒绝时允许手动输入。',
    },
  },
  profile: {
    title: '老师最少信息',
    subtitle: '只保留进入系统必要信息。',
    modules: ['姓名（必填）', '任教学科（必填）', '身份类型（必填）', '学校名称（非必填）'],
    ctas: [
      { label: '进入体验', priority: 'P0', position: '页面底部主按钮' },
      { label: '跳过学校名称', priority: 'P1', position: '学校名称字段下方' },
    ],
    states: {
      normal: '三个必填字段 + 学校名称非必填。',
      loading: '保存中。',
      empty: '必填字段为空时提示。',
      network: '保存失败，保留表单。',
      denied: '手机号未绑定时返回绑定页。',
    },
  },
  home: {
    title: '新手首页',
    subtitle: '四步引导新老师快速完成首次体验。',
    modules: ['老师称呼', '体验进度', '创建班级', '添加学生', 'AI记录', '查看报告', '底部导航'],
    ctas: [
      { label: '继续当前步骤', priority: 'P0', position: '任务卡右侧/底部' },
      { label: '直接记录', priority: 'P1', position: '任务卡下方' },
      { label: '帮助', priority: 'P2', position: '我的页' },
    ],
    states: {
      normal: '展示新手任务和已完成状态。',
      loading: '加载空间、班级、学生和记录状态。',
      empty: '按缺失项引导下一步。',
      network: '首页加载失败，展示重新加载。',
      denied: '登录失效，展示重新登录。',
    },
  },
  classCreate: {
    title: '创建班级',
    subtitle: '只填写班级名称和年级。',
    modules: ['班级名称', '年级', '学号规则提示'],
    ctas: [
      { label: '保存并添加学生', priority: 'P0', position: '页面底部主按钮' },
      { label: '先保存', priority: 'P1', position: '底部次按钮' },
    ],
    states: {
      normal: '输入班级名称和年级。',
      loading: '保存中。',
      empty: '班级名称或年级为空时提示。',
      network: '保存失败，保留表单。',
      denied: '登录失效，提示重新登录。',
    },
  },
  studentAdd: {
    title: '添加学生',
    subtitle: '手机端录入姓名、学号、性别。',
    modules: ['班级信息', '姓名', '学号', '性别', '学号自动建议', '学生列表', '批量粘贴'],
    ctas: [
      { label: '完成，去记录', priority: 'P0', position: '页面底部主按钮' },
      { label: '添加一名', priority: 'P1', position: '录入表单下方' },
      { label: '批量粘贴', priority: 'P1', position: '列表上方' },
    ],
    states: {
      normal: '录入区 + 已添加学生列表。',
      loading: '保存或导入中。',
      empty: '无学生时引导添加第一名。',
      network: '保存失败，保留已输入内容。',
      denied: '无班级权限时返回首页。',
    },
  },
  record: {
    title: 'AI记录',
    subtitle: '语音/文字记录，拍照识别奖状。',
    modules: ['当前班级', '记录流', '原始输入', 'AI解读摘要', '悬浮录入条：拍照/按住说话/文字'],
    ctas: [
      { label: '按住说话', priority: 'P0', position: '底部悬浮录入条中间' },
      { label: '拍照', priority: 'P1', position: '悬浮录入条左侧' },
      { label: '文字', priority: 'P1', position: '悬浮录入条右侧' },
    ],
    states: {
      normal: '展示记录流和悬浮录入条。',
      loading: '记录流加载中。',
      empty: '提示试着说一句或输入一句。',
      network: '记录流加载失败，可重试。',
      denied: '麦克风/相机拒绝时提供文字替代。',
    },
  },
  textInput: {
    title: '文字记录',
    subtitle: '输入自然语言，一句话可提到多个学生。',
    modules: ['当前班级', '文本输入框', '示例短句', '提交识别'],
    ctas: [
      { label: '提交识别', priority: 'P0', position: '底部主按钮' },
      { label: '清空', priority: 'P1', position: '输入框下方' },
    ],
    states: {
      normal: '展示输入框。',
      loading: '提交识别中。',
      empty: '文本为空时提示。',
      network: '识别失败，保留输入。',
      denied: '不适用。',
    },
  },
  photoAward: {
    title: '拍照识别奖状',
    subtitle: '只聚焦奖状识别。',
    modules: ['相机入口', '相册选择', '奖状预览', '提交识别'],
    ctas: [
      { label: '拍照识别', priority: 'P0', position: '底部主按钮' },
      { label: '从相册选择', priority: 'P1', position: '底部次按钮' },
    ],
    states: {
      normal: '拍摄或选择奖状。',
      loading: '奖状识别中。',
      empty: '未选择图片时不可提交。',
      network: '识别失败，可重试。',
      denied: '相机/相册拒绝时改用文字。',
    },
  },
  aiResult: {
    title: 'AI识别结果',
    subtitle: '识别完成即入库，编辑立即生效。',
    modules: ['原始语音/文字/图片', '语音转文字', '事件时间', '识别对象', '五育指标', '加分/减分', 'AI评语', '入库状态'],
    ctas: [
      { label: '继续记录', priority: 'P0', position: '底部主按钮' },
      { label: '编辑该条', priority: 'P1', position: '结果卡整体点击' },
      { label: '删除该条', priority: 'P3', position: '更多操作内' },
    ],
    states: {
      normal: '展示已入库结果，可编辑。',
      loading: '转文字中/AI识别中/入库中。',
      empty: '未识别有效事件，允许手动补全。',
      network: '识别或入库失败，可重试。',
      denied: '语音/图片读取失败时返回输入方式。',
    },
  },
  editResult: {
    title: '编辑识别结果',
    subtitle: '字段修改后立即生效。',
    modules: ['事件时间', '识别对象', '五育指标', '加分/减分', 'AI评语', '同步状态'],
    ctas: [
      { label: '保存修改', priority: 'P0', position: '底部主按钮' },
      { label: '添加指标', priority: 'P1', position: '指标区下方' },
      { label: '删除记录', priority: 'P3', position: '底部更多' },
    ],
    states: {
      normal: '展示可编辑字段。',
      loading: '保存中。',
      empty: '对象缺失时提示选择学生。',
      network: '保存失败，可重试；离线为待同步。',
      denied: '无权限编辑时只读展示。',
    },
  },
  classList: {
    title: '班级列表',
    subtitle: '查看个人体验空间内的班级。',
    modules: ['班级卡片', '班级名称', '年级', '学生数', '今日记录数', '新建班级'],
    ctas: [
      { label: '新建班级', priority: 'P0', position: '页面右下/列表底部' },
      { label: '进入班级', priority: 'P1', position: '班级卡片点击' },
    ],
    states: {
      normal: '展示班级列表。',
      loading: '班级加载中。',
      empty: '无班级时引导新建。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  classDetail: {
    title: '班级详情',
    subtitle: '从班级维度查看学生、记录和报告。',
    modules: ['班级摘要', '学生/记录/报告切换', '学生列表', '悬浮录入条'],
    ctas: [
      { label: '按住说话', priority: 'P0', position: '底部悬浮录入条' },
      { label: '添加学生', priority: 'P1', position: '学生列表上方' },
      { label: '查看报告', priority: 'P1', position: '页内切换' },
    ],
    states: {
      normal: '展示班级摘要和学生列表。',
      loading: '班级数据加载中。',
      empty: '无学生时引导添加学生。',
      network: '加载失败，提供重试。',
      denied: '无班级权限时返回班级列表。',
    },
  },
  studentDetail: {
    title: '学生详情',
    subtitle: '查看学生基础信息、记录统计和日常行为。',
    modules: ['姓名', '学号', '性别', '所属班级', '记录统计', '日常行为记录流', '月度/期末报告入口'],
    ctas: [
      { label: '为该学生记录', priority: 'P0', position: '页面底部/顶部' },
      { label: '生成月度报告', priority: 'P1', position: '报告区' },
      { label: '编辑学生', priority: 'P2', position: '基础信息区' },
    ],
    states: {
      normal: '展示学生详情。',
      loading: '学生数据加载中。',
      empty: '无记录时引导为该学生记录。',
      network: '加载失败，提供重试。',
      denied: '无权限时返回学生列表。',
    },
  },
  classReport: {
    title: '班级统计报告',
    subtitle: '有任何记录即可展示统计，不需要 AI 分析。',
    modules: ['时间范围', '记录总数', '覆盖学生数', '加分/减分记录数', '五育指标分布', '学生统计', '最近记录'],
    ctas: [
      { label: '去记录', priority: 'P0', position: '空数据中部' },
      { label: '切换时间范围', priority: 'P1', position: '顶部筛选' },
      { label: '查看学生', priority: 'P1', position: '学生行点击' },
    ],
    states: {
      normal: '展示统计信息。',
      loading: '统计计算中。',
      empty: '无记录时引导去记录。',
      network: '统计加载失败，提供重试。',
      denied: '无权限时返回班级列表。',
    },
  },
  termReport: {
    title: '月度/期末AI报告',
    subtitle: 'AI 基于学生全部日常行为记录生成成长报告。',
    modules: ['报告对象', '时间范围', '当前记录数', '生成条件', 'AI总结', '五育表现', '亮点', '待提升方向', '建议'],
    ctas: [
      { label: '生成报告', priority: 'P0', position: '满足条件时底部固定' },
      { label: '重新生成', priority: 'P1', position: '已生成报告底部' },
      { label: '复制报告', priority: 'P1', position: '已生成报告底部' },
    ],
    states: {
      normal: '展示生成入口或已生成报告。',
      loading: 'AI 报告生成中。',
      empty: '记录不足时引导补充记录。',
      network: '生成失败，提供重新生成。',
      denied: '学生不存在或无权限时返回学生列表。',
    },
  },
  mine: {
    title: '我的',
    subtitle: '补充学校名称，查看顾问联系方式。',
    modules: ['老师信息', '学校名称（可补充）', '使用数据', '编辑个人信息', '顾问联系方式', '协议', '退出登录'],
    ctas: [
      { label: '补充学校名称', priority: 'P0', position: '学校名称缺失时信息区' },
      { label: '联系顾问', priority: 'P1', position: '帮助区' },
      { label: '退出登录', priority: 'P3', position: '页面底部' },
    ],
    states: {
      normal: '展示个人信息和帮助入口。',
      loading: '个人信息加载中。',
      empty: '学校名称未填时展示补充入口。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  advisor: {
    title: '顾问联系方式',
    subtitle: '自然展示顾问联系方式，不强销售。',
    modules: ['顾问微信', '联系电话', '复制微信', '拨打电话'],
    ctas: [
      { label: '复制微信', priority: 'P1', position: '联系方式卡片内' },
      { label: '拨打电话', priority: 'P1', position: '联系方式卡片内' },
      { label: '返回', priority: 'P2', position: '顶部左侧' },
    ],
    states: {
      normal: '展示顾问联系方式。',
      loading: '联系方式加载中。',
      empty: '暂未配置顾问时展示客服电话。',
      network: '加载失败，提供重试。',
      denied: '不适用。',
    },
  },
};

const stateLabels: Record<ViewState, string> = {
  normal: '正常',
  loading: '加载',
  empty: '空数据',
  network: '网络错误',
  denied: '权限拒绝',
};

const stateCycle: ViewState[] = ['normal', 'loading', 'empty', 'network', 'denied'];

const priorityClass: Record<Priority, string> = {
  P0: 'bg-gray-950 text-white border-gray-300',
  P1: 'bg-white text-gray-950 border-gray-300',
  P2: 'bg-white text-gray-950 border-dashed border-gray-300',
  P3: 'bg-white text-gray-950 border-gray-300 line-through',
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const TeacherCMobileLowFi: React.FC = () => {
  const [page, setPage] = useState<PageKey>('login');
  const [viewState, setViewState] = useState<ViewState>('normal');
  const [history, setHistory] = useState<PageKey[]>([]);
  const [recordStage, setRecordStage] = useState<RecordStage>('idle');
  const [classCreated, setClassCreated] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [showMultiResult, setShowMultiResult] = useState(false);
  const [showWechatPhoneSheet, setShowWechatPhoneSheet] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [schoolStage, setSchoolStage] = useState('');
  const [entryYear, setEntryYear] = useState('');
  const [classNumber, setClassNumber] = useState('1');

  const meta = pageMeta[page];
  const demoAcademicStartYear = 2025;
  const gradeNumber = entryYear ? Math.max(1, demoAcademicStartYear - Number(entryYear) + 1) : 1;
  const classDisplayName = entryYear ? `${entryYear}级${classNumber || '1'}班` : '';
  const gradeDisplayName = schoolStage && entryYear ? `${gradeNumber}年级${classNumber || '1'}班` : '';
  const canSaveClass = Boolean(schoolStage && entryYear && classNumber.trim());


  const navigate = (next: PageKey) => {
    setShowWechatPhoneSheet(false);
    setHistory((prev) => [...prev, page]);
    setPage(next);
    setViewState('normal');
    if (next !== 'record') setRecordStage('idle');
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((items) => items.slice(0, -1));
    setPage(prev);
    setViewState('normal');
  };

  const startVoice = () => {
    setViewState('loading');
    setRecordStage('recording');
  };

  const finishVoice = () => {
    setRecordStage('transcribing');
    window.setTimeout(() => setRecordStage('identifying'), 450);
    window.setTimeout(() => {
      setRecordStage('saved');
      setRecordCount((count) => Math.max(count + 2, 3));
      setShowMultiResult(true);
      navigate('aiResult');
    }, 950);
  };

  const cancelVoice = () => {
    setRecordStage('idle');
    setViewState('normal');
  };

  const statusText = useMemo(() => meta.states[viewState], [meta, viewState]);

  const renderStateContent = () => {
    if (viewState === 'normal') return null;
    return (
      <div className="absolute inset-x-4 top-24 z-20 rounded-2xl bg-white p-4 text-center shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
        <div className="text-sm font-black">{stateLabels[viewState]}</div>
        <p className="mt-2 text-xs leading-5">{statusText}</p>
        <button type="button" onClick={() => setViewState('normal')} className="mt-3 h-11 rounded-xl bg-gray-50 px-5 text-sm font-black">
          回到正常态
        </button>
      </div>
    );
  };

  const ScreenHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <header className="flex h-16 items-center gap-3 border-b border-gray-100 bg-white px-4">
      <button type="button" onClick={history.length ? back : undefined} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100 disabled:opacity-30" disabled={!history.length} aria-label="返回">
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <h2 className="truncate text-base font-black">{title}</h2>
      </div>
      <div className="h-11 w-11" aria-hidden="true" />
    </header>
  );

  const BottomNav = () => (
    <nav className="absolute inset-x-4 bottom-4 grid h-14 grid-cols-3 rounded-2xl border border-gray-100 bg-white shadow-[0_-8px_28px_rgba(15,23,42,0.06)] text-center text-[11px] font-black">
      <button type="button" onClick={() => navigate('home')} className={cx('rounded-l-[14px]', (page === 'home' || page === 'record') && 'bg-gray-950 text-white')}>记录</button>
      <button type="button" onClick={() => navigate('classList')} className={cx(page === 'classList' && 'bg-gray-950 text-white')}>班级</button>
      <button type="button" onClick={() => navigate('mine')} className={cx('rounded-r-[14px]', page === 'mine' && 'bg-gray-950 text-white')}>我的</button>
    </nav>
  );

  const TaskRow = ({ done, active, label, action, onClick }: { done?: boolean; active?: boolean; label: string; action: string; onClick: () => void }) => (
    <div className={cx('flex items-center gap-3 rounded-2xl p-3', done ? 'bg-gray-100 text-gray-400' : active ? 'bg-gray-50' : 'bg-white')}>
      <div className={cx('flex h-8 w-8 items-center justify-center rounded-full text-xs font-black', done ? 'bg-gray-200 text-gray-500' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}>{done ? '✓' : active ? '!' : '□'}</div>
      <div className="min-w-0 flex-1 text-sm font-black">{label}</div>
      {done ? (
        <span className="text-xs font-medium">已完成</span>
      ) : active ? (
        <button type="button" onClick={onClick} className="h-11 rounded-xl bg-gray-900 px-3 text-xs font-black text-white">{action}</button>
      ) : (
        <span className="text-xs font-medium text-gray-400">待完成</span>
      )}
    </div>
  );

  const AiResultCard = ({ second = false }: { second?: boolean }) => (
    <button type="button" onClick={() => navigate('editResult')} className="w-full rounded-2xl bg-gray-50 p-3 text-left">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-black">AI 识别结果 {second ? '2' : '1'}</span>
        <span className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-black">{second ? '+1' : '+2'}</span>
      </div>
      <div className="grid gap-1 text-xs leading-5">
        <div><b>时间</b>：今天 10:20</div>
        <div><b>对象</b>：{second ? '李小红｜20250102' : '王小明｜20250101'}</div>
        <div><b>指标</b>：劳育-劳动习惯-主动劳动</div>
        <div><b>加减分</b>：加分 {second ? '+1' : '+2'}</div>
        <div><b>评语</b>：主动参与班级劳动，表现积极。</div>
      </div>
    </button>
  );


  const renderWechatPhoneSheet = () => {
    if (!showWechatPhoneSheet) return null;

    const allowPhone = () => {
      setShowWechatPhoneSheet(false);
      navigate('profile');
    };

    return (
      <div className="absolute inset-0 z-[120] flex items-end bg-gray-900/45" role="dialog" aria-modal="true" aria-label="微信手机号授权">
        <button type="button" aria-label="关闭授权弹窗" className="absolute inset-0 cursor-default" onClick={() => setShowWechatPhoneSheet(false)} />
        <section className="relative w-full rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
                <Sparkles size={20} />
              </div>
              <div className="text-base font-black">AI素养评价</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm font-black">i</div>
          </div>

          <div className="mt-5">
            <h3 className="text-xl font-black leading-tight">申请获取并验证你的手机号</h3>
            <p className="mt-2 text-sm leading-5 text-slate-600">用户正常进行授权登录</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-gray-50">
            <button type="button" onClick={allowPhone} className="block min-h-16 w-full border-b border-gray-100 px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">152****1332</div>
              <div className="mt-1 text-xs font-black text-slate-600">上次提供</div>
            </button>
            <button type="button" onClick={allowPhone} className="block min-h-16 w-full px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">199****8610</div>
            </button>
          </div>

          <button type="button" onClick={() => setShowWechatPhoneSheet(false)} className="mt-4 min-h-12 w-full rounded-2xl border border-gray-200 bg-white text-base font-black active:bg-slate-100">
            不允许
          </button>
          <button type="button" className="mt-7 min-h-11 w-full text-sm font-black underline underline-offset-4">
            管理号码
          </button>
        </section>
      </div>
    );
  };

  const renderPhonePage = () => {
    if (page === 'login') {
      return (
        <>
          <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
            <h2 className="text-base font-black">AI素养评价</h2>
          </header>
          <div className="flex min-h-[calc(100%-64px)] flex-col p-5">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
                <Sparkles size={34} />
              </div>
              <h3 className="mt-6 text-2xl font-black">欢迎使用 AI素养评价</h3>
            </div>
            <div className="space-y-3 pb-3">
              <button type="button" onClick={() => setShowWechatPhoneSheet(true)} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">微信授权登录</button>
              <button type="button" onClick={() => navigate('phone')} className="h-12 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">手机号登录/注册</button>
              <label className="flex items-center justify-center gap-2 text-[11px] leading-5">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" />
                <span>我已阅读并同意《隐私保护指引》</span>
              </label>
            </div>
          </div>
        </>
      );
    }

    if (page === 'phone') {
      return (
        <>
          <ScreenHeader title="绑定手机号" sub="用于账号安全和后续联系" />
          <div className="space-y-4 p-5">
            <div className="rounded-3xl bg-gray-50 p-5">
              <div className="text-sm font-black">手机号授权</div>
              <div className="mt-3 rounded-2xl border border-dashed border-gray-200 p-4 text-xs">微信手机号授权区域</div>
            </div>
            <button type="button" onClick={() => navigate('profile')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">一键绑定手机号</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">手动输入</button>
          </div>
        </>
      );
    }

    if (page === 'profile') {
      return (
        <>
          <ScreenHeader title="完善信息" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                姓名
                <input
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 px-2 text-sm font-normal"
                  placeholder="请输入姓名"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!teacherName.trim()}
              onClick={() => navigate('home')}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                teacherName.trim() ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              进入体验
            </button>
          </div>
        </>
      );
    }

    if (page === 'home') {
      const stepsDone = classCreated && studentCount > 0 && recordCount > 0;
      const currentStep = !classCreated ? 'class' : studentCount === 0 ? 'student' : recordCount === 0 ? 'record' : 'done';
      const displayName = teacherName.trim() || '老师';

      return (
        <>
          <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
            <h2 className="text-base font-black">记录</h2>
          </header>
          <div className="space-y-3 p-5 pb-28">
            {!stepsDone ? (
              <>
                <div className="rounded-3xl bg-gray-50 p-4">
                  <div className="text-sm font-black">{displayName}老师，完成基本信息补充，即可体验完整功能。</div>
                </div>
                <div className="space-y-2">
                  <TaskRow done={classCreated} active={currentStep === 'class'} label="1. 创建班级" action="去创建" onClick={() => navigate('classCreate')} />
                  <TaskRow done={studentCount > 0} active={currentStep === 'student'} label="2. 添加学生" action="去添加" onClick={() => navigate('studentAdd')} />
                  <TaskRow done={recordCount > 0} active={currentStep === 'record'} label="3. 日常行为记录" action="去记录" onClick={() => navigate('record')} />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <button className="rounded-xl bg-gray-50 px-3 py-2">查看默认指标</button>
                  <button className="rounded-xl bg-gray-50 px-3 py-2">本周</button>
                </div>
                <button type="button" onClick={() => navigate('aiResult')} className="w-full rounded-3xl bg-gray-50 p-4 text-left text-xs">
                  <div className="font-black">今天 10:20</div>
                  <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-2">原始语音 + 转文字：1班1号和2号主动打扫卫生。</div>
                  <div className="mt-2 rounded-xl bg-white p-2">AI解读：2名学生｜劳育｜+3</div>
                </button>
              </>
            )}
          </div>
          {stepsDone && (
            <div className="absolute inset-x-5 bottom-20 grid h-14 grid-cols-[1fr_2fr_1fr] gap-2 rounded-2xl bg-white p-2 text-xs font-black shadow-[0_-8px_28px_rgba(15,23,42,0.06)]">
              <button type="button" onClick={() => navigate('photoAward')} className="rounded-xl bg-gray-50"><Camera size={16} className="mx-auto" />拍照</button>
              <button type="button" onMouseDown={startVoice} onMouseUp={finishVoice} onTouchStart={startVoice} onTouchEnd={finishVoice} className="rounded-xl bg-gray-950 text-white"><Mic size={16} className="mx-auto" />按住说话</button>
              <button type="button" onClick={() => navigate('textInput')} className="rounded-xl bg-gray-50"><Type size={16} className="mx-auto" />文字</button>
            </div>
          )}
          <BottomNav />
        </>
      );
    }

    if (page === 'classCreate') {
      const saveClassAndGo = (next: PageKey) => {
        if (!canSaveClass) return;
        setClassCreated(true);
        navigate(next);
      };

      return (
        <>
          <ScreenHeader title="创建班级" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                学段
                <select
                  value={schoolStage}
                  onChange={(event) => setSchoolStage(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 bg-white px-2 text-sm font-normal"
                >
                  <option value="">请选择学段</option>
                  <option value="小学">小学</option>
                  <option value="初中">初中</option>
                  <option value="高中">高中</option>
                </select>
              </label>

              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                入学年份
                <select
                  value={entryYear}
                  onChange={(event) => setEntryYear(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 bg-white px-2 text-sm font-normal"
                >
                  <option value="">请选择入学年份</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </label>

              {schoolStage && entryYear && (
                <div className="rounded-2xl bg-gray-50 p-3 text-xs font-black">
                  班级名称
                  <div className="mt-2 flex h-11 items-center gap-2 bg-white px-3 text-sm font-normal">
                    <span>{entryYear}级</span>
                    <input
                      value={classNumber}
                      onChange={(event) => setClassNumber(event.target.value.replace(/[^0-9]/g, ''))}
                      className="h-8 w-14 border border-gray-200 text-center"
                      inputMode="numeric"
                      aria-label="班级数字"
                    />
                    <span>班</span>
                  </div>
                </div>
              )}

              {gradeDisplayName && (
                <div className="rounded-2xl bg-gray-50 p-3 text-sm font-black">
                  {gradeDisplayName}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canSaveClass}
              onClick={() => saveClassAndGo('studentAdd')}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                canSaveClass ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              保存并添加学生
            </button>
          </div>
        </>
      );
    }

    if (page === 'studentAdd') {
      return (
        <>
          <ScreenHeader title="添加学生" sub={`${classDisplayName || '2025级1班'}｜已添加 ${studentCount} 人`} />
          <div className="space-y-3 p-5 pb-20">
            <div className="rounded-2xl bg-gray-50 p-3 text-xs">
              <div className="font-black">快捷录入</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <input className="h-11 border border-gray-200 px-2" placeholder="姓名" />
                <input className="h-11 border border-gray-200 px-2" placeholder="学号" />
                <input className="h-11 border border-gray-200 px-2" placeholder="性别" />
              </div>
              <button type="button" onClick={() => { setClassCreated(true); setStudentCount((count) => count + 1); }} className="mt-3 h-11 w-full rounded-xl bg-gray-50 text-xs font-black">添加一名</button>
            </div>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">批量粘贴</button>
            {studentCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">暂无学生，先添加一名学生</div>
            ) : (
              Array.from({ length: studentCount }).map((_, index) => {
                const student = index === 0 ? ['王小明', '20250101', '男'] : ['李小红', '20250102', '女'];
                return (
                  <div key={student[1]} className="flex items-center justify-between rounded-2xl bg-gray-50 p-3 text-xs">
                    <span className="font-black">{student[0]}</span><span>{student[1]}</span><span>{student[2]}</span><span>编辑</span>
                  </div>
                );
              })
            )}
            <button type="button" onClick={() => navigate('record')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">完成，去记录</button>
          </div>
        </>
      );
    }

    if (page === 'record') {
      return (
        <>
          <ScreenHeader title="记录" />
          <div className="space-y-3 p-5 pb-28">
            <div className="flex gap-2 text-xs"><button className="rounded-xl bg-gray-50 px-3 py-2">查看默认指标</button><button className="rounded-xl bg-gray-50 px-3 py-2">AI说明</button></div>
            {recordCount === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm font-black">试着说一句或输入一句</div>
            ) : (
              <button type="button" onClick={() => navigate('aiResult')} className="w-full rounded-3xl bg-gray-50 p-4 text-left text-xs">
                <div className="font-black">今天 10:20</div>
                <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-2">原始语音 + 转文字：1班1号和2号主动打扫卫生。</div>
                <div className="mt-2 rounded-xl bg-gray-50 p-2">AI解读：2名学生｜劳育｜+3</div>
              </button>
            )}
          </div>
          <div className="absolute inset-x-5 bottom-20 grid h-14 grid-cols-[1fr_2fr_1fr] gap-2 rounded-2xl bg-white p-2 text-xs font-black">
            <button type="button" onClick={() => navigate('photoAward')} className="rounded-xl bg-gray-50"><Camera size={16} className="mx-auto" />拍照</button>
            <button type="button" onMouseDown={startVoice} onMouseUp={finishVoice} onTouchStart={startVoice} onTouchEnd={finishVoice} className="rounded-xl bg-gray-950 text-white"><Mic size={16} className="mx-auto" />按住说话</button>
            <button type="button" onClick={() => navigate('textInput')} className="rounded-xl bg-gray-50"><Type size={16} className="mx-auto" />文字</button>
          </div>
          {recordStage !== 'idle' && (
            <div className="absolute inset-x-8 bottom-40 rounded-2xl bg-white p-3 text-center text-xs font-black shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
              {recordStage === 'recording' && '录音中：松手提交，上滑取消'}
              {recordStage === 'transcribing' && '语音转文字中...'}
              {recordStage === 'identifying' && 'AI识别时间、对象、指标、加减分...'}
              {recordStage === 'saved' && '已入库'}
              {recordStage === 'recording' && <button onClick={cancelVoice} className="ml-2 underline">取消</button>}
            </div>
          )}
          <BottomNav />
        </>
      );
    }

    if (page === 'textInput') {
      return (
        <>
          <ScreenHeader title="文字记录" sub="支持一句话多个学生" />
          <div className="space-y-3 p-5">
            <textarea className="h-40 w-full rounded-2xl bg-gray-50 p-3 text-sm" defaultValue="1班1号和2号今天主动打扫卫生。" />
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">示例：王小明帮助同学整理图书角。</div>
            <button type="button" onClick={() => { setRecordCount((count) => count + 2); setShowMultiResult(true); navigate('aiResult'); }} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">提交识别</button>
          </div>
        </>
      );
    }

    if (page === 'photoAward') {
      return (
        <>
          <ScreenHeader title="拍照识别奖状" />
          <div className="space-y-3 p-5">
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-gray-200 text-sm font-black">奖状图片预览区</div>
            <button type="button" onClick={() => { setRecordCount((count) => count + 1); navigate('aiResult'); }} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">拍照识别</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">从相册选择</button>
          </div>
        </>
      );
    }

    if (page === 'aiResult') {
      return (
        <>
          <ScreenHeader title="AI识别结果" sub="已入库，可直接修正" />
          <div className="space-y-3 p-5 pb-20">
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">原始输入：1班1号和2号主动打扫卫生。</div>
            <AiResultCard />
            {showMultiResult && <AiResultCard second />}
            <button type="button" onClick={() => navigate('record')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">继续记录</button>
            <button type="button" onClick={() => navigate('classReport')} className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">查看班级统计</button>
          </div>
        </>
      );
    }

    if (page === 'editResult') {
      return (
        <>
          <ScreenHeader title="编辑识别结果" sub="修改立即生效" />
          <div className="space-y-3 p-5">
            {['事件时间：今天 10:20', '识别对象：王小明｜20250101', '五育指标：劳育-劳动习惯-主动劳动', '加分/减分：加分 +2', 'AI评语：主动参与班级劳动'].map((item) => (
              <button key={item} type="button" className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-3 text-left text-xs font-black">
                {item}<ChevronRight size={16} />
              </button>
            ))}
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">同步状态：已生效 / 保存中 / 待同步 / 同步失败</div>
            <button type="button" onClick={() => navigate('aiResult')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">保存修改</button>
          </div>
        </>
      );
    }

    if (page === 'classList') {
      return (
        <>
          <ScreenHeader title="班级" />
          <div className="space-y-3 p-5 pb-24">
            {['2025级1班｜2人｜今日记录2', '2025级2班｜0人｜今日记录0'].map((item) => (
              <button key={item} onClick={() => navigate('classDetail')} className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-4 text-left text-sm font-black">
                {item}<ChevronRight size={18} />
              </button>
            ))}
            <button type="button" onClick={() => navigate('classCreate')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">新建班级</button>
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'classDetail') {
      return (
        <>
          <ScreenHeader title="2025级1班" sub="2人｜2条记录" />
          <div className="space-y-3 p-5 pb-28">
            <div className="grid grid-cols-3 rounded-2xl bg-gray-50 text-center text-xs font-black"><button className="p-3">学生</button><button className="border-x border-gray-100 p-3">记录</button><button onClick={() => navigate('classReport')} className="p-3">报告</button></div>
            {['王小明｜20250101｜男', '李小红｜20250102｜女'].map((item) => <button key={item} onClick={() => navigate('studentDetail')} className="w-full rounded-2xl bg-gray-50 p-3 text-left text-sm font-black">{item}</button>)}
          </div>
          <div className="absolute inset-x-5 bottom-20 grid h-14 grid-cols-[1fr_2fr_1fr] gap-2 rounded-2xl bg-white p-2 text-xs font-black">
            <button onClick={() => navigate('photoAward')} className="rounded-xl bg-gray-50">拍照</button>
            <button onClick={startVoice} onMouseUp={finishVoice} className="rounded-xl bg-gray-950 text-white">按住说话</button>
            <button onClick={() => navigate('textInput')} className="rounded-xl bg-gray-50">文字</button>
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'studentDetail') {
      return (
        <>
          <ScreenHeader title="王小明" sub="20250101｜男｜2025级1班" />
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-gray-50 p-3">总记录<br />12</div><div className="rounded-2xl bg-gray-50 p-3">加分<br />10</div><div className="rounded-2xl bg-gray-50 p-3">减分<br />2</div></div>
            <button onClick={() => navigate('record')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">为该学生记录</button>
            <button onClick={() => navigate('termReport')} className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">生成月度报告</button>
          </div>
        </>
      );
    }

    if (page === 'classReport') {
      return (
        <>
          <ScreenHeader title="班级统计报告" sub="有记录即可统计" />
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-gray-50 p-3">记录总数<br />{recordCount}</div><div className="rounded-2xl bg-gray-50 p-3">覆盖学生<br />2</div><div className="rounded-2xl bg-gray-50 p-3">加分记录<br />2</div><div className="rounded-2xl bg-gray-50 p-3">减分记录<br />0</div></div>
            <div className="rounded-2xl bg-gray-50 p-3 text-xs">五育指标分布：劳育 2 / 德育 0 / 智育 0 / 体育 0 / 美育 0</div>
            <button type="button" onClick={() => navigate('termReport')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">生成月度/期末AI报告</button>
          </div>
        </>
      );
    }

    if (page === 'termReport') {
      return (
        <>
          <ScreenHeader title="AI成长报告" sub="月度/期末" />
          <div className="space-y-3 p-5">
            <div className="rounded-2xl bg-gray-50 p-3 text-xs">生成条件：当前 {recordCount} 条日常行为记录。</div>
            <div className="rounded-3xl border border-dashed border-gray-200 p-5 text-xs leading-6">AI 报告内容区：总结 / 五育表现 / 亮点 / 待提升方向 / 建议。</div>
            <button type="button" className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">生成报告</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">复制报告</button>
          </div>
        </>
      );
    }

    if (page === 'mine') {
      return (
        <>
          <ScreenHeader title="我的" />
          <div className="space-y-3 p-5 pb-24">
            <div className="rounded-3xl bg-gray-50 p-4 text-xs leading-6"><b>郭老师</b><br />任教学科：班主任/全科<br />身份类型：班主任<br />学校名称：未填写</div>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">补充学校名称</button>
            <button type="button" onClick={() => navigate('advisor')} className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">联系顾问</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">用户协议与隐私政策</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black line-through">退出登录</button>
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'advisor') {
      return (
        <>
          <ScreenHeader title="顾问联系方式" sub="需要时主动联系" />
          <div className="space-y-3 p-5">
            <div className="rounded-3xl bg-gray-50 p-5 text-center text-sm font-black">顾问微信二维码占位</div>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">复制微信</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">拨打电话</button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <main className="h-[100dvh] w-screen overflow-hidden bg-white p-4 text-gray-950">
      <PhoneMockup showDeviceFrame={false} safeAreaTop={false}>
        <div className="relative h-full w-full overflow-hidden bg-white">
          {renderStateContent()}
          {renderPhonePage()}
          {renderWechatPhoneSheet()}
        </div>
      </PhoneMockup>
    </main>
  );
};

export default TeacherCMobileLowFi;
