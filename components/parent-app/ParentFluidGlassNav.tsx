/* eslint-disable react/no-unknown-property */
import React, { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Preload, Text, useFBO, useGLTF } from '@react-three/drei';
import { easing } from 'maath';

interface ParentFluidGlassNavProps {
  activeIndex: number;
  itemCount: number;
}

const labels = ['成长', '报告', '我的'];

const makeNavTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, '#fffdf6');
  g.addColorStop(0.45, '#ffffff');
  g.addColorStop(1, '#edf4ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#111827';
  ctx.font = '700 34px PingFang SC, sans-serif';
  ['表扬 +3', '报告', '家长', '我的'].forEach((text, index) => {
    ctx.fillText(text, 70 + index * 235, 78 + (index % 2) * 70);
  });

  ctx.globalAlpha = 0.42;
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.ellipse(235, 172, 118, 34, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(790, 86, 96, 28, 0.2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const SceneContent = ({ activeIndex, itemCount }: ParentFluidGlassNavProps) => {
  const texture = useMemo(makeNavTexture, []);
  const activeRef = useRef<THREE.Mesh>(null);
  const { viewport, camera } = useThree();

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const spacing = (v.width * 0.7) / Math.max(itemCount, 1);
    const targetX = (activeIndex - (itemCount - 1) / 2) * spacing;
    easing.damp3(activeRef.current.position, [targetX, -v.height / 2 + 0.2, 15.08], 0.16, delta);
  });

  return (
    <>
      <mesh position={[0, -0.05, 12]} scale={[7.2, 1.8, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent opacity={0.92} />
      </mesh>
      <mesh ref={activeRef} renderOrder={8}>
        <sphereGeometry args={[0.62, 48, 18]} />
        <meshBasicMaterial transparent opacity={0.26} color="#ffffff" depthWrite={false} />
      </mesh>
      {labels.map((label, index) => (
        <Text
          key={label}
          position={[(index - 1) * 1.18, -0.5, 15.1]}
          fontSize={0.12}
          color="#111827"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#ffffff"
          outlineOpacity={0.75}
          depthWrite={false}
          depthTest={false}
        >
          {label}
        </Text>
      ))}
    </>
  );
};

const BarGlass = memo(function BarGlass({ activeIndex, itemCount }: ParentFluidGlassNavProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF('/assets/3d/bar.glb');
  const buffer = useFBO({ samples: 4 });
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = (nodes.Cube as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes]);

  useFrame((state, delta) => {
    const { gl, viewport, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    easing.damp3(ref.current.position, [0, -v.height / 2 + 0.2, 15], 0.15, delta);

    const maxWorld = v.width * 0.92;
    const desired = maxWorld / geoWidthRef.current;
    ref.current.scale.setScalar(Math.min(0.155, desired));

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0xffffff, 0);
  });

  return (
    <>
      {createPortal(<SceneContent activeIndex={activeIndex} itemCount={itemCount} />, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.38} />
      </mesh>
      <mesh ref={ref} rotation-x={Math.PI / 2} geometry={(nodes.Cube as THREE.Mesh)?.geometry}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          transmission={1}
          roughness={0}
          thickness={10}
          ior={1.15}
          chromaticAberration={0.1}
          anisotropy={0.01}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={0.25}
        />
      </mesh>
      <Preload />
    </>
  );
});

const ParentFluidGlassNav: React.FC<ParentFluidGlassNavProps> = ({ activeIndex, itemCount }) => (
  <Canvas
    className="parent-fluid-glass-canvas"
    camera={{ position: [0, 0, 20], fov: 15 }}
    dpr={[1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
  >
    <Suspense fallback={null}>
      <BarGlass activeIndex={activeIndex} itemCount={itemCount} />
    </Suspense>
  </Canvas>
);

useGLTF.preload('/assets/3d/bar.glb');

export default ParentFluidGlassNav;
