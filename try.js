
(()=>{
"use strict";

const SCALE=[0,2,4,5,7,9,11];
const DO=['ド','レ','ミ','ファ','ソ','ラ','シ'];
const LETTERS=['C','D','E','F','G','A','B'], LETTER_PC=[0,2,4,5,7,9,11];

const KEYS=[['C',0],['C',1],['D',-1],['D',0],['E',-1],['E',0],['F',0],['F',1],['G',-1],['G',0],['A',-1],['A',0],['B',-1],['B',0]];
const OLD_KEY=[0,2,3,4,5,6,7,9,10,11,12,13];                 
const OLD_KI=[0,1,2,3,4,4,5,6,7,8,9,10,10,11,12,12,13];      
const SHARP_N=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLAT_N=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const ACC={'0':'','1':'♯','-1':'♭','2':'𝄪','-2':'𝄫'};
const SIZE_F=[0.66,0.8,0.94];
const AUTO_SIDE_MIN=0.03; 

const COL_OFF=[1,0.5,0,0.5];
const HR=Math.sqrt(3)/2, GAP=HR*0.5; 
const OCT_MIN=1, OCT_MAX=6;


const st={ki:0,oct:4,size:0,rot:false,lab:2,off:0,tim:0,dmp:0};
function save(){}

const $=id=>document.getElementById(id);
const frame=$('frame'), app=$('app'), bar=$('bar'), stage=$('stage'), toast=$('toast'), startEl=$('start');


const keyPc=()=>(LETTER_PC[LETTERS.indexOf(KEYS[st.ki][0])]+KEYS[st.ki][1]+12)%12;
const flatKey=()=>KEYS[st.ki][1]<0||(KEYS[st.ki][0]==='F'&&KEYS[st.ki][1]===0);
const rootMidi=()=>12*(st.oct+1)+keyPc();
function spellDeg(d){ 
  const li=(LETTERS.indexOf(KEYS[st.ki][0])+d)%7;
  const pc=(keyPc()+SCALE[d])%12;
  const acc=((pc-LETTER_PC[li]+18)%12)-6;
  return LETTERS[li]+(ACC[acc]??'');
}
const keyName=()=>KEYS[st.ki][0]+ACC[KEYS[st.ki][1]];
const degMidi=d=>rootMidi()+12*Math.floor(d/7)+SCALE[((d%7)+7)%7];


let ctx=null, master=null, sr=48000;
(function makeCtx(){
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{ctx=new AC({latencyHint:0});}catch(e){try{ctx=new AC({latencyHint:'interactive'});}catch(e2){ctx=new AC();}}
  sr=ctx.sampleRate;
  const sh=ctx.createWaveShaper(), n=2048, c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*1.2)/Math.tanh(1.2);}
  sh.curve=c;
  master=ctx.createGain(); master.gain.value=0.85;
  master.connect(sh); sh.connect(ctx.destination);
})();
let keepAlive=false;
function startAudio(){
  if(!ctx) return;
  try{ if(navigator.audioSession) navigator.audioSession.type='playback'; }catch(e){}
  if(ctx.state!=='running') ctx.resume();
  if(!keepAlive){
    keepAlive=true;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.frequency.value=30; g.gain.value=0.00001;
    o.connect(g); g.connect(ctx.destination); o.start();
  }
}

