const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('初めての訪問者がダウンロード前に試奏し、アプリまたはトップへ進める',()=>{
 const home=fs.readFileSync('index.html','utf8');
 const trial=fs.readFileSync('try.html','utf8');
 assert.match(home,/<a[^>]+class="try-button"[^>]+href="try.html"[^>]*>ブラウザーで音を鳴らす/);
 assert.ok(home.indexOf('class="try-button"')<home.indexOf('class="download"'));
 assert.match(trial,/href="index.html"[^>]*>.*トップへ/);
 assert.match(trial,/インストール不要/);
 assert.match(trial,/https:\/\/apps.apple.com\/app\/id6818530043/);
 assert.match(trial,/id="analytics-settings"/);
});
