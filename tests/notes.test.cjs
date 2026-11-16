const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('トップから開発ノートと実例へ辿れる',()=>{
 assert.match(read('index.html'),/href="dev-notes.html"/);
 assert.match(read('dev-notes.html'),/href="notes/);
});
test('ノート一覧と記事に常設のストア導線と戻り先がある',()=>{
 for(const file of ['dev-notes.html','notes/ui-and-core.html']){
  const html=read(file);
  assert.match(html,/<header class="notes-header">/);
  assert.match(html,/href="https:\/\/apps.apple.com\/app\/id6818530043"/);
  assert.match(html,/href="(?:\.\.\/)?index.html"/);
  assert.match(html,/<html lang="ja">/);
 }
 assert.match(read('notes.css'),/position:\s*sticky/);
});
test('実図の抜粋と範囲が明示され、公開素材に内部経路を含まない',()=>{
 const html=read('notes/ui-and-core.html');
 assert.match(html,/実際のArchMap/);
 assert.match(html,/抜粋/);
 const mmd=read('notes/assets/ui-core-excerpt.mmd');
 assert.match(mmd,/surface -->\|TouchInput\| core/);
 assert.match(mmd,/layout -->\|PlaySurface Props\| surface/);
 for(const file of ['notes/assets/ui-core-excerpt.mmd','notes/assets/ui-core-excerpt.svg','notes/ui-and-core.html']){
  assert.doesNotMatch(read(file).replace('<script defer src="../analytics.js"></script>',''),/\/Users\/|com\.aiorglabs|ProbeSurface|遅延テスト|hardware\/|<script/i);
 }
});

test('和音開発記事を一覧先頭に置き、公開範囲と同意導線を維持する',()=>{
 const list=read('dev-notes.html'); assert.equal([...list.matchAll(/class="article-card" href="([^"]+)"/g)][0][1],'notes/plucked-chords.html');
 const article=read('notes/plucked-chords.html');
 for(const text of ['Codex','0.8秒','概念図','数値で比較','analytics-settings','../analytics.js','note_header']) assert.ok(article.includes(text));
 assert.ok(fs.existsSync(path.join(__dirname,'../notes/assets/plucked-chords-cover.png')));
 assert.doesNotMatch(article,/\/Users\/|advertising.sqlite3|HANDOFF.md/);
});
