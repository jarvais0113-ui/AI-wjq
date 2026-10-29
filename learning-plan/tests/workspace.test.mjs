import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,initialWorkspace,validateWorkspaceBackup,validDueDate} from '../dist/state.mjs';

test('migrates actual v1 AI progress and records without completing Korean lessons',()=>{
 const old=initialState();old.completed=[1,2,3];old.active=4;old.steps={4:[0]};
 old.records=[{id:'old-note',lesson:2,text:'以前的AI学习感想',date:'2026-10-27T10:00:00.000Z'}];
 const workspace=validateWorkspaceBackup(old);
 assert.deepEqual(workspace.tracks.ai.completed,[1,2,3]);
 assert.equal(workspace.tracks.ai.records[0].text,'以前的AI学习感想');
 assert.deepEqual(workspace.tracks.korean.completed,[]);
 assert.equal(workspace.tracks.korean.active,1);
});
test('tracks keep lesson01 notes, steps and completion independent',()=>{
 const w=initialWorkspace();w.tracks.korean.completed.push(1);w.tracks.korean.steps[1]=[0];
 w.tracks.korean.records.push({id:'ko-note',lesson:1,text:'한글 / 日本語の仮名とは違う',date:'2026-10-27T10:00:00.000Z'});
 const roundTrip=validateWorkspaceBackup(JSON.parse(JSON.stringify(w)));
 assert.deepEqual(roundTrip.tracks.ai.steps,{});assert.equal(roundTrip.tracks.ai.records.length,0);
 assert.equal(roundTrip.tracks.korean.records[0].text,'한글 / 日本語の仮名とは違う');
});
test('school deadlines reject impossible dates and preserve actual entered tasks',()=>{
 assert.equal(validDueDate('2026-02-30'),false);assert.equal(validDueDate('2028-02-29'),true);assert.equal(validDueDate(''),true);
 const w=initialWorkspace();w.school.tasks=[{id:'task1',title:'课程报告',course:'MEC',due:'2026-11-01',priority:'high',done:false,note:'自己填写的要求',created:'2026-10-27T10:00:00.000Z'}];
 assert.equal(validateWorkspaceBackup(w).school.tasks[0].title,'课程报告');
 assert.throws(()=>validateWorkspaceBackup({...w,school:{tasks:[{...w.school.tasks[0],due:'tomorrow'}],records:[]}}),/备份/);
});
test('unknown tracks and corrupt Korean progress cannot replace a valid workspace',()=>{
 const w=initialWorkspace();assert.throws(()=>validateWorkspaceBackup({...w,activeTrack:'unknown'}),/备份/);
 w.tracks.korean.steps={1:[0,0,0]};assert.throws(()=>validateWorkspaceBackup(w),/备份/);
});
test('duplicate journal IDs cannot edit or delete multiple imported records',()=>{
 const w=initialWorkspace();
 w.school.records=[{id:'same',text:'第一篇',date:'2026-10-27T10:00:00.000Z'},{id:'same',text:'另一篇',date:'2026-10-27T11:00:00.000Z'}];
 assert.throws(()=>validateWorkspaceBackup(w),/备份/);
 const v=initialWorkspace();v.tracks.korean.records=[{id:'same',lesson:1,text:'첫째',date:'2026-10-27T10:00:00.000Z'},{id:'same',lesson:2,text:'둘째',date:'2026-10-27T11:00:00.000Z'}];
 assert.throws(()=>validateWorkspaceBackup(v),/备份/);
});
