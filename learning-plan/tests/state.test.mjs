import test from 'node:test';
import assert from 'node:assert/strict';
import { nextLesson, validateBackup, initialState } from '../dist/state.mjs';

test('continue the explicitly started unfinished lesson',()=>{
 assert.equal(nextLesson({...initialState(),active:5}),5);
});
test('completion advances and all-complete has no next lesson',()=>{
 assert.equal(nextLesson({...initialState(),completed:[1,2],active:2}),3);
 assert.equal(nextLesson({...initialState(),completed:Array.from({length:24},(_,i)=>i+1),active:24}),null);
});
test('invalid backup cannot overwrite records and Unicode survives a round trip',()=>{
 assert.throws(()=>validateBackup({version:1,completed:[99],records:[]}),/备份/);
 assert.throws(()=>validateBackup({version:1,completed:[1],active:2,records:[{id:'x',lesson:2,text:'',date:'bad'}],steps:{}}),/备份/);
 const good=initialState();good.records=[{id:'a',lesson:2,text:'能保存中文 <hello>',blocker:'继续检查',date:'2026-10-27T10:00:00.000Z'}];
 assert.equal(validateBackup(JSON.parse(JSON.stringify(good))).records[0].text,'能保存中文 <hello>');
});
test('backup step indices cannot fake all checked steps',()=>{
 assert.throws(()=>validateBackup({...initialState(),steps:{2:[0,0,0]}}),/备份/);
 assert.throws(()=>validateBackup({...initialState(),steps:{2:[27,28,29]}}),/备份/);
 assert.deepEqual(validateBackup({...initialState(),steps:{2:[0,1,2]}}).steps[2],[0,1,2]);
});
