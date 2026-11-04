const {test}=require('node:test');const assert=require('node:assert/strict');const p=require('../play-core.js');
test('速いドラッグでも間にあるパッドを順番に拾う',()=>{const pads=[{x:20,y:0,r:9},{x:50,y:0,r:9},{x:80,y:0,r:9}];assert.deepEqual(p.crossings({x:0,y:0},{x:100,y:0},pads,-1).hits,[0,1,2]);});
test('同じパッド内の移動では連打せず、離れて戻れば鳴る',()=>{const pads=[{x:20,y:20,r:12}];assert.deepEqual(p.crossings({x:20,y:20},{x:22,y:22},pads,0).hits,[]);assert.equal(p.crossings({x:20,y:20},{x:50,y:20},pads,0).last,-1);assert.deepEqual(p.crossings({x:50,y:20},{x:20,y:20},pads,-1).hits,[0]);});
test('六角形の外側では音を鳴らさない',()=>{assert.equal(p.hit({x:9,y:9},[{x:0,y:0,r:10}]),-1);});
