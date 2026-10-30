const {test}=require('node:test'),a=require('node:assert/strict');
const {latest,top}=require('../gallery-order.js');
test('日付と同日登録順で新しい順、除外はトップのみ',()=>{const d=[{id:'a',date:'2026-10-29',order:1},{id:'b',date:'2026-10-30',order:2,top:false},{id:'c',date:'2026-10-30',order:3}];a.deepEqual(latest(d).map(x=>x.id),['c','b','a']);a.deepEqual(top(d).map(x=>x.id),['c','a']);a.equal(d[0].id,'a');});
test('新規登録が自動的に先頭へ入りトップは5枚',()=>{const d=Array.from({length:7},(_,i)=>({id:String(i),date:'2026-10-30',order:i}));a.deepEqual(top(d).map(x=>x.id),['6','5','4','3','2']);});
