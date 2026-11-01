const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function harness(saved,host='ai-org-labs.github.io'){
 const elements={}, scripts=[], handlers={}; const data=new Map(saved?[['kalimpad-analytics-consent',saved]]:[]);
 function el(){return {hidden:false,dataset:{},append(){},setAttribute(){},addEventListener(n,f){this[n]=f},focus(){}}}
 const document={title:'テスト',referrer:'https://x.com/a?secret=private',cookie:'',currentScript:{src:'https://ai-org-labs.github.io/kalimpad-site/analytics.js'},createElement:el,body:{append(e){elements.banner=e}},head:{append(e){scripts.push(e)}},getElementById(id){return elements[id]||(elements[id]=el())},addEventListener(n,f){handlers[n]=f}};
 const window={location:{hostname:host,origin:'https://'+host,pathname:'/kalimpad-site/notes/ui-and-core.html',search:'?email=private&utm_source=x&utm_campaign=note-01',reload(){}},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'analytics.js'),'utf8'),{window,document,URL,Date,console});
 return {window,elements,scripts,handlers,data};
}
test('同意前と拒否時は外部タグ・イベントを送らない',()=>{for(const v of [undefined,'denied']){const h=harness(v);assert.equal(h.scripts.length,0);assert.equal(h.window.dataLayer,undefined)}});
test('許可後のみタグを一度読み込み、個人情報を含むURLを除外する',()=>{const h=harness();h.elements['analytics-accept'].click();h.elements['analytics-accept'].click();assert.equal(h.scripts.length,1);const config=h.window.dataLayer.find(x=>x[0]==='config')[2];assert.ok(!config.page_location.includes('email'));assert.ok(config.page_location.includes('utm_source=x'));assert.equal(config.page_referrer,'https://x.com/');assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false)});
test('公開ホスト以外は計測しない',()=>{assert.equal(harness('granted','localhost').scripts.length,0)});
test('Storeクリックをページと配置付きで記録し、通常リンクは数えない',()=>{const h=harness('granted');const anchor={href:'https://apps.apple.com/app/id6818530043',dataset:{analyticsPlacement:'note_header'},closest:()=>null};h.handlers.click({target:{closest:()=>anchor}});const event=h.window.dataLayer.find(x=>x[0]==='event'&&x[1]==='app_store_click');assert.equal(event[2].placement,'note_header');assert.equal(event[2].page_type,'dev_note');assert.equal(event[2].link_url,anchor.href);const n=h.window.dataLayer.length;anchor.href='https://example.com';h.handlers.click({target:{closest:()=>anchor}});assert.equal(h.window.dataLayer.length,n)});
test('すべての紹介ページに同意UIと設定変更導線を備える',()=>{for(const file of ['index.html','gallery.html','dev-notes.html','notes/ui-and-core.html','site-privacy.html']){const html=fs.readFileSync(path.join(root,file),'utf8');assert.ok(html.includes('analytics.js'),file);assert.ok(html.includes('analytics-settings'),file)}});