const TIMBRES=[{name:'カリンバ',dur:2.8,peak:0}];
const PARTIALS={},STRING={};
const AMP=0.27, TAU=2*Math.PI;
const cache=new Map(); let jobs=[], cur=null, pumping=false;
const ck=(t,m)=>t*1000+m;
const rnd=j=>{j.seed=(Math.imul(j.seed,1103515245)+12345)&0x7fffffff;return j.seed/0x3fffffff-1;};
function newJob(t,m){
  const f=440*Math.pow(2,(m-69)/12), T=TIMBRES[t], L=Math.floor(T.dur*sr);
  const j={t,m,f,L,i:0,data:new Float32Array(L),seed:(m*9301+49297+t*7919)|0,lp:0,hp:0,
    fs:Math.floor((T.dur-0.45)*sr),ph:0,ph2:0,ph3:0,lo:0,bp:0};
  if(t===0){ j.tau1=Math.min(1.4,Math.max(0.45,1.1*Math.pow(262/f,0.35))); j.w1=TAU*f/sr; j.w2=TAU*f*5.4/sr; j.inh=f*5.4<sr*0.45; }
  return j;
}
const GEN=[
  
  (j,a,b,d)=>{ const clickEnd=0.012*sr, atk=0.0015*sr;
    for(let i=a;i<b;i++){ const t=i/sr;
      let x=Math.sin(j.w1*i)*Math.exp(-t/j.tau1);
      if(j.inh) x+=0.2*Math.sin(j.w2*i)*Math.exp(-t/0.11);
      x*=i<atk?i/atk:1;
      if(i<clickEnd){ j.lp+=(rnd(j)-j.lp)*0.45; x+=j.lp*0.5*Math.exp(-t/0.0012); }
      d[i]=x*AMP; } },
];
function runJob(j,n){
  const end=Math.min(j.L,j.i+n), d=j.data;
  GEN[j.t](j,j.i,end,d);
  for(let i=Math.max(j.i,j.fs);i<end;i++) d[i]*=(j.L-i)/(j.L-j.fs);   
  j.i=end;
  if(end>=j.L){
    const pk=TIMBRES[j.t].peak, tr=TIMBRES[j.t].rms;
    if(tr){ const n0=Math.min(j.L,Math.floor(0.3*sr)); let e=0,mx=1e-6; for(let i=0;i<n0;i++) e+=d[i]*d[i];
      for(let i=0;i<j.L;i++){const v=Math.abs(d[i]); if(v>mx) mx=v;}
      const g=Math.min(tr/Math.sqrt(e/n0+1e-12),0.7/mx); for(let i=0;i<j.L;i++) d[i]*=g; }
    if(pk){ let mx=1e-6; for(let i=0;i<j.L;i++){const v=Math.abs(d[i]); if(v>mx) mx=v;} const g=pk/mx; for(let i=0;i<j.L;i++) d[i]*=g; }
    const buf=ctx.createBuffer(1,j.L,sr);
    if(buf.copyToChannel) buf.copyToChannel(d,0); else buf.getChannelData(0).set(d);
    cache.set(ck(j.t,j.m),buf); return true;
  }
  return false;
}
function pump(){
  const dl=performance.now()+4;
  while(performance.now()<dl){
    if(!cur){ while(jobs.length&&cache.has(ck(st.tim,jobs[0]))) jobs.shift(); if(!jobs.length) break; cur=newJob(st.tim,jobs.shift()); }
    if(runJob(cur,2048)) cur=null;
  }
  if(cur||jobs.length) setTimeout(pump,0); else pumping=false;
}
let lastNeed=[];
function prerender(midis){
  if(!ctx) return;
  lastNeed=midis;
  const need=new Set(midis.map(m=>ck(st.tim,m)));
  if(cache.size>64) for(const k of [...cache.keys()]) if(!need.has(k)) cache.delete(k);
  if(cur&&cur.t!==st.tim) cur=null;
  jobs=midis.filter(m=>!cache.has(ck(st.tim,m))&&!(cur&&cur.m===m));
  if(!pumping&&(jobs.length||cur)){pumping=true;setTimeout(pump,0);}
}
function getBuf(m){
  const k=ck(st.tim,m); let b=cache.get(k); if(b) return b;
  let j=(cur&&cur.m===m&&cur.t===st.tim)?cur:newJob(st.tim,m);
  runJob(j,j.L); if(j===cur) cur=null;
  return cache.get(k);
}
const voices=new Map();

function damp(m){
  const v=voices.get(m); if(!v||!ctx) return;
  const now=ctx.currentTime;
  try{v.g.gain.cancelScheduledValues(now);v.g.gain.setValueAtTime(v.g.gain.value,now);v.g.gain.setTargetAtTime(0,now,0.035);v.s.stop(now+0.25);}catch(e){}
  voices.delete(m);
}
function play(m){
  if(!ctx) return;
  if(ctx.state!=='running') ctx.resume();
  const now=ctx.currentTime, old=voices.get(m);
  if(old){
    try{old.g.gain.cancelScheduledValues(now);old.g.gain.setValueAtTime(1,now);old.g.gain.setTargetAtTime(0,now,0.012);old.s.stop(now+0.07);}catch(e){}
  }
  const s=ctx.createBufferSource(); s.buffer=getBuf(m);
  const g=ctx.createGain(); s.connect(g); g.connect(master); s.start();
  const v={s,g}; voices.set(m,v);
  s.onended=()=>{ if(voices.get(m)===v) voices.delete(m); s.disconnect(); g.disconnect(); };
}

function refreshBar(){}

