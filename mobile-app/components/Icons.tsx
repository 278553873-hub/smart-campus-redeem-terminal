import React from 'react';
import {
  ChevronLeft, MoreHorizontal, FileText, ChevronRight,
  Mars, Venus, Star, BookOpen, Activity, Palette,
  Sprout, Lightbulb, Trophy, Award, TrendingUp,
  Camera, Mic, Image as ImageIcon, CheckCircle2, Circle,
  Users, BarChart3, Home, User, Plus, X, Edit3, HelpCircle,
  ArrowLeftRight, Trash2, RefreshCw, Settings, Volume2, FileSpreadsheet,
  Keyboard, StopCircle, AlertCircle, ChevronDown,
  Shield, Lock, LogOut, FileBarChart, MoreVertical, File,
  Disc, GripHorizontal, Search, Filter, Bot, Calendar, Gift, ScanFace,
  Eye, EyeOff
} from 'lucide-react';


export const BackIcon = ({ className }: { className?: string }) => <ChevronLeft className={`w-6 h-6 ${className || 'text-gray-800'}`} />;
export const MenuIcon = ({ className }: { className?: string }) => <MoreHorizontal className={`w-6 h-6 ${className || 'text-gray-800'}`} />;
export const EyeIcon = ({ className }: { className?: string }) => <Eye className={className} />;
export const EyeOffIcon = ({ className }: { className?: string }) => <EyeOff className={className} />;
export const FocusIcon = () => (
  <div className="w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center">
    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
  </div>
);
export const ReportIcon = ({ className }: { className?: string }) => <FileText className={`w-5 h-5 ${className}`} />;
export const FileTextIcon = ({ className }: { className?: string }) => <FileText className={className} />;
export const ArrowRightIcon = ({ className }: { className?: string }) => <ChevronRight className={`w-5 h-5 text-gray-400 ${className}`} />;
export const ChevronRightIcon = ({ className }: { className?: string }) => <ChevronRight className={className} />;
export const ChevronDownIcon = ({ className }: { className?: string }) => <ChevronDown className={className} />;
export const CalendarIcon = ({ className }: { className?: string }) => <Calendar className={className} />;

export const MaleIcon = ({ className }: { className?: string }) => <Mars className={`w-3 h-3 ${className || 'text-white'}`} />;
export const FemaleIcon = ({ className }: { className?: string }) => <Venus className={`w-3 h-3 ${className || 'text-white'}`} />;

// Five Education Icons
export const MoralIcon = () => <Star className="w-5 h-5 text-amber-500" />;
export const IntellectualIcon = () => <BookOpen className="w-5 h-5 text-blue-500" />;
export const PhysicalIcon = () => <Activity className="w-5 h-5 text-emerald-500" />;
export const AestheticIcon = () => <Palette className="w-5 h-5 text-pink-500" />;
export const LaborIcon = () => <Sprout className="w-5 h-5 text-lime-600" />;
export const CreativityIcon = () => <Lightbulb className="w-5 h-5 text-purple-500" />;

// UI Icons
export const StarIcon = ({ className }: { className?: string }) => <Star className={className} />;
export const TrophyIcon = ({ className }: { className?: string }) => <Trophy className={className || "w-4 h-4"} />;
export const AwardIcon = ({ className }: { className?: string }) => <Award className={className || "w-4 h-4"} />;
export const GrowthIcon = () => <TrendingUp className="w-4 h-4" />;
export const CameraIcon = ({ className }: { className?: string }) => <Camera className={className} />;
export const MicIcon = ({ className }: { className?: string }) => <Mic className={className} />;
export const ImageIconIcon = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const CheckCircleIcon = ({ className }: { className?: string }) => <CheckCircle2 className={className} />;
export const CircleIcon = ({ className }: { className?: string }) => <Circle className={className} />;
export const UsersIcon = ({ className }: { className?: string }) => <Users className={className} />;
export const ChartIcon = ({ className }: { className?: string }) => <BarChart3 className={className} />;
export const HomeIcon = ({ className }: { className?: string }) => <Home className={className} />;
export const UserIcon = ({ className }: { className?: string }) => <User className={className} />;
export const PlusIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => <Plus className={className} style={style} />;
export const CloseIcon = ({ className }: { className?: string }) => <X className={className} />;
export const EditIcon = ({ className }: { className?: string }) => <Edit3 className={className} />;
export const HelpIcon = ({ className }: { className?: string }) => <HelpCircle className={className} />;
export const ActivityIcon = ({ className }: { className?: string }) => <Activity className={className} />;
export const AlertCircleIcon = ({ className }: { className?: string }) => <AlertCircle className={className} />;
export const ShieldIcon = ({ className }: { className?: string }) => <Shield className={className} />;
export const LockIcon = ({ className }: { className?: string }) => <Lock className={className} />;
export const LogOutIcon = ({ className }: { className?: string }) => <LogOut className={className} />;
export const FileBarChartIcon = ({ className }: { className?: string }) => <FileBarChart className={className} />;
export const MoreVerticalIcon = ({ className }: { className?: string }) => <MoreVertical className={className} />;
export const GenericFileIcon = ({ className }: { className?: string }) => <File className={className} />;
export const SearchIcon = ({ className }: { className?: string }) => <Search className={className} />;
export const FilterIcon = ({ className }: { className?: string }) => <Filter className={className} />;
export const GiftIcon = ({ className }: { className?: string }) => <Gift className={className} />;
export const ScanFaceIcon = ({ className }: { className?: string }) => <ScanFace className={className} />;

// Log Specific
export const SwapIcon = ({ className }: { className?: string }) => <ArrowLeftRight className={className} />;
export const DeleteIcon = ({ className }: { className?: string }) => <Trash2 className={className} />;
export const RetryIcon = ({ className }: { className?: string }) => <RefreshCw className={className} />;
export const TargetIcon = ({ className }: { className?: string }) => <Settings className={className} />;
export const VolumeIcon = ({ className }: { className?: string }) => <Volume2 className={className} />;
export const FileIcon = ({ className }: { className?: string }) => <FileSpreadsheet className={className} />;

// New Input Icons
export const KeyboardIcon = ({ className }: { className?: string }) => <Keyboard className={className} />;
export const StopCircleIcon = ({ className }: { className?: string }) => <StopCircle className={className} />;

// WeChat specific
export const WechatMoreIcon = ({ className }: { className?: string }) => <MoreHorizontal className={className} />;
export const WechatCloseIcon = ({ className }: { className?: string }) => <Disc className={className} />; // Simulating the circle dot
export const PrinterIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
export const ShareIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;
export const RobotIcon = ({ className }: { className?: string }) => <Bot className={className} />;
