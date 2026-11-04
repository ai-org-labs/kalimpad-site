(function(root){
 'use strict';
 function hit(p,pads){return pads.findIndex(q=>{const x=Math.abs(p.x-q.x),y=Math.abs(p.y-q.y);return x<=q.r&&y<=Math.sqrt(3)*q.r/2&&Math.sqrt(3)*x+y<=Math.sqrt(3)*q.r;});}
 function crossings(a,b,pads,last){const hits=[],steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));for(let i=0;i<=steps;i++){const n=hit({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},pads);if(n!==last){if(n>=0)hits.push(n);last=n;}}return {hits,last};}
 const api={hit,crossings};if(typeof module!=='undefined')module.exports=api;else root.PlayCore=api;
})(typeof window!=='undefined'?window:this);
