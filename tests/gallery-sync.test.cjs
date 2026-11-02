const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {latest,top}=require('../gallery-order.js');
test('公開画像の最新登録と静的フォールバックが一致する',()=>{
 const items=JSON.parse(fs.readFileSync('gallery.json','utf8'));
 assert.equal(new Set(items.map(x=>x.id)).size,items.length);
 assert.ok(items.some(x=>x.id==='kalimpad-three-notes'));
 assert.equal(top(items)[0].id,'kalimpad-two-hands');
 const home=fs.readFileSync('index.html','utf8'),grid=fs.readFileSync('gallery.html','utf8');
 assert.deepEqual([...home.matchAll(/class="ad-slide"[^>]*><img src="([^"]+)"/g)].map(m=>m[1]),top(items).map(x=>x.src));
 assert.deepEqual([...grid.matchAll(/<a href="([^"]+)" data-art/g)].map(m=>m[1]),latest(items).map(x=>x.src));
 assert.ok(grid.includes(items.length+' VISUALS'));
 for(const x of items){assert.ok(fs.existsSync(x.src));assert.ok(fs.existsSync(x.thumb));}
});
