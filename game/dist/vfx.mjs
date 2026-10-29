// Original, pooled low-poly skill VFX. Four instanced batches, no external art.
import * as T from './vendor/three.module.min.js';
const TAU=Math.PI*2;
const colors={fire:'#ff6b28',wind:'#baf9f4',heal:'#82ffba',ice:'#b5f4ff',electric:'#b1adff',shadow:'#d598ff'};
class Pool{
 constructor(parent,geometry,max,opacity=1){this.mesh=new T.InstancedMesh(geometry,new T.MeshBasicMaterial({color:'#ffffff',transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide}),max);this.mesh.count=0;this.mesh.frustumCulled=false;this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.max=max;this.count=0;this.dummy=new T.Object3D();this.color=new T.Color();parent.add(this.mesh);}
 reset(){this.count=0;}
 put(x,y,z,sx,sy,sz,color,rx=0,ry=0,rz=0){if(this.count>=this.max)return;const d=this.dummy;d.position.set(x,y+(this.ground?.(x,z)||0),z);d.scale.set(sx,sy,sz);d.rotation.set(rx,ry,rz);d.updateMatrix();this.mesh.setMatrixAt(this.count,d.matrix);this.mesh.setColorAt(this.count,this.color.set(color));this.count++;}
 finish(){this.mesh.count=this.count;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;}
}
export class SkillVFX{
 constructor(scene){this.group=new T.Group();scene.add(this.group);this.flame=new Pool(this.group,new T.ConeGeometry(1,1,5),700);this.spark=new Pool(this.group,new T.OctahedronGeometry(1),600);this.smoke=new Pool(this.group,new T.IcosahedronGeometry(1,1),260,.3);this.rings=new Pool(this.group,new T.RingGeometry(.86,1,40),220,.8);this.panels=new Pool(this.group,new T.BoxGeometry(1,1,1),110,.58);this.pools=[this.flame,this.spark,this.smoke,this.rings,this.panels];this.bursts=[];this.group.visible=false;}
 feedback(ev){if(ev.type==='hit'&&ev.important){this.bursts.push({x:ev.x,z:ev.z,life:.38,total:.38,element:ev.element||'bullet',amount:ev.n});if(this.bursts.length>35)this.bursts.shift();}if(ev.type==='spellImpact'||ev.type==='break'){this.bursts.push({x:ev.x,z:ev.z,life:.6,total:.6,element:ev.element||'fire',big:true});}}
 ring(x,z,r,color,y=.2){this.rings.put(x,y,z,r,r,r,color,-Math.PI/2);}
 fire(x,z,height,phase,spread=1){const sw=Math.sin(phase*8)*.15;this.flame.put(x,.3+height/2,z,spread,height,spread,'#f34120',0,sw);this.flame.put(x+sw,.5+height*.55,z+.05,spread*.67,height*.8,spread*.65,'#ff952c',0,-sw);this.flame.put(x+sw,.8+height*.7,z,spread*.35,height*.5,spread*.35,'#ffe58b');}
 update(game,dt,now){this.group.visible=true;this.pools.forEach(p=>{p.reset();p.ground=game.lotus?(x,z)=>game.height({x,z}):null;});
 for(const f of game.effects){const element=f.element||(f.type==='healing'||f.type==='heal'?'heal':f.type==='barrier'?'ice':f.type==='pulse'?'electric':f.type==='zone'?'wind':f.type==='burst'?'shadow':'wind'),color=colors[element]||'#e2ffcf',progress=1-f.life/f.maxLife,enemy=f.team===1,edge=enemy?'#ff8275':color;const key=f.x*.37+f.z*.21;
 if(f.type==='barrier'){
  if(element==='fire'){this.panels.put(f.x,.55,f.z,f.w+1,1.1,f.h,'#ff351b');for(let i=0;i<13;i++){const z=f.z-f.h/2+i*f.h/12,h=2.7+Math.sin(now*9+i*2+key)*.6;this.fire(f.x+Math.sin(i*2.3)*.35,z,h,now+i,.8);if(i%3===0)this.smoke.put(f.x,4+(now+i)%1.5,z,1.2,1.1,1.2,'#ed8250');}this.rings.put(f.x,.13,f.z,2.5,7,1,edge,-Math.PI/2);}
  else{for(let i=0;i<7;i++){const z=f.z-f.h/2+i*f.h/6;this.panels.put(f.x,1.65,z,f.w,3.3,1.6,'#98e7ee',0,Math.sin(i)*.1);this.spark.put(f.x,3.4,z,.35,.8,.4,'#edffff');}this.panels.put(f.x,3.2,f.z,f.w+.15,.15,f.h+.4,'#e6ffff');}continue;
 }
 if(f.type==='zone'||f.type==='healing'){
  this.ring(f.x,f.z,f.r,edge,.2);this.ring(f.x,f.z,f.r*.93,edge,.23);
  if(element==='fire'){this.panels.put(f.x,.14,f.z,f.r*1.35,.07,f.r*1.35,'#ff5527',0,Math.PI/4);for(let i=0;i<18;i++){const a=i*2.4+key,r=Math.sqrt((i+.5)/18)*f.r*.86,x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r;this.fire(x,z,1.2+Math.sin(now*10+i)*.5,now+i,.48);}for(let i=0;i<5;i++){const a=i*1.26+now*.3;this.smoke.put(f.x+Math.sin(a)*f.r*.6,2.1+(now+i)%1,f.z+Math.cos(a)*f.r*.6,1.7,1.5,1.7,'#fba26d');}}
  if(element==='ice'){for(let i=0;i<16;i++){const a=i*2.4,r=Math.sqrt((i+.5)/16)*f.r*.9;this.spark.put(f.x+Math.cos(a)*r,.5+Math.sin(now*2+i)*.1,f.z+Math.sin(a)*r,.35,.8,.35,i%2?'#99dbea':'#d4fbff',0,i);}}
  if(element==='wind'){for(let i=0;i<8;i++){const a=i/8*TAU+now*.6,r=f.r*.55;this.smoke.put(f.x+Math.sin(a)*r,1.3+Math.sin(now+i)*.3,f.z+Math.cos(a)*r,2,1.2,2,'#d1eddf');}for(let i=0;i<3;i++)this.rings.put(f.x,.5+i*.7,f.z,f.r*(.5+i*.18),f.r*(.5+i*.18),1,'#d8fff6',-Math.PI/2,now*.2);}
  if(element==='heal'){for(let i=0;i<12;i++){const a=i*2.4,r=f.r*.7*Math.sqrt((i+.5)/12),x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r,y=.5+(now*.9+i*.37)%2.4;this.panels.put(x,y,z,.15,.7,.12,'#b4ffd1');this.panels.put(x,y,z,.7,.15,.12,'#b4ffd1');}this.ring(f.x,f.z,f.r*(.35+((now*.3)%1)*.6),'#b1ffcd',.4);}
  continue;
 }
 if(f.type==='beam'){const dx=Math.sin(f.angle),dz=Math.cos(f.angle);this.panels.put(f.x,1.3,f.z,1,.25,f.r,color,0,f.angle);for(let i=0;i<8;i++)this.spark.put(f.x+dx*(i-3.5)*3,1.3+Math.sin(i*2)*.25,f.z+dz*(i-3.5)*3,.3,.25,1.3,'#f6ffff',0,f.angle);continue;}
 if(f.type==='dash'){for(let i=0;i<6;i++)this.spark.put(f.x+Math.sin(i*1.4)*2,1+i*.2,f.z+Math.cos(i*1.4)*2,.13,.12,1.5,color,0,i);continue;}
 if(f.type==='flash'){const radius=f.r*(.7+progress*.5);this.smoke.put(f.x,2,f.z,radius*.6,radius*.6,radius*.6,'#fff3be');for(let i=0;i<12;i++){const a=i/12*TAU;this.spark.put(f.x+Math.sin(a)*radius,2+Math.sin(i*2)*1.5,f.z+Math.cos(a)*radius,.22,.22,2,'#fffbe9',0,a);}this.ring(f.x,f.z,radius,'#fff8ca',1.4);continue;}
 if(f.type==='pulse'){for(let i=0;i<4;i++)this.ring(f.x,f.z,f.r*Math.max(.08,progress-i*.14),color,.25+i*.3);for(let i=0;i<18;i++){const a=i/18*TAU+now;this.spark.put(f.x+Math.sin(a)*f.r*progress,1+Math.sin(i*4)*.6,f.z+Math.cos(a)*f.r*progress,.15,1.1,.15,'#e6deff',0,a,.6);}continue;}
 if(f.type==='burst'){const r=f.r*Math.max(.1,progress);this.ring(f.x,f.z,r,edge,.3);for(let i=0;i<20;i++){const a=i*2.4;this.spark.put(f.x+Math.sin(a)*r*.7,1+(1-progress)*3*Math.abs(Math.cos(i)),f.z+Math.cos(a)*r*.7,.3*(1-progress),1.1*(1-progress),.3*(1-progress),i%2?color:'#fff0c7',0,a,.5);}if(element==='fire'&&progress<.5){this.smoke.put(f.x,1.5,f.z,f.r*(.5+progress),2,f.r*(.5+progress),'#ffb84e');this.fire(f.x,f.z,4*(1-progress),now,1.5*(1-progress));}continue;}
 if(f.type==='ring'||f.type==='heal'||f.type==='slash'){this.ring(f.x,f.z,f.r*(.35+progress*.65),edge,.3);if(element==='shadow')for(let i=0;i<8;i++){const a=i/8*TAU+now;this.spark.put(f.x+Math.sin(a)*f.r*.6,1,f.z+Math.cos(a)*f.r*.6,.18,1,.18,color,0,a);}if(f.type==='heal')for(let i=0;i<8;i++)this.spark.put(f.x+Math.sin(i*2)*f.r*.6,1+progress*3,f.z+Math.cos(i*2)*f.r*.6,.2,.5,.2,color);}
 }
 for(const p of game.projectiles){if(!p.spell)continue;const k=Math.min(1,p.t/p.duration),y=1.3+Math.sin(k*Math.PI)*4,element=p.spell==='fireball'?'fire':'electric',color=colors[element];this.spark.put(p.x,y,p.z,.7,.7,.7,color,now*3,now*5);this.smoke.put(p.x,y,p.z,1.1,1.1,1.1,color);const dx=p.tx-p.sx,dz=p.tz-p.sz,d=Math.max(1,Math.hypot(dx,dz));for(let i=1;i<6;i++){this.spark.put(p.x-dx/d*i*.65,y-i*.15,p.z-dz/d*i*.65,.5-i*.06,.5-i*.06,.5-i*.06,i%2?'#fff0a5':color);}this.ring(p.tx,p.tz,p.radius,game.entities.find(e=>e.id===p.source)?.team===1?'#ff8171':color,.2);}
 for(const e of game.entities){if(e.dead||e.kind!=='hero')continue;const enemy=e.team===1;if(enemy&&game.status(e,'invis'))continue;if(game.status(e,'invis')){this.ring(e.x,e.z,1.7,'#d9b7ff',.35);this.smoke.put(e.x,1.2,e.z,1.3,1.4,1.3,'#bba0d3');}
 if(e.burn&&e.burn.end>game.time){for(let i=0;i<4;i++)this.fire(e.x+Math.sin(i*1.6)*.65,e.z+Math.cos(i*1.6)*.65,.9+Math.sin(now*11+i)*.3,now+i,.22);}
 if(game.status(e,'marked')){this.ring(e.x,e.z,1.65,'#e7a5ff',.3);this.spark.put(e.x,4,e.z,.35,.8,.35,'#f1beff',0,now*2);}
 if(game.status(e,'blind')){this.smoke.put(e.x,2.2,e.z,1,1,1,'#fff9cf');for(let i=0;i<5;i++){const a=now*3+i/5*TAU;this.spark.put(e.x+Math.sin(a)*1.1,3.6,e.z+Math.cos(a)*1.1,.18,.18,.18,'#fffce8');}}
 if(game.status(e,'stun')){for(let i=0;i<3;i++){const a=now*4+i/3*TAU;this.spark.put(e.x+Math.sin(a)*1.1,3.8,e.z+Math.cos(a)*1.1,.2,.2,.2,'#ffe89b');}}
 if(game.status(e,'suppressed')){this.ring(e.x,e.z,1.5,'#c7bdff');for(let i=0;i<3;i++)this.spark.put(e.x+.9,1+i*.8,e.z,.1,.7,.1,'#d8c6ff',0,0,.5);}
 if(e.shield>0)this.smoke.put(e.x,1.6,e.z,1.55,1.95,1.55,enemy?'#f6b7b0':'#9ef3e1');
 if(game.status(e,'air')){for(let i=0;i<3;i++)this.ring(e.x,e.z,1.2+i*.45,'#d5fff5',.4+i);}
 }
 for(const b of this.bursts){b.life-=dt;const k=1-b.life/b.total,color=colors[b.element]||'#fff0b3',r=(b.big?5:2.2)*k;for(let i=0;i<(b.big?16:8);i++){const a=i*2.4;this.spark.put(b.x+Math.sin(a)*r,1.5+Math.cos(i*2)*k*1.5,b.z+Math.cos(a)*r,.12*(1-k),.4*(1-k),.12*(1-k),i%2?color:'#fff6d7',0,a,1);}if(b.big)this.ring(b.x,b.z,r,color,.5);}
 this.bursts=this.bursts.filter(b=>b.life>0);this.pools.forEach(p=>p.finish());
 }
}
