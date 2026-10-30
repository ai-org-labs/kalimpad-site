'use strict';
async function refreshGallery(){
 try{
  const response=await fetch('gallery.json',{cache:'no-cache'});if(!response.ok)throw new Error('画像台帳の取得に失敗');
  const items=await response.json(), ordered=GalleryOrder.latest(items), selected=GalleryOrder.top(items);
  function picture(x,thumbnail){const img=document.createElement('img');img.src=thumbnail?x.thumb:x.src;img.alt=x.alt;img.width=thumbnail?480:1400;img.height=thumbnail?600:1400;if(thumbnail)img.loading='lazy';return img;}
  const stage=document.querySelector('.ad-stage');
  if(stage&&selected.length){stage.replaceChildren(...selected.map(x=>{const a=document.createElement('a');a.className='ad-slide';a.href='https://apps.apple.com/app/id6818530043';a.setAttribute('aria-label',x.title+' — App Storeへ');a.append(picture(x,false));return a;}));}
  const grid=document.querySelector('.art-grid');
  if(grid){grid.replaceChildren(...ordered.map(x=>{const article=document.createElement('article');article.className='art-card';const a=document.createElement('a');a.href=x.src;a.dataset.art='';a.dataset.title=x.title;a.append(picture(x,true));const div=document.createElement('div'),small=document.createElement('small'),h=document.createElement('h2');small.textContent=x.genre;h.textContent=x.title;div.append(small,h);article.append(a,div);return article;}));document.querySelector('.count').textContent=ordered.length+' VISUALS';}
 }catch(error){console.warn('保存済みの画像一覧を表示します。',error);}
}
(async()=>{await refreshGallery();
const carousel=document.querySelector('.ad-carousel');
if(carousel){
 const slides=[...carousel.querySelectorAll('.ad-slide')],pause=carousel.querySelector('[data-pause]'),counter=carousel.querySelector('[data-counter]'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,stopped=false,hover=false,focus=false;
 const stage=carousel.querySelector('.ad-stage'), dots=document.createElement('div');
 dots.className='ad-dots';dots.setAttribute('aria-label','表示する画像を選択');stage.after(dots);
 slides.forEach((slide,i)=>{slide.hidden=false;slide.querySelector('img').draggable=false;const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${i+1}枚目を表示`);b.addEventListener('click',()=>{stopped=true;show(i);label()});dots.append(b)});
 function sync(){slides.forEach((s,i)=>s.tabIndex=i===current?0:-1);[...dots.children].forEach((b,i)=>b.setAttribute('aria-current',String(i===current)));counter.textContent=`${current+1} / ${slides.length}`;}
 function show(n){current=(n+slides.length)%slides.length;stage.scrollTo({left:stage.clientWidth*current,behavior:motion.matches?'instant':'smooth'});sync();}
 let scrollTimer;stage.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{current=Math.round(stage.scrollLeft/stage.clientWidth);sync()},120)});
 stage.addEventListener('pointerdown',()=>{stopped=true;label()});
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stopped=true;show(current+(e.key==='ArrowRight'?1:-1));label()}});
 new ResizeObserver(()=>stage.scrollTo({left:current*stage.clientWidth,behavior:'instant'})).observe(stage);sync();
 function label(){pause.textContent=stopped?'▶':'Ⅱ';pause.setAttribute('aria-label',stopped?'自動切替を再開':'自動切替を停止');pause.title=stopped?'自動切替を再開':'自動切替を停止';}
 pause.addEventListener('click',()=>{stopped=!stopped;label()});
 carousel.querySelector('[data-prev]').addEventListener('click',()=>{stopped=true;show(current-1);label()});
 carousel.querySelector('[data-next]').addEventListener('click',()=>{stopped=true;show(current+1);label()});
 carousel.addEventListener('pointerenter',()=>hover=true);carousel.addEventListener('pointerleave',()=>hover=false);
 carousel.addEventListener('focusin',()=>focus=true);carousel.addEventListener('focusout',e=>focus=carousel.contains(e.relatedTarget));
 let invisible=document.hidden;document.addEventListener('visibilitychange',()=>invisible=document.hidden);
 motion.addEventListener('change',e=>{if(e.matches){stopped=true;label()}});
 setInterval(()=>{if(!stopped&&!hover&&!focus&&!invisible)show(current+1)},6000);label();
}
const dialog=document.querySelector('#art-dialog');
if(dialog){let opener;document.querySelectorAll('[data-art]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();opener=a;dialog.querySelector('img').src=a.href;dialog.querySelector('img').alt=a.querySelector('img').alt;dialog.querySelector('p').textContent=a.dataset.title;dialog.showModal()}));dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}})}

})();
