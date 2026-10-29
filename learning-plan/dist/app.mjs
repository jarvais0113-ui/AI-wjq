import {creatorRoadmap,creatorLessonExtras,archivedAI,creatorResources} from './creator-ui.mjs';
import {weeks as aiWeeks} from './curriculum.mjs';
import {weeks as koreanWeeks} from './curriculum-korean.mjs';
import {initialWorkspace,validateWorkspaceBackup,validDueDate} from './state.mjs';
import {schoolHome,schoolRoute,schoolForm,schoolJournal} from './school.mjs';
import {nextLesson as nextAI} from './state.mjs';
import {gradeLesson,recordAttempt,nextKoreanLesson,answerReview,localDay,shouldRefreshDaily} from './korean-training.mjs';
import {koreanHome,koreanRoute,koreanLesson,koreanReview,archivedKorean} from './korean-ui.mjs';
function nextLesson(s){return track==='korean'?nextKoreanLesson(s):nextAI(s);}
let onlyWrong=false,reviewFeedback=null;

const KEY='qibu-learning-v1';
let track='ai',weeks=aiWeeks,lessons=[];
const subjects={ai:{title:'AI 创作与产品实践',description:'游戏、趣味测试、视频和作品集。',duration:'30–45 分钟 · 可拆分'},korean:{title:'日本語から韓国語へ',description:'跟随 Tomi 视频：43课路线，前10课配套训练。',duration:'20–30 分钟'},school:{title:'我的大学校内任务',description:'课程作业、复习和项目，分别记录。'}};
const getLesson=id=>lessons.find(x=>Number(x.id)===Number(id));
const main=document.querySelector('#main');
const dialog=document.querySelector('#utility-dialog');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let workspace=initialWorkspace(),state=workspace.tracks.ai,view='today',selected=2,editId=null,toastTimer;
let storageAvailable=true;
try{const raw=localStorage.getItem(KEY);if(raw)workspace=validateWorkspaceBackup(JSON.parse(raw));}catch{storageWarning('无法读取原有学习记录。请先导出已有备份；本次操作仅保留在当前页面。');}
function bindTrack(){track=workspace.activeTrack;weeks=track==='korean'?koreanWeeks:aiWeeks;state=workspace.tracks[track==='korean'?'korean':'ai'];lessons=weeks.flatMap(w=>w.lessons.map(l=>({...l,week:w.n,weekTitle:w.title,product:w.product,steps:l.action.split('；').map(x=>x.replace(/[。；]$/,'')).filter(Boolean)})));selected=nextLesson(state)??state.active;}
bindTrack();
function storageWarning(message){storageAvailable=false;document.querySelector('#storage-label').textContent='当前无法保存，请导出备份';const el=document.querySelector('#storage-warning');el.hidden=false;el.textContent=message;}
function persist(){if(!storageAvailable)return false;try{localStorage.setItem(KEY,JSON.stringify(workspace));return true;}catch{storageWarning('浏览器无法保存数据。请保持页面打开，并通过“数据与备份”导出记录。');return false;}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
const dateText=iso=>new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
document.querySelector('#today-date').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());