let cells=[], byMidi=new Map();
function layout(){
  clearAll();
  const fw=frame.clientWidth, fh=frame.clientHeight;
  const W=st.rot?fh:fw, H=st.rot?fw:fh;
  app.style.width=W+'px'; app.style.height=H+'px';
  app.style.transform=st.rot?`translateX(${fw}px) rotate(90deg)`:'none';
  const barH=0;
  bar.style.height=barH+'px';
  bar.style.setProperty('--ic',Math.round(Math.max(13,Math.min(20,(W-12)/(bar.children.length)*0.42)))+'px');
  const sh=H-barH, pv=8;
  stage.style.top=barH+'px'; stage.style.height=sh+'px';
  const availH=sh-pv*2;
  
  
  const NCOL=4;
  const k=(HR+GAP)*HR*(NCOL-1)+1;
  const wMax=Math.min(W/k,availH/(5*(HR+GAP)+HR));
  const w=Math.min(wMax*SIZE_F[st.size],W*(1-2*AUTO_SIDE_MIN)/k), g=w*GAP, h=w*HR, step=h+g, dx=step*HR;
  const gw=(NCOL-1)*dx+w, x0=(W-gw)/2;
  
  const list=[]; let used=0;
  
  maxOff=7*step;
  const yLo=-maxOff-pv-h, yHi=sh-pv+maxOff;
  {
    
    for(let c=0;c<4;c++){
      for(let r=Math.floor(yLo/step)-1;;r++){
        const yb=(r+COL_OFF[c])*step; if(yb>=yHi) break; if(yb<=yLo) continue;
        const d=(c===0||c===1)?2*r+1:2*r, dm=((d%7)+7)%7, outer=c===0||c===3;
        list.push({c,yb,d,s:outer&&dm!==2&&dm!==6,v:outer&&(dm===2||dm===6)}); used=Math.max(used,yb+h);
      }
    }
  }
  used=0;  
  const base=sh-pv;
  stage.textContent='';
  const frag=document.createDocumentFragment();
  const bl=document.createElement('div'); bl.className='band'; bl.dataset.band='1'; bl.style.left='0'; bl.style.width=Math.max(0,x0)+'px';
  const br=document.createElement('div'); br.className='band'; br.dataset.band='1'; br.style.left=(x0+gw)+'px'; br.style.right='0';
  frag.appendChild(bl); frag.appendChild(br);
  const map=document.createElement('div'); map.id='map'; frag.appendChild(map); mapEl=map;
  const mfrag=map;
  cells=[]; byMidi=new Map();
  const fs=Math.max(8,Math.min(13,h*0.22,w*0.1));
  stage.style.setProperty('--fs',fs.toFixed(1)+'px');
  for(const L of list){
    const el=document.createElement('div');
    const d=L.d, dm=((d%7)+7)%7;
    const cell={el,d,dm,midi:null,type:'scale'};
    if(L.v){cell.type='void';}
    else if(L.s){cell.type='sharp';cell.midi=degMidi(d)+1;}
    else{cell.midi=degMidi(d);cell.type=dm===0?'root':'scale';}
    if(cell.midi!=null&&(cell.midi<0||cell.midi>127)){cell.midi=null;cell.type='void';}
    el.className='pad '+cell.type;
    el.style.left=(x0+L.c*dx)+'px';
    el.style.width=w+'px'; el.style.height=h+'px';
    if(cell.midi!=null){
      el.dataset.m=cell.midi;el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label','音を鳴らす '+cell.midi);el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();startAudio();press(cell.midi);play(cell.midi);}});el.addEventListener('keyup',()=>release(cell.midi));el.addEventListener('blur',()=>{if(held.has(cell.midi))release(cell.midi);});
      if(!byMidi.has(cell.midi)) byMidi.set(cell.midi,[]);
      byMidi.get(cell.midi).push(el);
      el.appendChild(document.createElement('span'));
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('relief');svg.setAttribute('width',w);svg.setAttribute('height',h);
      const inset=.9;
      for(const [name,y] of [['upper',inset],['lower',h-inset]]){
        const path=document.createElementNS(svg.namespaceURI,'path');
        path.setAttribute('class',name);
        path.setAttribute('d',`M ${inset} ${h/2} L ${w/4+inset/2} ${y} L ${3*w/4-inset/2} ${y} L ${w-inset} ${h/2}`);
        svg.appendChild(path);
      }
      el.appendChild(svg);
    }
    cells.push(cell); mfrag.appendChild(el);
  }
  
  for(let i=0;i<list.length;i++){
    const top=base+used-list[i].yb-h;
    cells[i].el.style.top=top+'px';
  }
  stage.appendChild(frag);
  applyOff();
  trailSetup(W,sh,w,h,step);
  updateLabels(); refreshBar();
  prerender([...byMidi.keys()].sort((a,b)=>a-b));
}
let maxOff=0, mapEl=null;
function applyOff(){
  if(mapEl) mapEl.style.transform=`translateY(${(-st.off*maxOff).toFixed(1)}px)`;
}

