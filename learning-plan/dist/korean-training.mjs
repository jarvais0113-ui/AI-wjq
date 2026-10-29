export const COURSE_ID='tomi-43-v1';
export const READY_LESSONS=10;
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function addDays(day,n){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return localDay(d);}
export function emptyTraining(){return {attempts:{},reviews:{}};}
export function gradeLesson(lesson,answers={}){
 const items=lesson.quiz.map(q=>({id:q.id,selected:answers[q.id]??null,expected:q.answer,correct:answers[q.id]===q.answer,explanation:q.explanation}));
 return {score:Math.round(items.filter(x=>x.correct).length/items.length*100),items};
}
export function recordAttempt(state,lesson,answers,now=new Date()){
 state.training??=emptyTraining();const id=Number(lesson.id),day=localDay(now),result=gradeLesson(lesson,answers);
 state.training.attempts[id]={answers:{...answers},submitted:true,updated:now.toISOString()};
 for(const item of result.items){const key=`${id}:${item.id}`,previous=state.training.reviews[key];
  // Re-taking a lesson must never postpone an already scheduled review.
  state.training.reviews[key]=previous??{lesson:id,question:item.id,due:addDays(day,1),lastResult:item.correct};
 }
 return result;
}
export function dueReviews(state,day=localDay()){return Object.entries(state.training?.reviews??{}).filter(([,r])=>r.due<=day).sort((a,b)=>a[1].due.localeCompare(b[1].due)||Number(a[1].lastResult)-Number(b[1].lastResult)).map(([key,r])=>({key,...r}));}
export function answerReview(state,key,correct,day=localDay()){
 const review=state.training?.reviews[key];if(!review)return;
 review.lastResult=correct;review.due=addDays(day,correct?3:1);review.lastAnswered=day;
}
export function nextKoreanLesson(state){if(state.active>=1&&state.active<=READY_LESSONS&&!state.completed.includes(state.active))return state.active;return Array.from({length:READY_LESSONS},(_,i)=>i+1).find(id=>!state.completed.includes(id))??null;}
export function shouldRefreshDaily(previousDay,day,view){return previousDay!==day&&['today','review'].includes(view);}
