import {COURSE_ID,emptyTraining} from './korean-training.mjs';
import {weeks,AI_COURSE_ID} from './curriculum.mjs';
import {weeks as oldAIWeeks} from './curriculum-ai-legacy.mjs';
const stepCounts=Object.fromEntries(weeks.flatMap(w=>w.lessons.map(l=>[Number(l.id),l.action.split('；').filter(Boolean).length])));
const oldAICounts=Object.fromEntries(oldAIWeeks.flatMap(w=>w.lessons.map(l=>[Number(l.id),l.action.split('；').filter(Boolean).length])));
const oldAINames=Object.fromEntries(oldAIWeeks.flatMap(w=>w.lessons.map(l=>[Number(l.id),l.name])));
export function initialState(){return {version:1,courseId:AI_COURSE_ID,completed:[1],active:2,steps:{},records:[],drafts:{},routeArchive:null};}
export function nextLesson(state){
 if(state.active && !state.completed.includes(state.active)) return state.active;
 return Array.from({length:24},(_,i)=>i+1).find(id=>!state.completed.includes(id))??null;
}
export function validateBackup(value,counts=stepCounts,maxId=24){
 const validId=n=>Number.isInteger(n)&&n>=1&&n<=maxId;
 const invalid=()=>{throw new Error('备份格式不正确，原有学习数据未改变。');};
 if(!value||value.version!==1||!Array.isArray(value.completed)||!value.completed.every(validId)||!validId(value.active)||!Array.isArray(value.records)||value.records.length>10000)invalid();
 if(value.records.some(r=>!r||typeof r.id!=='string'||!validId(r.lesson)||typeof r.text!=='string'||!r.text.trim()||r.text.length>10000||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||(r.blocker!==undefined&&typeof r.blocker!=='string')||(r.legacyLessonName!==undefined&&(typeof r.legacyLessonName!=='string'||r.legacyLessonName.length>200))))invalid();
 if(new Set(value.records.map(r=>r.id)).size!==value.records.length)invalid();
 const steps=value.steps??{};
 if(typeof steps!=='object'||Array.isArray(steps)||steps===null||Object.entries(steps).some(([id,list])=>!validId(Number(id))||!Array.isArray(list)||new Set(list).size!==list.length||!list.every(n=>Number.isInteger(n)&&n>=0&&n<counts[Number(id)])))invalid();
 const drafts=value.drafts??{};
 if(typeof drafts!=='object'||drafts===null||Array.isArray(drafts)||Object.entries(drafts).some(([id,t])=>!validId(Number(id))||typeof t!=='string'||t.length>10000))invalid();
 return {version:1,completed:[...new Set(value.completed)],active:value.active,steps,records:value.records.map(r=>({...r})),drafts};
}

export function validateAIBackup(value){
 if(value?.courseId&&value.courseId!==AI_COURSE_ID)throw new Error('AI课程版本无法识别，原有学习数据未改变。');
 const current=value?.courseId===AI_COURSE_ID;
 const base=validateBackup(value,current?stepCounts:oldAICounts);
 if(current)return {...base,courseId:AI_COURSE_ID,routeArchive:value.routeArchive?validateBackup(value.routeArchive,oldAICounts):null};
 const hasChangedWork=base.completed.some(id=>id>=7)||Object.keys(base.steps).some(id=>Number(id)>=7)||Object.keys(base.drafts).some(id=>Number(id)>=7)||base.records.some(r=>r.lesson>=7);
 // Preserve the entire old route before clearing only the changed lesson checks.
 const routeArchive=hasChangedWork?JSON.parse(JSON.stringify(base)):null;
 return {...base,courseId:AI_COURSE_ID,routeArchive,
  completed:base.completed.filter(id=>id<=6),active:base.active<=6?base.active:7,
  steps:Object.fromEntries(Object.entries(base.steps).filter(([id])=>Number(id)<=6)),
  drafts:Object.fromEntries(Object.entries(base.drafts).filter(([id])=>Number(id)<=6)),
  records:base.records.map(r=>r.lesson>=7?{...r,legacyLessonName:oldAINames[r.lesson]}:r)};
}

