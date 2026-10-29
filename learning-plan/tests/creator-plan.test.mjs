import test from 'node:test';
import assert from 'node:assert/strict';
import {weeks,AI_COURSE_ID} from '../dist/curriculum.mjs';
import {initialWorkspace,validateWorkspaceBackup,validateAIBackup} from '../dist/state.mjs';
import {creatorLessonExtras,creatorRoadmap,archivedAI} from '../dist/creator-ui.mjs';

test('old AI work is preserved without marking changed creative lessons complete',()=>{
 const old={version:1,completed:[1,2,7,10,15],active:15,steps:{2:[0],10:[0,1]},drafts:{2:'网页草稿',15:'旧数据草稿'},records:[{id:'old',lesson:15,text:'以前的学习感想',date:'2026-10-27T10:00:00.000Z'}]};
 const migrated=validateAIBackup(old);
 assert.deepEqual(migrated.completed,[1,2]);assert.equal(migrated.active,7);
 assert.deepEqual(migrated.steps,{2:[0]});assert.deepEqual(migrated.drafts,{2:'网页草稿'});
 assert.deepEqual(migrated.routeArchive,old);assert.equal(migrated.records[0].legacyLessonName,'把数据放进网页');
 const w=initialWorkspace();w.tracks.ai=migrated;const roundTrip=validateWorkspaceBackup(JSON.parse(JSON.stringify(w)));
 assert.deepEqual(roundTrip.tracks.ai,migrated);assert.equal(roundTrip.tracks.ai.courseId,AI_COURSE_ID);
});
test('new-route checks and drafts survive repeated backup and are not migrated twice',()=>{
 const w=initialWorkspace();Object.assign(w.tracks.ai,{completed:[1,7,16],active:17,steps:{17:[0,2]},drafts:{17:'字幕校对位置'}});
 assert.deepEqual(validateWorkspaceBackup(validateWorkspaceBackup(w)).tracks.ai,w.tracks.ai);
 assert.equal(w.tracks.ai.routeArchive,null);
});
test('corrupt archive cannot silently replace a valid workspace',()=>{
 const w=initialWorkspace();w.tracks.ai.routeArchive={version:1,completed:[90],active:1,records:[]};
 assert.throws(()=>validateWorkspaceBackup(w),/备份/);
});
test('creative sequence joins product, video, operation and portfolio with concrete checks',()=>{
 const lessons=weeks.flatMap(w=>w.lessons);assert.deepEqual(lessons.map(l=>l.id),Array.from({length:24},(_,i)=>String(i+1).padStart(2,'0')));
 const active=JSON.stringify(weeks.slice(2));assert.doesNotMatch(active,/金融|利润|年报|投资回报|成本计算器/);
 assert.match(weeks[2].title,/五位荣耀/);assert.match(weeks[5].title,/宣传视频/);assert.match(weeks[6].title,/小红书/);assert.match(weeks[7].title,/作品集/);
 for(const l of lessons){assert.ok(l.prompt&&l.check&&l.concept);assert.ok(l.action.split('；').length>=3);}
 assert.match(creatorLessonExtras(16),/文稿骨架/);assert.match(creatorLessonExtras(19),/7天/);assert.match(creatorRoadmap(initialWorkspace().tracks.ai),/10分钟/);
});
test('legacy draft HTML is escaped in the visible archive',()=>{
 const w=initialWorkspace();w.tracks.ai.routeArchive={completed:[7],steps:{7:[0]},drafts:{7:'<script>旧草稿</script>'}};
 const esc=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');
 const html=archivedAI(w.tracks.ai,esc);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);
});
