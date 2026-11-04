const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('try.js','utf8');
test('演奏面は高さに依存せず4列を横幅へ収め、両側に余白を残す',()=>{
 const fn=js.match(/function padWidth\(W\)\{[^}]+\}/);
 assert.ok(fn,'横幅から決まるパッド寸法');
 const width=vm.runInNewContext('const HR=Math.sqrt(3)/2,GAP=HR*.5,AUTO_SIDE_MIN=.03;'+fn[0]+';padWidth');
 for(const W of [296,366,810,1400]){
  const w=width(W),dx=w*(Math.sqrt(3)/2*1.5)*(Math.sqrt(3)/2),total=3*dx+w;
  assert.ok(total>=W*.93 && total<=W*.95);
 }
});
test('英字ラベルが有効で、外側の半音も区別する',()=>{
 assert.match(js,/rot:false,lab:1/);
 assert.match(js,/SHARP_N=\['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'\]/);
});
