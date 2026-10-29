import{GUNS}from'./weapons.mjs';import{SITES,nearestFloor}from'./lotus-map.mjs';import{dist}from'./engine.mjs';
// Original UI-facing rules. These helpers do not spend credits or mutate combat.
export function recommendLoadout(game,style='balanced'){
 if(!['eco','balanced','assault'].includes(style))return null;
 const p=game.player,owned=p.carryGun||'classic',budget=p.wallet;
 const cap=style==='eco'?Math.min(500,budget):budget;
 const order=style==='eco'?['ghost','classic']:style==='assault'?['vandal','phantom','bulldog','spectre','stinger','ghost','classic']:['phantom','vandal','bulldog','spectre','ghost','classic'];
 const reserve=style==='eco'?0:cap>=1400?400:0;
 let gun=order.find(id=>(id===owned?0:GUNS[id].price)<=cap-reserve)||'classic';
 if(GUNS[owned]?.price>=GUNS[gun].price)gun=owned;
 const gunCost=gun===owned?0:GUNS[gun].price,left=cap-gunCost;
 const armor=style==='eco'?'keep':left>=1000&&p.armor<50?'heavy':left>=400&&p.armor<25?'light':'keep';
 const cost=gunCost+({keep:0,light:400,heavy:1000}[armor]);
 return{gun,armor,cost,remaining:budget-cost,label:{eco:'经济保留',balanced:'均衡配装',assault:'火力优先'}[style]};
}
export function roundAdvice(entry){
 if(entry.objectives>0)return'你参与了关键安拆。下一回合与队友保持交叉火力，保护目标。';
 if(entry.damage===0)return'本回合未造成伤害。用包点指令集结队友，沿导航进入交战区域。';
 if(!entry.survived&&entry.shots>0&&entry.accuracy<20)return'命中率偏低。停步后再开火，用短点射控制散布。';
 if(!entry.survived)return'避免独自换血。先与队友汇合，换弹时利用墙角与掩体。';
 if(entry.reason.includes('超时'))return'时间也是资源。提前交包给队友，进入包点后尽快完成安装。';
 return'存活装备已保留。根据余钱补充护甲，把火力优势带到下一回合。';
}
export function navigationTarget(game){
 if(game.player.dead||game.mode==='spike'&&game.phase!=='live')return null;
 const s=game.spike,o=game.order;
 if(s?.state==='planted')return{...s,label:game.player.team===game.defendingTeam?'拆除 Spike':'守住 Spike'};
 if(s?.state==='dropped'&&game.player.team===game.attackingTeam)return{...s,label:'夺回 Spike'};
 if(o?.kind==='hold')return{...o,label:'守住阵地'};
 if(o&&['A','B','C'].includes(o.kind)){const site=SITES.find(s=>s.name===o.kind);return{...site,label:site.name+' 包点'};}
 if(game.mode==='spike'){const site=SITES[game.planSite];return{...site,label:site.name+' 包点'};}
 const tower=game.entities.filter(e=>(e.kind==='tower'||e.kind==='core')&&e.team!==game.player.team&&!e.dead&&game.vulnerable(e)).sort((a,b)=>dist(a,game.player)-dist(b,game.player))[0];return tower?{...tower,label:tower.kind==='core'?'敌方水晶':'前线防御塔'}:null;
}
export function updateNavigation(game){
 const target=navigationTarget(game);if(!game.navigationEnabled||!target){game.navigation=null;return;}
 const signature=target.label+':'+Math.round(target.x)+':'+Math.round(target.z);
 if(game.navigation&&game.navigation.signature===signature&&game.time<game.navigation.refreshAt)return;
 const end=nearestFloor(target,.5),path=game.path(game.player,end);
 const distance=path.reduce((sum,p,i)=>sum+dist(i?path[i-1]:game.player,p),0);
 const reached=path.length>0?dist(path[path.length-1],end)<2:dist(game.player,end)<2;game.navigation={reached,signature,label:target.label,target:end,path,metres:Math.round(distance),refreshAt:game.time+1.2};
}
