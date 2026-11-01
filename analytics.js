/* Webサイト専用。許可前はGoogleタグを読み込まない。 */
(function(){
 'use strict';
 const w=window, id='G-WN4RQ94WHV', key='kalimpad-analytics-consent';
 const root=new URL('.',document.currentScript.src), loc=w.location;
 let choice=null,started=false;
 try{choice=w.localStorage.getItem(key)}catch(e){/* 保存不可でも選択は可能 */}
 const banner=document.createElement('section');
 banner.id='analytics-consent';banner.setAttribute('aria-label','アクセス解析の設定');
 banner.innerHTML='<p>サイト改善のため、Google Analyticsで閲覧とリンクの利用を計測してもよいですか？<a href="'+new URL('site-privacy.html',root).href+'">詳しく</a></p><div><button type="button" id="analytics-reject">許可しない</button><button type="button" id="analytics-accept">許可する</button></div>';
 banner.hidden=choice==='granted'||choice==='denied';document.body.append(banner);
 function cleanPage(){const u=new URL(loc.pathname,loc.origin),q=new URL('https://local.invalid/'+loc.search);for(const name of ['utm_source','utm_medium','utm_campaign','utm_content']){const value=q.searchParams.get(name);if(value&&/^[a-zA-Z0-9_-]{1,100}$/.test(value))u.searchParams.set(name,value)}return u.href}
 function referrer(){try{return new URL(document.referrer).origin+'/'}catch(e){return ''}}
 function pageType(){return loc.pathname.includes('/notes/')?'dev_note':loc.pathname.endsWith('/dev-notes.html')?'dev_notes_index':loc.pathname.endsWith('/gallery.html')?'gallery':loc.pathname.endsWith('/site-privacy.html')?'site_privacy':'home'}
 function gtag(){w.dataLayer.push(arguments)}
 function start(){
  if(started||loc.hostname!=='ai-org-labs.github.io'||!loc.pathname.startsWith('/kalimpad-site/'))return;
  started=true;w['ga-disable-'+id]=false;w.dataLayer=w.dataLayer||[];w.gtag=gtag;
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('consent','update',{analytics_storage:'granted'});
  gtag('js',new Date());
  gtag('config',id,{page_location:cleanPage(),page_referrer:referrer(),page_type:pageType(),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_path:'/kalimpad-site/',cookie_domain:'none',cookie_expires:15552000});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
 }
 function choose(value){choice=value;try{w.localStorage.setItem(key,value)}catch(e){}banner.hidden=true;if(value==='granted'){start()}else if(started){w['ga-disable-'+id]=true;for(const part of document.cookie.split(';')){const name=part.split('=')[0].trim();if(name==='_ga'||name==='_ga_WN4RQ94WHV')document.cookie=name+'=; Max-Age=0; Path=/kalimpad-site/; SameSite=Lax'}w.location.reload()}}
 document.getElementById('analytics-accept').addEventListener('click',()=>choose('granted'));
 document.getElementById('analytics-reject').addEventListener('click',()=>choose('denied'));
 document.getElementById('analytics-settings').addEventListener('click',()=>{banner.hidden=false;document.getElementById('analytics-reject').focus()});
 document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a||choice!=='granted'||!started)return;
  const url=new URL(a.href,loc.origin);if(url.hostname!=='apps.apple.com'||!url.pathname.endsWith('/id6818530043'))return;
  let placement=a.dataset.analyticsPlacement||'body';
  if(a.closest('.ad-carousel'))placement='home_carousel';else if(a.closest('#art-dialog'))placement='gallery_modal';
  const art=a.dataset.analyticsArt||a.closest('#art-dialog')?.dataset.analyticsArt||'none';
  gtag('event','app_store_click',{link_url:url.origin+url.pathname,page_type:pageType(),placement,creative_id:art});
 });
 if(choice==='granted')start();
})();
