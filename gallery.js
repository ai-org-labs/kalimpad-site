'use strict';
const carousel=document.querySelector('.ad-carousel');
if(carousel){
 const slides=[...carousel.querySelectorAll('.ad-slide')],pause=carousel.querySelector('[data-pause]'),counter=carousel.querySelector('[data-counter]'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,stopped=motion.matches,hover=false,focus=false;
 function show(n){current=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==current);counter.textContent=`${current+1} / ${slides.length}`;}
 function label(){pause.textContent=stopped?'自動切替を再開':'自動切替を停止';}
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
