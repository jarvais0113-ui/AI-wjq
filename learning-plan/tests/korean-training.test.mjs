import test from 'node:test';
import assert from 'node:assert/strict';
import * as training from '../dist/korean-training.mjs';
import {initialWorkspace,validateWorkspaceBackup} from '../dist/state.mjs';
const lesson={id:'02',quiz:[{id:'a',options:['가','는'],answer:1,explanation:'主题助词'},{id:'b',options:['입니다','아닙니다'],answer:0,explanation:'肯定判断'}]};

test('grades selected answers, blank answers and explains each mistake',()=>{
 assert.equal(typeof training.gradeLesson,'function');
 const result=training.gradeLesson(lesson,{a:0,b:0});
 assert.equal(result.score,50);assert.equal(result.items[0].correct,false);assert.equal(result.items[0].explanation,'主题助词');
 assert.equal(training.gradeLesson(lesson,{a:1}).score,50);
});
test('quiz creates next-day reviews and repeating same day preserves due date',()=>{
 const s={training:{attempts:{},reviews:{}}};
 training.recordAttempt(s,lesson,{a:0,b:0},new Date('2026-10-28T23:55:00+08:00'));
 assert.equal(s.training.reviews['2:a'].due,'2026-10-29');
 training.recordAttempt(s,lesson,{a:1,b:0},new Date('2026-10-29T00:05:00+08:00'));
 assert.equal(s.training.reviews['2:a'].due,'2026-10-29');
 assert.equal(training.dueReviews(s,'2026-10-29').length,2);
 training.answerReview(s,'2:a',true,'2026-10-29');
 assert.equal(s.training.reviews['2:a'].due,'2026-11-01');
 training.answerReview(s,'2:b',false,'2026-10-29');
 assert.equal(s.training.reviews['2:b'].due,'2026-10-30');
});
test('old Korean notes and progress are archived instead of completing unrelated video lessons',()=>{
 const old=initialWorkspace();old.tracks.korean={version:1,completed:[1,2],active:3,steps:{3:[0]},records:[{id:'old',lesson:2,text:'旧韩语感想',date:'2026-10-27T10:00:00Z'}],drafts:{3:'草稿'}};
 const v=validateWorkspaceBackup(old);
 assert.deepEqual(v.tracks.korean.completed,[]);assert.equal(v.tracks.korean.archive.records[0].text,'旧韩语感想');
 assert.deepEqual(v.tracks.ai.completed,[1]);
});
test('training and review survive backup, corrupt answers cannot replace workspace',()=>{
 const w=initialWorkspace();
 assert.equal(w.tracks.korean.courseId,'tomi-43-v1');
 training.recordAttempt(w.tracks.korean,lesson,{a:0,b:0},new Date('2026-10-28T12:00:00+08:00'));
 const saved=validateWorkspaceBackup(JSON.parse(JSON.stringify(w)));
 assert.equal(saved.tracks.korean.training.reviews['2:a'].due,'2026-10-29');
 w.tracks.korean.training.attempts[2].answers.a=999;
 assert.throws(()=>validateWorkspaceBackup(w),/备份/);
});
test('a new day refreshes daily views while protecting in-progress lesson forms',()=>{
 assert.equal(typeof training.shouldRefreshDaily,'function');
 assert.equal(training.shouldRefreshDaily('2026-10-28','2026-10-29','today'),true);
 assert.equal(training.shouldRefreshDaily('2026-10-28','2026-10-29','review'),true);
 assert.equal(training.shouldRefreshDaily('2026-10-28','2026-10-29','lesson'),false);
 assert.equal(training.shouldRefreshDaily('2026-10-29','2026-10-29','today'),false);
});
