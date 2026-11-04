(function(){
 'use strict';
 const stage=document.getElementById('instrument'),container=document.getElementById('pads'),canvas=document.getElementById('trail'),g=canvas.getContext('2d'),status=document.getElementById('audio-status');
 const pads=[],buttons=[],active=new Map(),segments=[],flashes=new Map();let frame=0,ctx,master;
 const frequencies=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
 for(let col=0;col<3;col++){const count=col===1?5:4;for(let row=0;row<count;row++){const p={x:111+col*69,y:(col===1?37:72.75)+row*71.5,r:40};pads.push(p);const b=document.createElement('button');b.type='button';b.className='pad';b.style.left=p.x/3.6+'%';b.style.top=p.y/3.6+'%';b.setAttribute('aria-label','音を鳴らす '+pads.length);container.append(b);buttons.push(b);const n=pads.length-1;b.addEventListener('click',e=>{if(e.detail===0){unlock();strike(n);drawDot(p);}});}}
 // Oscillator-based pluck, deliberately identified as a simplified Web experience.
 function unlock(){try{if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.16;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=12;master.connect(limiter);limiter.connect(ctx.destination);}if(ctx.state!=='running')ctx.resume().catch(fail);}catch(e){fail();}}
 function fail(){status.textContent='音を開始できませんでした。もう一度触れるか、別のブラウザーでお試しください。';}
 function strike(n){const now=performance.now();flashes.set(n,now);buttons[n].classList.add('active');wake();if(!ctx)return;if(ctx.state!=='running'){ctx.resume().then(()=>{if(document.visibilityState==='visible')sound(n);}).catch(fail);}else sound(n);}
 function sound(n){const t=ctx.currentTime,f=frequencies[n];for(const [ratio,volume,decay] of [[1,.65,1.2],[2.76,.14,.35],[5.4,.025,.15]]){const o=ctx.createOscillator(),v=ctx.createGain();o.frequency.value=f*ratio;v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(volume,t+.006);v.gain.exponentialRampToValueAtTime(.0001,t+decay);o.connect(v);v.connect(master);o.start(t);o.stop(t+decay+.02);o.onended=()=>{o.disconnect();v.disconnect();};}status.textContent='指をすべらせて、自由にどうぞ。';}
 function point(e){const r=stage.getBoundingClientRect();return {x:(e.clientX-r.left)*360/r.width,y:(e.clientY-r.top)*360/r.height};}
 function drawDot(p){segments.push({a:p,b:{x:p.x+.1,y:p.y+.1},time:performance.now()});wake();}
 function move(e){const a=active.get(e.pointerId);if(!a)return;const p=point(e),res=PlayCore.crossings(a.p,p,pads,a.last);for(const n of res.hits)strike(n);segments.push({a:a.p,b:p,time:performance.now()});if(segments.length>600)segments.splice(0,segments.length-600);active.set(e.pointerId,{p,last:res.last});wake();}
 stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();unlock();stage.setPointerCapture(e.pointerId);const p=point(e),n=PlayCore.hit(p,pads);active.set(e.pointerId,{p,last:n});if(n>=0)strike(n);drawDot(p);});
 stage.addEventListener('pointermove',e=>{if(!active.has(e.pointerId))return;e.preventDefault();const samples=e.getCoalescedEvents?.();for(const p of samples?.length?samples:[e])move(p);});
 function release(e){active.delete(e.pointerId);}
 for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,release);
 function clear(){active.clear();segments.length=0;flashes.clear();buttons.forEach(b=>b.classList.remove('active'));if(frame)cancelAnimationFrame(frame);frame=0;g.clearRect(0,0,canvas.width,canvas.height);}
 window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();if(ctx)ctx.suspend();}});
 function resize(){const ratio=Math.min(window.devicePixelRatio||1,2),w=stage.clientWidth;canvas.width=canvas.height=Math.round(w*ratio);clear();}new ResizeObserver(resize).observe(stage);
 function wake(){if(!frame)frame=requestAnimationFrame(paint);}
 function paint(now){frame=0;g.setTransform(canvas.width/360,0,0,canvas.height/360,0,0);g.clearRect(0,0,360,360);while(segments.length&&now-segments[0].time>1300)segments.shift();g.lineCap='round';g.lineJoin='round';for(const s of segments){const alpha=Math.max(0,1-(now-s.time)/1300);g.globalAlpha=alpha;g.shadowColor='#71f3ff';g.shadowBlur=15;g.strokeStyle='#63dbea';g.lineWidth=7;g.beginPath();g.moveTo(s.a.x,s.a.y);g.lineTo(s.b.x,s.b.y);g.stroke();g.shadowBlur=0;g.strokeStyle='#e8ffff';g.lineWidth=2;g.stroke();}g.globalAlpha=1;g.shadowBlur=0;for(const [n,t] of flashes){if(now-t>260){buttons[n].classList.remove('active');flashes.delete(n);}}if(segments.length||flashes.size)wake();}
})();
