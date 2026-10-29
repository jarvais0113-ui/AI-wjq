// Original short tactical missions. Reuses our Spike simulation, not external FPS engines.
import {SpikeGame} from './spike.mjs';
import {SITES,point,nearestFloor} from './lotus-map.mjs';
import {dist} from './engine.mjs';
export const MISSIONS=[
 {name:'B 点 · 最后一个人',tag:'1 VS 2 · 回防拆包',type:'retake',site:1,start:'B Main',enemies:['B Site','B Upper'],seconds:55,hint:'敌人守着已安装的 Spike。用致盲或屏障切断枪线，清点后长按 G 拆包。击杀所有人仍需拆包。'},
 {name:'C 点 · 七秒博弈',tag:'1 VS 3 · 守包反击',type:'hold',site:2,start:'C Site',enemies:['C Main','C Hall','C Mound'],seconds:50,hint:'Spike 已安装。你可以拖延引爆，也可以主动歼敌；听到拆包声，必须干预。'},
 {name:'A 点 · 逆风进场',tag:'1 VS 3 · 进点歼敌',type:'clear',site:0,start:'A Main',enemies:['A Tree','A Site','A Stairs'],seconds:70,hint:'70秒内清除三名守卫。先隔断远端火力，再逐个接战。击杀回复少量生命，技能各有一次起手机会。'}
];
export const AUGMENTS=[
 {id:'siphon',name:'收割续航',desc:'击杀恢复 25 生命；每关补满生命。'},
 {id:'tempo',name:'技能节奏',desc:'每次释放技能返还 25% 冷却；每关重新充能。'},
 {id:'plate',name:'轻装突击',desc:'每关额外 +25 护甲，移动速度 +8%。'}
];
export class ClutchGame extends SpikeGame{
 constructor(hero=0,difficulty='normal',seed=41029,stage=0,augments=[],history=[]){
  super(hero,difficulty,seed);this.clutch=true;this.initialSeed=seed;this.stage=Math.min(2,Math.max(0,stage));this.mission=MISSIONS[this.stage];this.augments=[...augments];this.history=history.slice();this.round=this.mission.type==='retake'?2:0;this.planSite=this.mission.site;this.phase='brief';this.roundTime=this.mission.seconds;this.nextBeep=0;this.order={kind:'auto'};this.events=[];
  this.entities=this.entities.filter(e=>e.player||e.kind==='hero'&&e.team===1&&e.slot<this.mission.enemies.length);
  const p=this.player;Object.assign(p,nearestFloor(point(this.mission.start),.5),{hp:100,maxHp:100,armor:50,speed:7.5,wallet:0});this.equip(p,'vandal','heavy');
  this.entities.filter(e=>!e.player).forEach((e,i)=>{const pos=nearestFloor(point(this.mission.enemies[i]),.5);Object.assign(e,pos,{anchor:{...pos},hp:100,maxHp:100,armor:0,think:1.5+i*.5});this.equip(e,i===0?'stinger':'classic');});
  for(const g of this.gates){g.open=true;g.closeAt=0;}
  const site=SITES[this.mission.site];this.spike=this.mission.type==='clear'?{state:'carried',carrier:p.id,x:p.x,z:p.z,site:null,remaining:45,defuseProgress:0}:{state:'planted',carrier:null,x:site.x,z:site.z,site:site.name,remaining:this.mission.seconds,defuseProgress:0};
  this.device='scan';this.deviceUsed=false;this.applyAugments();this.navVersion++;
 }
 applyAugments(){if(this.augments.includes('plate')){this.player.armor+=25;this.player.speed*=1.08;}}
 begin(gun='vandal',device='scan'){if(this.phase!=='brief'||!['vandal','phantom','spectre'].includes(gun)||!['scan','med','surge'].includes(device))return false;const armor=this.player.armor;this.equip(this.player,gun);this.player.armor=armor;this.device=device;this.phase='live';this.playerProtectionUntil=this.time+({easy:3,normal:1.5,hard:.75}[this.difficulty]||1.5);this.emit('notice',{text:this.mission.tag+' · '+this.mission.name});return true;}
 command(){return false;}
 passSpike(){return false;}
 ready(){return false;}
 cast(e,i){const ok=super.cast(e,i);if(ok&&e.player&&this.augments.includes('tempo'))e.cd[i]*=.75;return ok;}
 kill(t,s){if(t.dead)return;super.kill(t,s);if(s?.player&&this.augments.includes('siphon'))this.heal(this.player,25/.22,this.player);}
 objectiveAction(e,held,dt){if(this.mission?.type==='clear')return;const before=this.channel?.id;const result=super.objectiveAction(e,held,dt);if(this.clutch&&this.channel?.type==='defuse'&&this.channel.id!==before&&e.team===1){this.emit('announce',{text:'敌人正在拆包！阻止他，或用技能封住包点。'});this.emit('beep',{remaining:this.spike.remaining});}return result;}
 ai(e,dt){if(e.player||e.dead||this.phase!=='live')return;
  // Retake guards and clear-mode sentries hold separate anchors; do not chase unseen players.
  if(this.mission.type==='hold')return super.ai(e,dt);
  const target=this.target(e,e.range);
  if(target||e.reloadUntil>this.time||e.mag===0)return super.ai(e,dt);
  if(e.mag<4){this.reload(e);return;}
  if(dist(e,e.anchor)>2)this.navigate(e,e.anchor,dt);else e.task='守住枪线';
 }
 finishRound(team,reason){if(this.phase!=='live')return false;this.phase='between';this.winner=team;this.roundScore[team]++;const elapsed=Math.round(this.time-this.roundStartAt);this.summary={stage:this.stage,name:this.mission.name,won:team===0,reason,time:elapsed,kills:this.player.roundKills,damage:Math.round(this.player.roundDamage||0),stars:team===0?1+(this.player.hp>=50?1:0)+(elapsed<=this.mission.seconds*.7?1:0):0,points:team===0?Math.max(0,1000+this.player.roundKills*150+Math.round(this.player.hp)*3-elapsed*8):0};this.emit('end',{winner:team});return true;}
 update(dt,input={}){super.update(dt,input);if(this.phase!=='live')return;if(this.player.dead){this.finishRound(1,'你已阵亡 · 可以立即重试');return;}if(this.mission.type==='clear'&&this.time>=(this.nextHuntNav||0)){this.nextHuntNav=this.time+1;const t=this.entities.find(e=>!e.player&&!e.dead);if(t)this.navigation={label:'清除守卫',metres:Math.ceil(dist(this.player,t)),path:this.path(this.player,t)};}}
 snapshot(){return{...super.snapshot(),mode:'clutch',stage:this.stage+1,mission:this.mission.name,augments:this.augments,summary:this.summary};}
}
