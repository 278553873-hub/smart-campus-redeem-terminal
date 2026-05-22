/* eslint-disable react/no-unknown-property */
import React, { memo, Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Preload } from '@react-three/drei';
import { easing } from 'maath';

interface TeacherFluidGlassNavProps {
  activeIndex: number;
  itemCount: number;
}

// 生成静态背景极光斑的画布纹理 (边缘采用径向渐变完全淡出，无任何直角切边)
const makeAuroraTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 256);

  // 绘制极光背景斑色块 (使用径向渐变实现自然柔和的边缘羽化)
  // 靛蓝色斑
  const grad1 = ctx.createRadialGradient(320, 128, 0, 320, 128, 180);
  grad1.addColorStop(0, 'rgba(129, 140, 248, 0.45)'); // Indigo 400
  grad1.addColorStop(1, 'rgba(129, 140, 248, 0)');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.arc(320, 128, 180, 0, Math.PI * 2);
  ctx.fill();

  // 桃红色斑
  const grad2 = ctx.createRadialGradient(700, 128, 0, 700, 128, 160);
  grad2.addColorStop(0, 'rgba(236, 72, 153, 0.42)'); // Pink 500
  grad2.addColorStop(1, 'rgba(236, 72, 153, 0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(700, 128, 160, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const BarGlass = memo(function BarGlass({ activeIndex, itemCount }: TeacherFluidGlassNavProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const backlightRef = useRef<THREE.Mesh>(null!);
  
  const { viewport: vp, camera: mainCamera } = useThree();

  // 获取不同深度下的自适应视口尺寸，消除透影视差
  const v12 = vp.getCurrentViewport(mainCamera, [0, 0, 12]);
  
  const v15 = vp.getCurrentViewport(mainCamera, [0, 0, 15]);
  const spacing15 = v15.width / Math.max(itemCount, 1);
  const boxWidth = spacing15 * 0.90;
  const boxHeight = v15.height * 0.80;

  // 极光背景纹理
  const auroraTexture = useMemo(makeAuroraTexture, []);

  // 自定义胶囊几何体 (使用 ExtrudeGeometry 来避免 RoundedBox 在深度较小时，圆角设置过大产生顶点破面/重影/黑斑的 R3F Bug)
  const capsuleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = boxWidth;
    const h = boxHeight;
    const r = h / 2; // X/Y 轴呈完美的半圆胶囊状
    
    shape.absarc(-w/2 + r, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
    shape.absarc(w/2 - r, 0, r, Math.PI * 1.5, Math.PI * 2.5, false);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,          // Z轴厚度
      bevelEnabled: true,  // 启用倒角，折射出亮丽的反光抛光线
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
      steps: 1
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();          // 将几何体中心点移至 [0, 0, 0]
    return geo;
  }, [boxWidth, boxHeight]);

  useFrame((state, delta) => {
    // 1. 计算滑块在 Z=15 深度下的 targetX
    const targetX15 = (activeIndex - (itemCount - 1) / 2) * spacing15;
    
    // 2. 缓动更新滑块的实际位置
    if (ref.current) {
      easing.damp3(ref.current.position, [targetX15, 0, 15], 0.15, delta);
    }

    // 3. 背光白球随动：它的 Z=12.1，因此它的跟随 X 坐标需要转换为 Z=12.1 投影下的坐标
    if (backlightRef.current) {
      const v12_1 = state.viewport.getCurrentViewport(state.camera, [0, 0, 12.1]);
      const spacing12_1 = v12_1.width / Math.max(itemCount, 1);
      const targetX12_1 = (activeIndex - (itemCount - 1) / 2) * spacing12_1;
      
      easing.damp3(backlightRef.current.position, [targetX12_1, 0, 12.1], 0.15, delta);
    }
  });

  return (
    <>
      {/* 1. 底层莹白背景板 (Z=11.9，足够宽大，提供白透质感，杜绝折射边缘黑边) */}
      <mesh position={[0, 0, 11.9]}>
        <planeGeometry args={[v12.width * 2.2, v12.height * 2.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.52} depthWrite={false} />
      </mesh>

      {/* 2. 底层极光斑底盘 (Z=12.0，静止排布，滑块移动时产生透镜流动极光感) */}
      <mesh position={[0, 0, 12.0]}>
        <planeGeometry args={[v12.width * 1.5, v12.width * 1.5 / 4]} />
        <meshBasicMaterial map={auroraTexture} transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* 3. 运动中的莹白高光背光球 (Z=12.1，只在滑条正后方跟随，提供中心发光感，且由于小于滑块投影而绝不溢出) */}
      <mesh ref={backlightRef} position={[0, 0, 12.1]}>
        <sphereGeometry args={[boxHeight * 0.28, 32, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* 4. iOS 26 物理液态玻璃折射滑条 (使用自定义 Extrude 几何体 + 极致折射透射材质) */}
      <mesh
        ref={ref}
        geometry={capsuleGeometry}
        position={[0, 0, 15]}
      >
        <MeshTransmissionMaterial
          transmission={1.0}           // 全透射
          roughness={0.06}              // 精细微磨砂
          thickness={0.6}               // 增强物理厚度折射
          ior={1.22}                    // 折射率 (提供迷人的透镜边缘变形)
          chromaticAberration={0.06}    // 边缘色散虹光
          anisotropy={0.15}             // 各向异性
          distortion={0.0}              // 禁用波纹扭曲以保障文字清晰度
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={1.2}
          depthWrite={false}
        />
      </mesh>
    </>
  );
});

const TeacherFluidGlassNav: React.FC<TeacherFluidGlassNavProps> = ({ activeIndex, itemCount }) => {
  return (
    <Canvas
      className="teacher-fluid-glass-canvas"
      camera={{ position: [0, 0, 20], fov: 15 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <BarGlass activeIndex={activeIndex} itemCount={itemCount} />
      </Suspense>
      <Preload />
    </Canvas>
  );
};

export default TeacherFluidGlassNav;