function dragOff(t,x,y){
  const d=st.rot?(x-t.x0):(t.y0-y);
  if(Math.abs(d)>6) t.moved=true;
  if(maxOff>0) setOff(Math.max(-1,Math.min(1,t.off0+d/maxOff)));
}
let lastBandTap=0;
let offSaveT=0;

const TRAIL_LIFE=800;
const trail={cv:null,cx:null,dpr:1,raf:0,gaps:[],lit:new Map(),last:new Map(),rgb:'235,240,255',step:4};
function trailSetup(W,H,w,h,D){
  const cv=document.createElement('canvas'); cv.id='trail';
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.width=W+'px'; cv.style.height=H+'px';
  stage.appendChild(cv);
  trail.cv=cv; trail.cx=cv.getContext('2d'); trail.dpr=dpr; trail.lit.clear(); trail.last.clear();
  trail.rgb=getComputedStyle(document.documentElement).getPropertyValue('--trail').trim()||'235,240,255';
  trail.step=Math.max(2,(D-h)*0.35);                 
  
  const P=cells.map(c=>({x:parseFloat(c.el.style.left)+w/2,y:parseFloat(c.el.style.top)+h/2}));
  const R=w/2, J=D/Math.sqrt(3), dir=a=>[Math.cos(a),Math.sin(a)], d30=Math.PI/6;
  const gaps=[];
  for(let i=0;i<P.length;i++) for(let k=i+1;k<P.length;k++){
    const dx=P[k].x-P[i].x, dy=P[k].y-P[i].y; if(Math.abs(Math.hypot(dx,dy)-D)>1) continue;
    const th=Math.atan2(dy,dx), A=P[i], B=P[k];
    const pts=[];
    for(const s of [-1,1]){
      const va=dir(th+s*d30); pts.push([A.x+R*va[0],A.y+R*va[1]]);            
      pts.push([A.x+J*va[0],A.y+J*va[1]]);                                     
      const vb=dir(th+Math.PI-s*d30); pts.push([B.x+R*vb[0],B.y+R*vb[1]]);    
    }
    const mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
    pts.sort((p,q)=>Math.atan2(p[1]-my,p[0]-mx)-Math.atan2(q[1]-my,q[0]-mx));
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
    gaps.push({pts,x0,x1,y0,y1});
  }
  trail.gaps=gaps;
}
function inConvex(pts,x,y){
  let sign=0;
  for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length];
    const c=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);
    if(c!==0){ const s=c>0?1:-1; if(sign&&s!==sign) return false; sign=s; } }
  return true;
}
function trailMark(x,y,now){
  for(let i=0;i<trail.gaps.length;i++){ const g=trail.gaps[i];
    if(x<g.x0||x>g.x1||y<g.y0||y>g.y1) continue;
    if(inConvex(g.pts,x,y)){ trail.lit.set(i,now); return; } }
}
function trailAdd(id,x,y){
  if(!trail.cv) return;
  const r=stage.getBoundingClientRect(), off=-st.off*maxOff;
  const px=x-r.left, py=y-r.top-off, now=performance.now();       
  const last=trail.last.get(id);
  if(last){ const dx=px-last[0], dy=py-last[1], n=Math.ceil(Math.hypot(dx,dy)/trail.step);
    for(let k=1;k<=n;k++) trailMark(last[0]+dx*k/n,last[1]+dy*k/n,now); }
  else trailMark(px,py,now);
  trail.last.set(id,[px,py]);
  if(!trail.raf) trail.raf=requestAnimationFrame(trailDraw);
}
function trailEnd(id){ trail.last.delete(id); }
function trailDraw(){
  trail.raf=0; const cx=trail.cx; if(!cx) return;
  const now=performance.now(), d=trail.dpr, off=-st.off*maxOff;
  cx.clearRect(0,0,trail.cv.width,trail.cv.height);
  for(const [i,t] of trail.lit){
    const a=1-(now-t)/TRAIL_LIFE; if(a<=0){ trail.lit.delete(i); continue; }
    const p=trail.gaps[i].pts;
    cx.fillStyle=`rgba(${trail.rgb},${(0.6*a).toFixed(3)})`;
    cx.beginPath(); cx.moveTo(p[0][0]*d,(p[0][1]+off)*d);
    for(let k=1;k<p.length;k++) cx.lineTo(p[k][0]*d,(p[k][1]+off)*d);
    cx.closePath(); cx.fill();
  }
  if(trail.lit.size) trail.raf=requestAnimationFrame(trailDraw);
}
function setOff(v){ st.off=v; applyOff(); clearTimeout(offSaveT); offSaveT=setTimeout(save,300); }
function updateLabels(){
  const flat=flatKey();
  for(const c of cells){
    if(c.midi==null) continue;
    let t='';
    if(st.lab<2){
      if(c.type==='sharp'){
        t=st.lab===0?DO[c.dm]+'♯':(flat?FLAT_N:SHARP_N)[c.midi%12];
      }else{
        const nm=spellDeg(c.dm);
        if(c.type==='root'){const on=nm+(Math.floor(c.midi/12)-1);t=st.lab===0?'ド '+on:on;}
        else t=st.lab===0?DO[c.dm]:nm;
      }
    }
    c.el.firstChild.textContent=t;
  }
}
let toastT=0;
function showKey(){
  toast.innerHTML=`${keyName()} <small>ド = ${keyName()}${st.oct}</small>`;
  toast.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>toast.classList.remove('show'),700);
}
function showMsg(text){
  toast.textContent=text;
  toast.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>toast.classList.remove('show'),700);
}
function rebuild(showToast){ layout(); if(showToast) showKey(); }


