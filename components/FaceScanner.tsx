
import React, { useRef, useEffect, useState } from 'react';
import { Camera, UserCheck } from 'lucide-react';

interface FaceScannerProps {
  onSuccess: () => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);
  const [identified, setIdentified] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("无法访问摄像头", err);
      }
    }

    startCamera();

    // 模拟识别过程
    const timer = setTimeout(() => {
      setScanning(false);
      setIdentified(true);

      // 关键更新：认证完成后立即停止摄像头所有轨道
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // 延迟跳转，让学生看到“欢迎回来”的提示
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3500);

    return () => {
      clearTimeout(timer);
      // 组件卸载时的安全清理
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-8 animate-in fade-in duration-700">
      {/* 彻底根治锯齿方案：内层常规溢出隐藏，外层覆盖一层匹配环境底色的抗锯齿修边圆环 */}
      <div className="relative w-80 h-80 flex items-center justify-center isolate z-10 scale-[1.05]">

        <div className="absolute inset-0 rounded-full overflow-hidden bg-gray-900 border-[8px] border-blue-500 shadow-2xl z-10" style={{ transform: 'translateZ(0)' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover grayscale brightness-110 transition-opacity duration-500 ${identified ? 'opacity-0' : 'opacity-100'}`}
          />

          {scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div className="w-full h-1 bg-blue-500 absolute top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#3b82f6]"></div>
              <div className="text-white font-bold bg-blue-500 px-4 py-2 rounded-full animate-pulse z-10">
                人脸识别中...
              </div>
            </div>
          )}

          {identified && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500 animate-in zoom-in duration-300 z-30">
              <UserCheck size={80} className="text-white relative z-10" />
              <div className="text-white text-2xl font-bold mt-2 relative z-10">欢迎回来，郑同学！</div>
            </div>
          )}
        </div>

        {/* 关键修复层：这个环比容器大那么1个像素，颜色与父级大背景完全融合，利用原生的矢量边框裁掉里面的白边或像素噪点 */}
        <div className="absolute -inset-[2px] pointer-events-none rounded-full border-[3px] border-[#f0f9ff] z-50"></div>
        {/* 用一个透明度淡一点的蓝环再次勾勒边缘 */}
        <div className="absolute inset-0 pointer-events-none rounded-full border-[8px] border-blue-600/10 z-40"></div>
      </div>

      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-gray-800">
          {identified ? '认证成功' : '请目视前方'}
        </h2>
        <p className="text-gray-500 mt-2">
          {identified ? '正在进入系统，请稍候...' : '将面部对准圆圈，即可安全登录你的个人校园账户。'}
        </p>
      </div>

      <div className="flex gap-4 min-h-[42px]">
        {!identified && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-gray-400 border border-gray-100 animate-in fade-in duration-500">
            <Camera size={20} />
            <span>生物识别加密保护</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceScanner;
