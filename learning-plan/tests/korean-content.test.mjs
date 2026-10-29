import test from 'node:test';
import assert from 'node:assert/strict';
import {weeks} from '../dist/curriculum-korean.mjs';
import {koreanHome,koreanRoute,koreanReview,archivedKorean} from '../dist/korean-ui.mjs';
import {initialWorkspace,validateWorkspaceBackup} from '../dist/state.mjs';
import {gradeLesson,nextKoreanLesson,recordAttempt,localDay,addDays,dueReviews} from '../dist/korean-training.mjs';
const lessons=weeks.flatMap(w=>w.lessons);
test('first ten official lessons have usable sources, six explained questions and Chinese/Japanese notes',()=>{
 assert.deepEqual(lessons.map(l=>Number(l.id)),[1,2,3,4,5,6,7,8,9,10]);
 const sources=new Set(),videos=new Set();
 for(const l of lessons){assert.match(l.sourceUrl,/^https:\/\/trilingual.jp\/bigginer\/\d{8}-\d+\/$/);assert.match(l.videoUrl,/^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$/);sources.add(l.sourceUrl);videos.add(l.videoUrl);assert.equal(l.quiz.length,6);assert.equal(l.summary.length,3);assert.ok(l.teaching.length>=3);assert.ok(l.examples.every(e=>e.ko&&e.ja&&e.zh));assert.equal(new Set(l.quiz.map(q=>q.id)).size,6);
 for(const q of l.quiz){assert.equal(q.options.length,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.explanation.trim().length>0);}
 const correct=Object.fromEntries(l.quiz.map(q=>[q.id,q.answer]));assert.equal(gradeLesson(l,correct).score,100);
 }
 assert.equal(sources.size,10);assert.equal(videos.size,10);assert.equal(lessons[0].prepVideos.length,3);
});
test('finishing all available lessons does not recommend an unavailable lesson',()=>{
 const s=initialWorkspace().tracks.korean;s.completed=lessons.map(l=>Number(l.id));s.active=10;
 assert.equal(nextKoreanLesson(s),null);const html=koreanHome(s,String);assert.match(html,/第 11–43 课的本站配套训练待制作/);assert.doesNotMatch(html,/data-id="11"/);
 const route=koreanRoute(s);assert.equal((route.match(/aria-disabled="true"/g)??[]).length,33);
});
test('wrong reviews appear first and tomorrow-review UI explains an actual scheduled question',()=>{
 const s=initialWorkspace().tracks.korean,l=lessons[0],answers=Object.fromEntries(l.quiz.map(q=>[q.id,q.answer]));answers.c=0;
 const yesterday=addDays(localDay(),-1);recordAttempt(s,l,answers,new Date(yesterday+'T12:00:00'));
 assert.equal(dueReviews(s)[0].question,'c');assert.match(koreanReview(s),/한 的收音是哪个字母/);
 assert.match(koreanHome(s,String),/有 6 道题到期/);
});
test('new course backup preserves AI and school as well as escaped archived notes',()=>{
 const w=initialWorkspace();w.tracks.korean.archive={version:1,completed:[2],active:3,steps:{3:[0]},drafts:{3:'上次草稿'},records:[{id:'x',lesson:2,text:'<script>unsafe</script>',date:'2026-10-27T12:00:00Z'}]};
 w.school.tasks=[{id:'s',title:'我的作业',course:'MEC',due:'2026-10-30',priority:'normal',done:false,note:'真实要求',created:'2026-10-28T00:00:00Z'}];
 const v=validateWorkspaceBackup(JSON.parse(JSON.stringify(w)));assert.deepEqual(v.tracks.ai,w.tracks.ai);assert.deepEqual(v.school,w.school);assert.match(archivedKorean(v.tracks.korean),/&lt;script&gt;/);assert.doesNotMatch(archivedKorean(v.tracks.korean),/<script>/);
});
