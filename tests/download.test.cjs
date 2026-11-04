const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('公開済みのApp Store導線とローカル画像を表示する',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.ok(!html.includes('公開準備中'));
 assert.equal((html.match(/href="https:\/\/apps.apple.com\/app\/id6818530043"/g)||[]).length,7);
 for(const image of ['app-store-badge-ja.svg','app-store-qr.png']){
  assert.ok(html.includes(`src="${image}"`));
  assert.ok(fs.statSync(path.join(root,image)).size>0);
 }
 assert.ok(html.includes('App Storeからダウンロード'));
});
test('QRの背景を白にし角丸を維持する',()=>{
 const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
 assert.ok(css.includes('background:#fff;border-radius:12px'));
});

test('初めての訪問者が広告一覧より先に商品種別と無料範囲と入手先を確認できる',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const gallery=html.indexOf('<section class="ad-carousel"');
 for(const value of ['iPhone・iPadの画面に触れて','11音色と演奏ガイドは無料','一部の機能は買い切りのPro','class="store-badge"']){
  assert.ok(html.indexOf(value)>=0 && html.indexOf(value)<gallery,value);
 }
});