export function initialWorkspace(){
 return {version:2,activeTrack:'ai',tracks:{ai:initialState(),korean:initialKorean()},school:{tasks:[],records:[]}};
}
export function validDueDate(value){
 if(value==='')return true;
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function validateWorkspaceBackup(value){
 if(value?.version===1){const w=initialWorkspace();w.tracks.ai=validateAIBackup(value);return w;}
 const bad=()=>{throw new Error('备份格式不正确，原有学习数据未改变。');};
 if(!value||value.version!==2||!['ai','korean','school'].includes(value.activeTrack)||!value.tracks||!value.school)bad();
 const ai=validateAIBackup(value.tracks.ai);
 const korean=validateKorean(value.tracks.korean);
 const school=value.school;
 const short=(s,n=10000)=>typeof s==='string'&&s.length<=n;
 const date=s=>typeof s==='string'&&Number.isFinite(Date.parse(s));
 if(!Array.isArray(school.tasks)||school.tasks.length>10000||!Array.isArray(school.records)||school.records.length>10000)bad();
 if(school.tasks.some(t=>!t||!short(t.id,200)||!t.id||!short(t.title,200)||!t.title.trim()||!short(t.course,200)||!validDueDate(t.due)||!['high','normal','low'].includes(t.priority)||typeof t.done!=='boolean'||!short(t.note)||!date(t.created)))bad();
 if(new Set(school.tasks.map(t=>t.id)).size!==school.tasks.length)bad();
 if(school.records.some(r=>!r||!short(r.id,200)||!r.id||!short(r.text)||!r.text.trim()||!date(r.date)||(r.blocker!==undefined&&!short(r.blocker))||(r.taskId!==undefined&&!short(r.taskId,200))))bad();
 if(new Set(school.records.map(r=>r.id)).size!==school.records.length)bad();
 return {version:2,activeTrack:value.activeTrack,tracks:{ai,korean},school:{tasks:school.tasks.map(t=>({...t})),records:school.records.map(r=>({...r}))}};
}

export function initialKorean(){return {...initialState(),completed:[],active:1,courseId:COURSE_ID,training:emptyTraining()};}
function validateKorean(value){
 const counts=Object.fromEntries(Array.from({length:24},(_,i)=>[i+1,3]));
 if(!value?.courseId){
  const old=validateBackup(value,counts);const next=initialKorean();
  if(old.completed.length||Object.keys(old.steps).length||old.records.length||Object.keys(old.drafts).length)next.archive=old;
  return next;
 }
 const bad=()=>{throw new Error('备份格式不正确，原有学习数据未改变。');};
 if(value.courseId!==COURSE_ID)bad();
 const base=validateBackup(value,counts,10),t=value.training;
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 if(!obj(t)||!obj(t.attempts)||!obj(t.reviews)||Object.keys(t.attempts).length>10||Object.keys(t.reviews).length>100)bad();
 const lesson=id=>Number.isInteger(Number(id))&&Number(id)>=1&&Number(id)<=10;
 const question=id=>typeof id==='string'&&/^[a-f]$/.test(id);
 for(const [id,a] of Object.entries(t.attempts)){
  if(!lesson(id)||!obj(a)||!obj(a.answers)||typeof a.submitted!=='boolean'||typeof a.updated!=='string'||!Number.isFinite(Date.parse(a.updated)))bad();
  if(Object.entries(a.answers).some(([q,n])=>!question(q)||!Number.isInteger(n)||n<0||n>3))bad();
 }
 for(const [key,r] of Object.entries(t.reviews)){
  if(!obj(r)||!lesson(r.lesson)||!question(r.question)||key!==`${r.lesson}:${r.question}`||typeof r.lastResult!=='boolean'||typeof r.due!=='string'||!r.due||!validDueDate(r.due)||(r.lastAnswered!==undefined&&(!r.lastAnswered||!validDueDate(r.lastAnswered))))bad();
 }
 return {...base,courseId:COURSE_ID,training:JSON.parse(JSON.stringify(t)),...(value.archive?{archive:validateBackup(value.archive,counts)}:{})};
}