function updateShell(){
 const count=track==='school'?workspace.school.tasks.filter(t=>t.done).length:state.completed.length;
 const total=track==='school'?workspace.school.tasks.length:track==='korean'?10:24;
 document.querySelector('#side-progress').style.width=`${total?count/total*100:0}%`;
 document.querySelector('#side-count').textContent=track==='school'?`${count} / ${total} 项任务已完成`:`${count} / ${total} 课已完成${track==='korean'?' · 共43课':''}`;
 document.querySelector('#subject-title').textContent=subjects[track].title;
 document.querySelector('#subject-description').textContent=subjects[track].description;
 document.querySelector('#route-nav-label').textContent=track==='school'?'全部任务':'学习路线';
 document.querySelector('.nav-count').textContent=track==='korean'?43:total;
 document.querySelectorAll('[data-track]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.track===track)));
 document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===view||(['lesson','review'].includes(view)&&a.dataset.nav==='today');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelector('#breadcrumb').textContent=({today:track==='school'?'今日任务':track==='korean'?'今日韩语':'今日 AI 学习',route:track==='school'?'全部校内任务':'学习路线',records:'学习感想',lesson:'正在学习',review:'韩语每日复习'})[view];
}

function navigate(name){view=name;history.replaceState(null,'',name==='lesson'?`#lesson-${selected}`:`#${name}`);render();window.scrollTo({top:0,behavior:'instant'});}
function render(){updateShell();if(track==='korean'&&view==='review'){main.innerHTML=koreanReview(state,reviewFeedback);return;}if(view==='route')renderRoute();else if(view==='records')renderRecords();else if(view==='lesson')renderLesson();else renderToday();}
function art(){return '<svg class="task-art" viewBox="0 0 180 190" aria-hidden="true"><path d="M6 185V138H50V93H95V48H139V5M27 185V158H72V113H117V68H161V24M0 119H30V73H74V28H119V0"/><circle cx="96" cy="47" r="6"/><circle cx="139" cy="5" r="4"/></svg>';}
function renderToday(){
 if(track==='korean'){main.innerHTML=koreanHome(state,dateText);return;}
 if(track==='school'){main.innerHTML=schoolHome(workspace.school,esc,dateText);return;}
 const id=nextLesson(state),l=getLesson(id),count=state.completed.length;
 const percentage=Math.round(count/24*100),recent=state.records.slice(0,3);
 main.innerHTML=`<section class="intro home-intro"><div><h1>${track==='korean'?'Jarvais，今天学一点韩语。':'今日学习'}</h1><p>${track==='korean'?'用日语理解结构，用韩语原声练发音。每课20–30分钟，另用5分钟复习。':'先完成当前任务，再为下次留一句话。'}</p></div><span class="motto">Never give up</span></section>
 <section class="plan-overview" aria-labelledby="plan-title"><div class="plan-top"><h2 id="plan-title">${track==='korean'?'韩语学习计划进度':'学习进度'}</h2><a href="#route">查看完整学习计划 ↗</a></div><div class="plan-summary"><div class="plan-count">${count}<small>/ 24 课已完成</small></div><div class="plan-meter"><div class="progress-track" role="progressbar" aria-label="课程完成进度" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"><i style="width:${percentage}%"></i></div><div class="plan-caption"><span>${l?`当前：第 ${l.id} 课 · ${esc(l.name)}`:'24课基础路线已完成'}</span><span>${percentage}% 完成</span></div></div><div class="plan-stage"><strong>${l?`第 ${l.week} / 8 阶段`:'8 / 8 阶段'}</strong><span>${l?esc(l.weekTitle.split('：')[0]):'继续完善自己的作品'}</span></div></div></section>
 <div class="home-content"><section><h2 class="home-section-title">当前课程<span>${l?'先完成这一个任务':'回顾与继续'}</span></h2><div class="task-card home-task"><div class="task-top"><span class="pill">${l?`第 ${l.id} 课 · ${esc(l.weekTitle.split('：')[0])}`:'学习路线已完成'}</span><span class="task-meta">${l?subjects[track].duration:'按自己的节奏继续'}</span></div><h2>${l?esc(l.name):'回看你走过的每一步。'}</h2><p class="description">${l?'本课目标：'+esc(l.check):'从过去的学习感想里，挑一个最想继续探索的问题。'}</p><div class="first-action"><small>${l?'第一步就做这个':'接下来可以做'}</small><p>${l?esc(l.steps[0]):'查看学习感想，整理自己的收获和下一步。'}</p></div><div class="task-foot"><button class="primary" data-action="${l?'start':'records'}" ${l?`data-id="${id}"`:''}>${l?(state.steps[id]?.length?'继续今日学习':'开始今日学习'):'查看学习感想'} <span>↗</span></button><small>${l?`${(state.steps[id]??[]).length} / ${l.steps.length} 个步骤已完成`:'每一步，都算数'}</small></div>${art()}</div></section>
 <section class="home-notes"><h2 class="home-section-title">过去的学习感想<span>随时回来翻看</span></h2><div class="notes-box"><div class="notes-summary"><span>${state.records.length} 篇学习感想</span><a href="#records">查看全部 ↗</a></div>${recent.length?recent.map(r=>`<button class="home-note" data-action="open-note" data-id="${esc(r.id)}"><time>${esc(dateText(r.date))}</time><h3>第 ${String(r.lesson).padStart(2,'0')} 课 · ${esc(r.legacyLessonName?"旧路线 · "+r.legacyLessonName:getLesson(r.lesson).name)}</h3><p>${esc(r.text.slice(0,90))}${r.text.length>90?'…':''}</p></button>`).join(''):'<div class="home-notes-empty"><span class="empty-symbol">✎</span><h3>从第一篇感想开始</h3><p>记下今天理解了什么、卡在哪里。下次回来，就能接着往前走。</p></div>'}<button class="secondary" data-action="records">写学习感想 ↗</button></div></section></div>
 ${creatorRoadmap(state)}<div class="home-guide"><strong>使用顺序：</strong>先看学习进度 → 进入今日学习 → 完成后写感想。过去的笔记会一直留在“学习感想”里，记录保存在当前浏览器。</div>`;
}
function renderRoute(){
 if(track==='korean'){main.innerHTML=koreanRoute(state);return;}
 if(track==='school'){main.innerHTML=schoolRoute(workspace.school,esc);return;}
 const current=nextLesson(state);
 main.innerHTML=`<div class="page-intro"><span class="eyebrow">JARVAIS WANG · LEARNING PATH</span><h1>${track==='korean'?'日本語を足場に、韓国語を一歩ずつ。':'AI 学习路线'}</h1><p>${track==='korean'?'8周24课：韩文拼读 → 基本句型 → 日常表达。每周3课，其他日子复习5分钟；未通过检查就顺延。先建立拼读与基本表达，再按自测调整速度。':'共24课。每课有操作步骤、可复制指令和完成标准，按自己的进度继续。'}</p></div>${creatorRoadmap(state)}${weeks.map(w=>`<section class="week-card"><div class="week-head"><span class="week-no">${String(w.n).padStart(2,'0')}</span><div><h2>${esc(w.title)}</h2><p>${esc(w.product)}</p></div><span class="week-progress">${w.lessons.filter(l=>state.completed.includes(Number(l.id))).length} / 3</span></div>${w.lessons.map(l=>{const id=Number(l.id),done=state.completed.includes(id);return `<button class="lesson-row ${done?'completed':''} ${id===current?'current':''}" data-action="lesson" data-id="${id}"><span class="lesson-status">${done?'✓':l.id}</span><span><span class="row-title">${esc(l.name)}</span><small>${esc(l.concept)}</small></span>${id===current?'<span class="lesson-tag">当前任务</span>':''}<span class="arrow">↗</span></button>`;}).join('')}</section>`).join('')}`;
}
function openLesson(id,begin=false){onlyWrong=false;selected=Number(id);if(begin){state.active=selected;persist();}navigate('lesson');}
function renderLesson(){
 const l=getLesson(selected);if(!l){navigate('today');return;}
 if(track==='korean'){main.innerHTML=koreanLesson(l,state,onlyWrong);return;}
 const done=state.completed.includes(selected),checks=state.steps[selected]??[];
 main.innerHTML=`<button class="back-button" data-action="today">← 返回今日任务</button><div class="lesson-intro"><div><span class="eyebrow">第 ${l.week} 阶段 · ${esc(l.weekTitle.split('：')[0])}</span><h1>第 ${l.id} 课 · ${esc(l.name)}</h1><p>本阶段逐步完成：${esc(l.product)}</p></div><span class="pill" style="color:var(--green);border-color:var(--line)">◷ ${subjects[track].duration}</span></div>${done?'<div class="completion-banner">✓ 这一课已经完成。你仍可以回看步骤和示例指令。</div>':''}<div class="lesson-layout"><div><section class="lesson-panel"><h2>先懂一点，再动手</h2><div class="concept">${esc(l.concept)}</div>${koreanTeaching(l)}${track==='ai'?creatorLessonExtras(selected):''}<h2>照着这几步开始</h2><p class="step-tip">做完一项，再勾选一项。进度会保留在当前浏览器。</p>${l.steps.map((s,i)=>`<label class="step-check ${checks.includes(i)?'done':''}"><input type="checkbox" data-step="${i}" ${checks.includes(i)?'checked':''}><span>${esc(s)}</span></label>`).join('')}</section><section class="lesson-panel"><h2>不知道怎么问？从这段话开始</h2><div class="prompt-box">${esc(l.prompt)}</div><button class="text-button" data-action="copy" data-id="${selected}">复制示例指令 <span>↗</span></button><p class="step-tip" style="margin-top:12px">复制后发到 Codex 聊天中继续。本网页提供学习指引，暂未内置 AI 对话。</p></section></div><aside class="lesson-aside"><section class="lesson-panel"><h3>怎样算完成？</h3><p class="acceptance">${esc(l.check)}</p><button class="primary" data-action="complete" ${done||checks.length!==l.steps.length?'disabled':''}>${done?'这一课已完成':'我检查过了，完成本课'} <span>✓</span></button><p class="step-tip" style="margin-top:10px">${done?'完成状态已记录。':'先完成左侧操作，再按上面的标准检查结果。'}</p></section><section class="lesson-panel"><h3>给下次留一句话</h3><p style="margin-bottom:14px">卡在哪里，或者理解了什么？不用写得很完整。</p><div class="field"><label for="lesson-note" class="small">本课复盘 / 下次继续位置</label><textarea id="lesson-note" maxlength="10000" placeholder="例如：已经打开网页，下次检查窄窗口布局。">${esc(state.drafts[selected]??'')}</textarea></div><button class="secondary" data-action="save-lesson-note">保存为学习感想</button><p class="step-tip" id="draft-status" style="margin-top:10px">${state.drafts[selected]?'草稿已保留。':'输入内容会自动保留为本课草稿。'}</p></section></aside></div>`;
}
function koreanTeaching(l){
 if(track!=='korean')return '';
 return `<div class="korean-lesson-content"><div class="language-bridge"><span>日本語 N2</span><span>→</span><span>한국어 입문</span><small>借语法理解，发音跟韩语原声</small></div>${(l.teaching??[]).map(t=>`<section class="mini-teaching"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></section>`).join('')}${l.examples?.length?`<div class="example-table"><div class="example-head"><span>한국어</span><span>日本語</span><span>中文</span></div>${l.examples.map(x=>`<div><strong lang="ko">${esc(x.ko)}</strong><span lang="ja">${esc(x.ja)}</span><span>${esc(x.zh)}</span></div>`).join('')}</div>`:''}${l.exercise?`<section class="lesson-exercise"><h3>先自己做，再看参考</h3><p>${esc(l.exercise.question)}</p><details><summary>展开参考答案</summary><p>${esc(l.exercise.answer)}</p></details></section>`:''}<div class="official-resources"><strong>听音与查词：官方资源</strong>${(l.sourceUrls??[]).map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener">${url.includes('/jpn/')?'国立国语院 · 韩日学习词典':url.includes('krdict')?'国立国语院 · 词条释义与原声':url.includes('iksi')?'世宗学堂 · 入门课程与音频':'官方学习资料'} ${i+1} ↗</a>`).join('')}<small>词典可查释义和发音；课程内容可能需要登录。页面不把日语假名当作韩语发音标准。</small></div></div>`;
}
function handleSchoolClick(action,id){
 const school=workspace.school;
 if(action==='school-add')showDialog(schoolForm(null,esc));
 if(action==='school-list')navigate('route');
 if(action==='school-edit'){const task=school.tasks.find(t=>t.id===id);if(task)showDialog(schoolForm(task,esc));}
 if(action==='school-delete'){if(!confirm('删除这项任务？已写的学习感想会保留。'))return;school.tasks=school.tasks.filter(t=>t.id!==id);persist();render();}
 if(action==='school-open'){navigate('route');const row=document.getElementById('school-task-'+id);if(row){row.scrollIntoView({block:'center'});row.focus({preventScroll:true});}}
 if(action==='school-open-note'){navigate('records');const note=document.getElementById('school-record-'+id);if(note){note.scrollIntoView({block:'center'});note.focus({preventScroll:true});}}
 if(action==='school-edit-note'){
  const r=school.records.find(r=>r.id===id);if(!r)return;
  const form=document.querySelector('#school-journal-form');form.dataset.editId=id;
  document.querySelector('#school-record-text').value=r.text;document.querySelector('#school-record-blocker').value=r.blocker??'';
  document.querySelector('#school-record-task').value=school.tasks.some(t=>t.id===r.taskId)?r.taskId:'';
  document.querySelector('#school-journal-heading').textContent='编辑校内学习感想';document.querySelector('#school-record-text').focus();
 }
 if(action==='school-delete-note'){if(!confirm('删除这条校内学习感想？'))return;school.records=school.records.filter(r=>r.id!==id);persist();renderRecords();}
}
function handleSchoolSubmit(form){
 const data=new FormData(form),school=workspace.school;
 if(form.id==='school-task-form'){
  const title=String(data.get('title')??'').trim(),course=String(data.get('course')??'').trim(),due=String(data.get('due')??''),priority=String(data.get('priority')),note=String(data.get('note')??'').trim();
  if(!title||!validDueDate(due)||!['high','normal','low'].includes(priority)){document.querySelector('#school-error').textContent='请填写任务名称，并检查截止日期。';return;}
  const task=school.tasks.find(t=>t.id===form.dataset.editId);
  if(task)Object.assign(task,{title,course,due,priority,note});else school.tasks.push({id:crypto.randomUUID(),title,course,due,priority,note,done:false,created:new Date().toISOString()});
  const saved=persist();dialog.close();render();toast(saved?'校内任务已保存。':'任务暂存当前页面，请导出备份。');
 }else{
  const text=String(data.get('text')??'').trim(),blocker=String(data.get('blocker')??'').trim(),taskId=String(data.get('taskId')??'');if(!text){toast('先写一句今天的理解吧。');return;}
  const r=school.records.find(r=>r.id===form.dataset.editId);
  if(r)Object.assign(r,{text,blocker,taskId});else school.records.unshift({id:crypto.randomUUID(),text,blocker,taskId,date:new Date().toISOString()});
  const saved=persist();renderRecords();toast(saved?'校内学习感想已保存。':'感想暂存当前页面，请导出备份。');
 }
}
function renderRecords(){
 if(track==='school'){main.innerHTML=schoolJournal(workspace.school,esc,dateText);return;}
 main.innerHTML=`<div class="page-intro"><span class="eyebrow">JARVAIS WANG · LEARNING JOURNAL</span><h1>${track==='korean'?'韩语学习感想':'AI 学习感想'}</h1><p>记下一点收获、一个卡点。下次回来，就知道从哪里继续。</p></div><div class="record-layout"><section class="lesson-panel"><h2 id="record-form-title">写下今天的学习感想</h2><form id="record-form"><div class="field"><label for="record-lesson">对应课程</label><select id="record-lesson">${lessons.map(l=>`<option value="${Number(l.id)}" ${Number(l.id)===(nextLesson(state)??(track==='korean'?10:24))?'selected':''}>第${l.id}课 · ${esc(l.name)}</option>`).join('')}</select></div><div class="field"><label for="record-text">今天亲手做了什么？</label><textarea id="record-text" maxlength="10000" required placeholder="用一句话记录就好。例如：我独立检查了网页的三个模块。"></textarea></div><div class="field"><label for="record-blocker">卡点 / 下次从这里继续（选填）</label><textarea id="record-blocker" maxlength="10000" placeholder="例如：还没弄明白数据保存在哪里，下次先问这个。"></textarea></div><button class="primary" type="submit">保存学习感想 <span>↗</span></button><p class="save-note">保存在当前浏览器。需要换设备时，请先导出备份。</p></form></section><section><div class="section-heading" style="margin-top:0"><h2>过去的学习感想</h2><span>${state.records.length} 条积累</span></div>${state.records.length?state.records.map(r=>`<article class="record-item" id="record-${esc(r.id)}" tabindex="-1"><time>${esc(dateText(r.date))}</time><h3>第${String(r.lesson).padStart(2,'0')}课 · ${esc(r.legacyLessonName?"旧路线 · "+r.legacyLessonName:getLesson(r.lesson).name)}</h3><p>${esc(r.text)}</p>${r.blocker?`<p class="record-blocker">下次继续：${esc(r.blocker)}</p>`:''}<div class="record-actions"><button data-action="edit-record" data-id="${esc(r.id)}">编辑</button><button data-action="delete-record" data-id="${esc(r.id)}">删除</button></div></article>`).join(''):'<div class="empty-state"><div class="empty-symbol">✎</div><h3>你的第一条记录，从这里开始。</h3><p>不必写成一篇总结。<br>“今天我终于弄懂了……”就很好。</p></div>'}</section></div>`;
 if(track==='korean')main.insertAdjacentHTML('beforeend',archivedKorean(state));
 if(track==='ai')main.insertAdjacentHTML('beforeend',archivedAI(state,esc));
}
function addRecord(lesson,text,blocker=''){state.records.unshift({id:crypto.randomUUID(),lesson:Number(lesson),text:text.trim(),blocker:blocker.trim(),date:new Date().toISOString()});return persist();}
function showDialog(content){document.querySelector('#dialog-content').innerHTML=content;dialog.showModal();}
function backupDialog(){showDialog(`<span class="eyebrow">JARVAIS WANG · LEARNING BACKUP</span><h2 id="dialog-title">数据与备份</h2><p class="backup-warning">从旧网址搬过来？先在旧站导出JSON，再在这里导入。不同网址的浏览器记录不会自动互通。</p><p>AI、韩语与校内任务分开保存于当前浏览器。导出一个JSON文件即可备份全部板块；换设备时导入恢复，不会自动云端同步。</p><div class="backup-actions"><button class="primary" data-action="export">导出学习备份 ↓</button><button class="secondary import-label" data-action="import-trigger">导入备份 ↑</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p id="backup-feedback" role="status" aria-live="polite"></p><p class="backup-warning">新版备份包含全部板块，恢复会替换全部数据；旧版AI备份只替换AI板块。建议先导出当前记录。</p>`);}
function resourceDialog(){
 if(track==='korean'){showDialog(`<span class="eyebrow">TOMI · VIDEO COMPANION</span><h2 id="dialog-title">韩语视频课配套资料</h2><p>沿用トリリンガルのトミ初级43课的顺序，本次上线第1–10课。第1课含字母准备。中文整理与题目是本站原创辅助内容。</p><a class="resource-link" href="https://trilingual.jp/bigginer/20190814-2937/" target="_blank" rel="noopener"><span>原课程介绍与准备视频 ↗</span></a><a class="resource-link" href="https://trilingual.jp/bigginer/20190909-3348/" target="_blank" rel="noopener"><span>官方第1–5课总结测试 ↗</span></a><a class="resource-link" href="https://trilingual.jp/bigginer/20191014-7844/" target="_blank" rel="noopener"><span>官方第6–10课总结测试 ↗</span></a><a class="resource-link" href="https://krdict.korean.go.kr/jpn/mainAction" target="_blank" rel="noopener"><span>国立国语院 · 韩日学习词典 ↗</span></a><p class="backup-warning">记录保存在当前浏览器。首次完成测验后安排次日复习，换设备请先导出备份。旧韩语记录可在学习感想底部查看。</p>`);return;}
 if(track==='school'){showDialog(`<h2 id="dialog-title">校内任务怎么用</h2><p>先添加实际的课程任务与截止日期，再根据主页推荐开始处理。完成后勾选任务，并在校内学习感想里记下理解和卡点。学校资料、日程和任务暂时需要你手动填写。</p>`);return;}
 showDialog(creatorResources());}
async function copyPrompt(id){const text=getLesson(id).prompt;try{await navigator.clipboard.writeText(text);toast('示例指令已复制，回到 Codex 粘贴即可。');}catch{showDialog(`<h2 id="dialog-title">选中并复制示例指令</h2><p>浏览器暂不允许直接复制，请在下方选中文字复制。</p><div class="prompt-box" tabindex="0">${esc(text)}</div>`);}}
document.addEventListener('click',async e=>{
 const switcher=e.target.closest('[data-track]');if(switcher){workspace.activeTrack=switcher.dataset.track;bindTrack();editId=null;persist();navigate('today');return;}
 const navLink=e.target.closest('a[href^="#"]');
 if(navLink?.hash==='#main'){e.preventDefault();main.focus();return;}
 if(navLink&&['#today','#route','#records'].includes(navLink.hash)){e.preventDefault();history.replaceState(null,'',navLink.hash);editId=null;navigate(navLink.hash.slice(1));return;}
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
 if(a.startsWith('ko-')){
  if(a==='ko-route')navigate('route');
  if(a==='ko-review'||a==='ko-review-next'){reviewFeedback=null;navigate('review');}
  if(a==='ko-retry'){state.training.attempts[selected]={answers:{},submitted:false,updated:new Date().toISOString()};onlyWrong=false;persist();renderLesson();document.querySelector('#ko-quiz').scrollIntoView({block:'start'});}
  if(a==='ko-filter'){onlyWrong=!onlyWrong;renderLesson();document.querySelector('#ko-quiz').scrollIntoView({block:'start'});}
  if(a==='ko-complete'){const l=getLesson(selected),a=state.training.attempts[selected];if(!l||!a?.submitted||gradeLesson(l,a.answers).score<80||!(state.steps[selected]??[]).includes(0)||!(state.steps[selected]??[]).includes(1)||!(state.steps[selected]??[]).includes(2))return;state.completed=[...new Set([...state.completed,selected])];state.active=nextKoreanLesson(state)??selected;persist();navigate('today');toast('本课已完成，下一步已经准备好。');}
  return;
 }
 if(a.startsWith('school-')){handleSchoolClick(a,id);return;}
 if(a==='today'||a==='records'){editId=null;navigate(a);}
 if(a==='lesson')openLesson(id);
 if(a==='open-note'){editId=null;navigate('records');const note=document.getElementById('record-'+id);if(note){note.scrollIntoView({block:'center'});note.focus({preventScroll:true});}}
 if(a==='start')openLesson(id,true);
 if(a==='copy')await copyPrompt(id);
 if(a==='backup')backupDialog();
 if(a==='resources')resourceDialog();
 if(a==='import-trigger')document.querySelector('#import-file').click();
 if(a==='complete'){
  const l=getLesson(selected);if(!l.steps.every((_,i)=>(state.steps[selected]??[]).includes(i)))return;
  state.completed=[...new Set([...state.completed,selected])];state.active=nextLesson(state)??selected;
  const saved=persist();navigate('today');toast(saved?'这一课完成了。下一小步已经为你准备好。':'本课完成状态仅保留在当前页面，请导出备份。');
 }
 if(a==='save-lesson-note'){
  const text=document.querySelector('#lesson-note').value.trim();if(!text){toast('先写一句收获或继续位置吧。');return;}
  const saved=addRecord(selected,text);state.drafts[selected]='';persist();renderLesson();toast(saved?'复盘已保存为学习感想。':'记录仅保留在当前页面，请导出备份。');
 }
 if(a==='edit-record'){
  const r=state.records.find(x=>x.id===id);if(!r)return;editId=id;document.querySelector('#record-text').value=r.text;document.querySelector('#record-blocker').value=r.blocker??'';document.querySelector('#record-lesson').value=r.lesson;document.querySelector('#record-form-title').textContent='编辑这条学习记录';document.querySelector('#record-text').focus();
 }
 if(a==='delete-record'){
  if(!confirm('删除这条学习记录？删除前可先导出备份。'))return;
  state.records=state.records.filter(x=>x.id!==id);if(editId===id)editId=null;const saved=persist();renderRecords();toast(saved?'记录已删除。':'当前页面中的记录已移除，浏览器数据未保存。');
 }
 if(a==='export'){
  const blob=new Blob([JSON.stringify(workspace,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`Jarvais-Wang-全部学习备份-${new Date().toLocaleDateString('sv-SE')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已发起备份下载，请在下载列表确认文件。');
 }
});
document.addEventListener('change',async e=>{
 if(track==='korean'&&e.target.closest('form')?.id==='ko-quiz-form'){const a=state.training.attempts[selected]??{answers:{},submitted:false,updated:new Date().toISOString()};a.answers[e.target.name.slice(2)]=Number(e.target.value);a.submitted=false;a.updated=new Date().toISOString();state.training.attempts[selected]=a;persist();return;}
 if(e.target.matches('[data-school-toggle]')){const task=workspace.school.tasks.find(t=>t.id===e.target.dataset.schoolToggle);if(task){task.done=e.target.checked;persist();render();}return;}
 if(e.target.matches('[data-step]')){const i=Number(e.target.dataset.step);let checked=new Set(state.steps[selected]??[]);if(e.target.checked)checked.add(i);else checked.delete(i);state.steps[selected]=[...checked];if(!state.completed.includes(selected))state.active=selected;persist();renderLesson();}
 if(e.target.id==='import-file'){
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw new Error('备份文件超过5MB，请检查文件。');const parsed=JSON.parse(await file.text());const restored=validateWorkspaceBackup(parsed);const legacy=parsed.version===1;if(legacy){restored.tracks.korean=workspace.tracks.korean;restored.school=workspace.school;restored.activeTrack=workspace.activeTrack;}if(!confirm(legacy?'这是旧版AI备份。只恢复AI进度和感想，保留当前韩语与校内数据。':`恢复全部板块备份？AI ${restored.tracks.ai.completed.length}课、韩语 ${restored.tracks.korean.completed.length}课、校内 ${restored.school.tasks.length}项任务。这会替换当前全部板块数据。`))return;workspace=restored;bindTrack();const saved=persist();dialog.close();navigate('today');toast(saved?'学习备份已恢复。':'备份已载入当前页面，浏览器暂时无法保存。');}catch(error){const message=error instanceof SyntaxError?'这不是有效的JSON备份，原有数据未改变。':error.message;document.querySelector('#backup-feedback').textContent=message;toast(message);e.target.value='';}
 }
});
document.addEventListener('input',e=>{if(e.target.id==='lesson-note'){state.drafts[selected]=e.target.value;const saved=persist();document.querySelector('#draft-status').textContent=saved?'草稿已保留。':'草稿暂存当前页面，请导出备份。';}});
document.addEventListener('submit',e=>{
 if(track==='korean'&&e.target.id==='ko-quiz-form'){e.preventDefault();const l=getLesson(selected),data=new FormData(e.target),answers={};for(const q of l.quiz){if(!data.has('q-'+q.id)){toast('请先完成所有题目。');return;}answers[q.id]=Number(data.get('q-'+q.id));}const result=recordAttempt(state,l,answers);persist();onlyWrong=false;renderLesson();document.querySelector('#ko-quiz').scrollIntoView({block:'start'});toast(`测验完成：${result.score}分，复习日程已保留。`);return;}
 if(track==='korean'&&e.target.id==='ko-review-form'){e.preventDefault();const key=e.target.dataset.key,r=state.training.reviews[key];if(!r)return;const q=getLesson(r.lesson).quiz.find(q=>q.id===r.question),data=new FormData(e.target);if(!data.has('review-'+q.id))return;const selected=Number(data.get('review-'+q.id)),correct=selected===q.answer;answerReview(state,key,correct);persist();reviewFeedback={q,correct,selected};render();window.scrollTo({top:0,behavior:'instant'});return;}
 if(['school-task-form','school-journal-form'].includes(e.target.id)){e.preventDefault();handleSchoolSubmit(e.target);return;}
 if(e.target.id!=='record-form')return;e.preventDefault();const text=document.querySelector('#record-text').value.trim();if(!text){toast('先写一句今天做了什么吧。');return;}
 const lesson=Number(document.querySelector('#record-lesson').value),blocker=document.querySelector('#record-blocker').value.trim();let saved;
 if(editId){const r=state.records.find(x=>x.id===editId);if(r){if(r.lesson!==lesson)delete r.legacyLessonName;Object.assign(r,{lesson,text,blocker});saved=persist();}editId=null;}else saved=addRecord(lesson,text,blocker);
 renderRecords();toast(saved?'学习记录已保存。':'记录仅保留在当前页面，请导出备份。');
});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function route(){const name=location.hash.slice(1);const lessonMatch=name.match(/^lesson-(\d{1,2})$/);if(track!=='school'&&lessonMatch&&getLesson(Number(lessonMatch[1]))){selected=Number(lessonMatch[1]);navigate('lesson');}else if(['today','route','records','review'].includes(name)){editId=null;navigate(name);}else navigate('today');}
let lastCalendarDay=localDay();
function refreshCalendar(){
 const day=localDay(),refresh=shouldRefreshDaily(lastCalendarDay,day,view);
 if(day===lastCalendarDay)return;
 lastCalendarDay=day;
 document.querySelector('#today-date').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
 if(track==='korean'&&refresh){reviewFeedback=null;render();}
}
window.addEventListener('focus',refreshCalendar);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCalendar();});
setInterval(refreshCalendar,30000);
window.addEventListener('hashchange',route);route();
