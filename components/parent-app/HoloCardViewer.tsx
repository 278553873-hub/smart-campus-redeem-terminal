import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const CARD_ROOT = '/cards/koi-guardian';
const vertexShader = `varying vec2 vUv;
void main(){vUv=vec2(uv.x,1.0-uv.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const sharedShader = `precision highp float;
varying vec2 vUv;
uniform float uTime,uFoil,uScale,uDepth,uBgDepth,uSafeScale;
uniform vec2 uSafeOffset;
uniform vec3 uView;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
vec3 spectrum(float t){t=fract(t);vec3 pink=vec3(1.,.32,.62),yellow=vec3(1.,.85,.32),blue=vec3(.22,.62,1.);if(t<.35)return mix(pink,yellow,t/.35);if(t<.7)return mix(yellow,blue,(t-.35)/.35);return mix(blue,vec3(1.),(t-.7)/.3);}
vec3 overlay(vec3 b,vec3 f){return mix(2.*b*f,1.-2.*(1.-b)*(1.-f),step(vec3(.5),b));}
float inside(vec2 p){return step(0.,p.x)*step(0.,p.y)*step(p.x,1.)*step(p.y,1.);}
vec2 parallax(vec2 p,float s,float d){return (p-.5)*s+.5+uView.xy/max(abs(uView.z),.35)*d*.14;}
float wave(vec2 p){vec2 a=p+uView.xy*2.4;return .5+.5*sin((a.x*.848-a.y*.530)*6.283*.55+7.*noise(a*1.5));}
float star(vec2 p){vec2 q=p*105.,id=floor(q),f=fract(q);float first=9.,second=9.;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(hash(id+g),hash(id+g+43.3));float d=length(g+o-f);if(d<first){second=first;first=d;}else second=min(second,d);}}float edge=1.-smoothstep(.01,.035,second-first);float sparse=step(.90,hash(id+8.8));float twinkle=pow(.5+.5*sin(uTime*1.8+hash(id)*30.+uView.x*27.+uView.y*21.),6.);return edge*sparse*twinkle;}`;
const fragmentShader = sharedShader + `
uniform sampler2D tSubject,tBackground,tText,tLine;
void main(){
 vec2 uv=vUv; vec2 su=parallax(uv,uScale,uDepth)*uSafeScale+uSafeOffset; vec2 bu=parallax(uv,1.,uBgDepth);
 vec4 sub=texture2D(tSubject,clamp(su,0.,1.));sub.a*=inside(su); vec3 bg=texture2D(tBackground,clamp(bu,0.,1.)).rgb;
 float w=wave(uv); vec3 foil=spectrum(w*.8+noise(uv*5.)*.12); vec3 subject=mix(sub.rgb,overlay(sub.rgb,foil),uFoil*.28); bg=mix(bg,overlay(bg,foil),uFoil*.36); vec3 col=mix(bg,subject,sub.a);
 float sweep=pow(max(0.,sin((uv.x*.83+uv.y*.35+uView.x*1.8+uView.y*.9)*6.283)),12.); col+=foil*sweep*uFoil*.28;
 float line=1.-smoothstep(.06,.25,texture2D(tLine,clamp(su,0.,1.)).r); col+=vec3(1.,.94,.78)*line*inside(su)*sub.a*sweep*uFoil*.22;
 col+=vec3(.66,.86,1.)*star(bu)*uFoil*.65*(1.-sub.a*.7); vec4 text=texture2D(tText,uv);col=mix(col,text.rgb,text.a);
 gl_FragColor=vec4(pow(max(col,vec3(0.)),vec3(2.2)),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const edgeFragment = sharedShader + `
void main(){vec3 col=mix(vec3(.55,.34,.1),spectrum(wave(vUv)),.65+uFoil*.2);gl_FragColor=vec4(col*.8+.14,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`;

interface HoloCardViewerProps { onClose: () => void; }

const HoloCardViewer: React.FC<HoloCardViewerProps> = ({ onClose }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let composer: EffectComposer | undefined;
    let root: THREE.Group | undefined;
    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let dragging = false;
    let lastPointer = { x: 0, y: 0 };
    let lastTime = 0;
    let elapsed = 0;
    let targetX = 0.025;
    let targetY = -0.13;
    let rotationX = targetX;
    let rotationY = targetY;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 5.65, -5.65, .1, 100);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const resize = () => {
      if (!renderer || !composer) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.left = -5.65 * aspect;
      camera.right = 5.65 * aspect;
      camera.top = 5.65;
      camera.bottom = -5.65;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      lastPointer = { x: event.clientX, y: event.clientY };
      stage.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      targetY = THREE.MathUtils.clamp(targetY + (event.clientX - lastPointer.x) * .006, -.65, .65);
      targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastPointer.y) * .005, -.43, .43);
      lastPointer = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = () => { dragging = false; };

    const init = async () => {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setClearColor(0xffffff, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      stage.appendChild(renderer.domElement);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(720, 1000), .18, .35, 1.0));
      composer.addPass(new OutputPass());

      const loader = new THREE.TextureLoader();
      const textures = await Promise.all(['subject', 'background', 'text', 'lineart'].map(name => loader.loadAsync(`${CARD_ROOT}/assets/${name}.png`)));
      textures.forEach(texture => { texture.colorSpace = THREE.NoColorSpace; texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 8); texture.needsUpdate = true; });
      const uniforms = {
        tSubject: { value: textures[0] }, tBackground: { value: textures[1] }, tText: { value: textures[2] }, tLine: { value: textures[3] },
        uTime: { value: 0 }, uView: { value: new THREE.Vector3(0, 0, 1) }, uFoil: { value: 1 }, uScale: { value: 1.25 }, uDepth: { value: .4 }, uBgDepth: { value: -.25 }, uSafeScale: { value: 1.12 }, uSafeOffset: { value: new THREE.Vector2(-.06, -.085) },
      };
      const frontMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, side: THREE.FrontSide });
      const edgeMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: edgeFragment });
      const goldMaterial = new THREE.MeshBasicMaterial({ color: 0xbfa26b });
      const gltf = await new GLTFLoader().loadAsync(`${CARD_ROOT}/assets/card.glb`);
      root = new THREE.Group(); root.add(gltf.scene); scene.add(root);
      let hasFace = false;
      gltf.scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = Array.isArray(object.material) ? object.material[0] : object.material;
        const role = material?.name;
        if (role === 'web_front') { object.material = frontMaterial; hasFace = true; }
        else if (role === 'web_gold') object.material = goldMaterial;
        else if (role === 'web_text') object.visible = false;
        else object.material = edgeMaterial;
      });
      if (!hasFace) throw new Error('卡片模型缺少正面材质');
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); resize(); setReady(true);

      const animate = (now: number) => {
        const delta = Math.min((now - lastTime) / 1000, .1) || 0; lastTime = now; elapsed += delta;
        if (root && composer) {
          const ease = 1 - Math.exp(-delta * 8); rotationX += (targetX - rotationX) * ease; rotationY += (targetY - rotationY) * ease; root.rotation.set(rotationX, rotationY, 0); root.updateMatrixWorld(true);
          uniforms.uView.value.copy(camera.position).applyMatrix4(new THREE.Matrix4().copy(root.matrixWorld).invert()).normalize(); uniforms.uTime.value = elapsed; composer.render();
        }
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };

    stage.addEventListener('pointerdown', pointerDown); stage.addEventListener('pointermove', pointerMove); stage.addEventListener('pointerup', pointerUp); stage.addEventListener('pointercancel', pointerUp);
    init().catch(initError => setError(initError instanceof Error ? initError.message : '卡片加载失败'));
    return () => {
      cancelAnimationFrame(frame); resizeObserver?.disconnect();
      stage.removeEventListener('pointerdown', pointerDown); stage.removeEventListener('pointermove', pointerMove); stage.removeEventListener('pointerup', pointerUp); stage.removeEventListener('pointercancel', pointerUp);
      renderer?.dispose(); composer?.dispose(); if (renderer?.domElement.parentElement === stage) stage.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex min-h-0 flex-col bg-[#f7f5f2] text-[#252525]">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur-xl">
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-[#383532] active:bg-black/5" aria-label="返回卡册"><span aria-hidden="true" className="text-xl leading-none">‹</span></button>
        <h1 className="text-[17px] font-semibold">锦鲤守护者</h1>
        <span className="w-10" aria-hidden="true" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
        <div className="mx-auto max-w-[360px]">
          <div ref={stageRef} className="relative aspect-[2/3] overflow-hidden bg-transparent touch-none cursor-grab active:cursor-grabbing" tabIndex={0} aria-label="可拖动查看锦鲤全息卡">
            {!ready && !error && <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-sm font-medium text-white/75">正在打开卡片…</div>}
            {error && <div className="absolute inset-0 z-10 flex items-center justify-center px-8 text-center text-sm font-medium text-white/80" role="alert">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoloCardViewer;