const held=new Map(), tracks=new Map();
function press(m){const c=(held.get(m)||0)+1;held.set(m,c);if(c===1)for(const e of byMidi.get(m)||[])e.classList.add('on');}
function release(m){const c=(held.get(m)||0)-1;if(c<=0){held.delete(m);for(const e of byMidi.get(m)||[])e.classList.remove('on');if(st.dmp)damp(m);}else held.set(m,c);}
function clearAll(){if(st.dmp)for(const m of [...held.keys()])damp(m);tracks.clear();held.clear();if(trail.cv){trail.last.clear();trail.lit.clear();}for(const e of stage.querySelectorAll('.pad.on'))e.classList.remove('on');}
function hit(x,y){
  const el=document.elementFromPoint(x,y);
  if(!el) return null;
  if(el.dataset&&el.dataset.band) return {band:true};
  if(el.dataset&&el.dataset.m!==undefined) return {el,m:+el.dataset.m};
  return null;
}
function down(id,x,y){
  startAudio();
  const h=hit(x,y);
  if(h&&h.band)return;
  if(h){tracks.set(id,{el:h.el,m:h.m});press(h.m);play(h.m);}
  else tracks.set(id,{el:null,m:null});
  trailAdd(id,x,y);
}
function move(id,x,y){
  const t=tracks.get(id); if(!t) return;
  if(t.drag){dragOff(t,x,y);return;}
  trailAdd(id,x,y);
  const h=hit(x,y); const el=h&&!h.band?h.el:null;
  if(el===t.el) return;
  if(t.m!=null) release(t.m);
  if(el){t.el=el;t.m=h.m;press(h.m);play(h.m);} else {t.el=null;t.m=null;}
}
function up(id){const t=tracks.get(id);if(!t)return;
  if(!t.drag) trailEnd(id);
  if(t.drag&&!t.moved){const now=performance.now();if(now-lastBandTap<320){setOff(0);lastBandTap=0;}else lastBandTap=now;}  
 if(t.m!=null)release(t.m);tracks.delete(id);}
stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();stage.setPointerCapture(e.pointerId);down('p'+e.pointerId,e.clientX,e.clientY);});
window.addEventListener('pointermove',e=>move('p'+e.pointerId,e.clientX,e.clientY));
window.addEventListener('pointerup',e=>up('p'+e.pointerId));
window.addEventListener('pointercancel',e=>up('p'+e.pointerId));
stage.addEventListener('lostpointercapture',e=>up('p'+e.pointerId));
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
window.addEventListener('blur',clearAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAll();else if(keepAlive&&ctx)ctx.resume();});


let rz=0;
function onResize(){cancelAnimationFrame(rz);rz=requestAnimationFrame(layout);}
window.addEventListener('resize',onResize);
window.addEventListener('orientationchange',onResize);
if(window.visualViewport) visualViewport.addEventListener('resize',onResize);
layout();
})();
