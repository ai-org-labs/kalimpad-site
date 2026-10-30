(function(root){
 const latest=items=>[...items].sort((a,b)=>b.date.localeCompare(a.date)||(b.order||0)-(a.order||0));
 const top=items=>latest(items).filter(x=>x.top!==false).slice(0,5);
 if(typeof module!=='undefined')module.exports={latest,top};else root.GalleryOrder={latest,top};
})(typeof window!=='undefined'?window:this);
