import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, RotateCw, Tablet } from 'lucide-react';
import TeacherPad from './TeacherPad';
import SimulatedMiniProgramChrome from '../SimulatedMiniProgramChrome';
import { teacherPadFeatures, teacherPadPhaseTwoFeatures } from './teacherPadFeatures';
import './teacherPadPreview.css';

const sizes = [{label:'11 英寸 · 1194 × 834',width:1194,height:834},{label:'10.2 英寸 · 1080 × 810',width:1080,height:810}];
export default function TeacherPadPreview(){
 const [shell,setShell]=useState(true),[portrait,setPortrait]=useState(false),[size,setSize]=useState(0),[scale,setScale]=useState(1);
 const [phase,setPhase]=useState<'first'|'second'>('first');
 const stage=useRef<HTMLDivElement>(null);
 const phaseCard=useRef<HTMLElement>(null);
 const preset=sizes[size];const width=portrait?preset.height:preset.width;const height=portrait?preset.width:preset.height;const bezel=shell?20:0;
 useEffect(()=>{const target=stage.current;const card=phaseCard.current;if(!target||!card)return;const update=()=>{const narrow=window.matchMedia('(max-width:700px)').matches;const availableWidth=target.clientWidth-48-(narrow?0:card.offsetWidth+26);const availableHeight=target.clientHeight-48-(narrow?card.offsetHeight+8:0);setScale(Math.max(.1,Math.min(availableWidth/(width+bezel*2),availableHeight/(height+bezel*2),1)));};const observer=new ResizeObserver(update);observer.observe(target);observer.observe(card);update();return()=>observer.disconnect();},[width,height,bezel]);
 return <div className="pad-preview"><div className="pad-preview-controls" aria-label="Pad预览控件"><button aria-label="模拟真实Pad" aria-pressed={shell} onClick={()=>setShell(v=>!v)}><Tablet size={18}/>模拟真实 Pad<span className={`pad-preview-switch ${shell?'on':''}`} aria-hidden="true"><i/></span></button><button onClick={()=>setPortrait(v=>!v)} aria-label="切换Pad横竖屏"><RotateCw size={18}/>{portrait?'竖屏':'横屏'}</button><label className="pad-size-control"><span className="sr-only">Pad尺寸</span><select aria-label="Pad尺寸" value={size} onChange={e=>setSize(Number(e.target.value))}>{sizes.map((s,i)=><option value={i} key={s.label}>{s.label}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label></div>
 <div className="pad-preview-layout"><div className="pad-preview-stage" ref={stage}><div className="pad-preview-footprint" style={{width:(width+bezel*2)*scale,height:(height+bezel*2)*scale}}><div className={`pad-device ${shell?'pad-device-shell':''}`} style={{width:width+bezel*2,height:height+bezel*2,padding:bezel,transform:`scale(${scale})`}}>{shell&&<span className={`pad-device-camera ${portrait?'portrait':''}`}/>}<div className="pad-device-screen" style={{width,height,'--mini-program-status-bar-height':shell?'28px':'0px','--mini-program-title-bar-height':'44px','--mini-program-capsule-right-inset':shell?'108px':'0px','--mini-program-bottom-safe-area':shell?'20px':'0px'} as React.CSSProperties}><div className="pad-native-content"><TeacherPad features={phase==='first'?teacherPadFeatures:teacherPadPhaseTwoFeatures}/></div>{shell&&<SimulatedMiniProgramChrome/>}</div></div></div>
 <section ref={phaseCard} className="pad-phase-card" aria-label="Pad功能预览设置">
  <h2>功能预览</h2><div className="pad-phase-options" role="group" aria-label="预览阶段">
   <button type="button" aria-pressed={phase==='first'} onClick={()=>setPhase('first')}>第一期</button>
   <button type="button" aria-pressed={phase==='second'} onClick={()=>setPhase('second')}>第二期</button>
  </div>
 </section></div></div></div>;
}
