import {FAMILIES,stageSprite,familyPicker,header,sfx,rand,$,save,load,keyboard,preload,imageSync,drawSticker,clamp} from '../shared/digi.js';
header($('app'),{kicker:'LUMA · DIGI ARCADE',title:'Digi-',em:'Lucha',help:'<p>Dos luchadores en el mismo teclado (o contra la computadora).</p><p><b>Jugador 1:</b> <span class="kbd">A</span><span class="kbd">D</span> mover, <span class="kbd">W</span> saltar, <span class="kbd">S</span> bloquear, <span class="kbd">Espacio</span> atacar.</p><p><b>Jugador 2:</b> flechas para mover, saltar y bloquear, <span class="kbd">Enter</span> atacar.</p><p>Cuando un Digimon baja de la mitad de vida digievoluciona y pega más fuerte. Gana quien se lleva 2 rondas.</p>'});
const KEY='luma-lucha',W=960,H=480,FLOOR=400,cv=$('c'),ctx=cv.getContext('2d');
let cfg=load(KEY,{p1:0,p2:1,cpu:true});
familyPicker($('pick1'),{selected:cfg.p1,stage:2,onPick:v=>{cfg.p1=v;save(KEY,cfg);}});familyPicker($('pick2'),{selected:cfg.p2,stage:2,onPick:v=>{cfg.p2=v;save(KEY,cfg);}});
$('cpu').checked=cfg.cpu;$('cpu').onchange=()=>{cfg.cpu=$('cpu').checked;save(KEY,cfg);};
const kb=keyboard();
document.querySelectorAll('.touch2 button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();kb.down.add(k);kb.pressed.add(k);},off=()=>kb.down.delete(k);b.onpointerdown=on;b.onpointerup=b.onpointerleave=b.onpointercancel=off;});
const CTRL=[{l:'KeyA',r:'KeyD',j:'KeyW',b:'KeyS',a:'Space'},{l:'ArrowLeft',r:'ArrowRight',j:'ArrowUp',b:'ArrowDown',a:'Enter'}];
let st=null,raf=0,rounds=[0,0],sparks=[];
const mk=(fam,x,dir)=>({fam,x,y:FLOOR,vx:0,vy:0,hp:100,dir,state:'idle',t:0,cd:0,inv:0,stage:2,flash:0,hitDone:false,ai:{t:0}});
const maxStage=f=>FAMILIES[f].line.length-1;
function startMatch(){rounds=[0,0];[0,1].forEach(i=>{const f=FAMILIES[i?cfg.p2:cfg.p1],el=$('f'+(i+1));el.style.setProperty('--c',f.color);el.querySelector('b').textContent=f.name+(i&&cfg.cpu?' (CPU)':'');el.querySelectorAll('.rounds s').forEach(s=>s.classList.remove('won'));});preload([cfg.p1,cfg.p2].flatMap(f=>FAMILIES[f].files.map((_,s)=>stageSprite(f,s))));$('setup').hidden=true;$('game').hidden=false;startRound();}
function startRound(){st={f:[mk(cfg.p1,240,1),mk(cfg.p2,660,-1)],time:60*60,over:false,t:0,intro:90};sparks=[];$('overlay').hidden=true;cancelAnimationFrame(raf);loop();}
function damageOf(f){return [0,0,8,11,15][f.stage]||8;}
function evolveCheck(f){const target=f.hp<=25?maxStage(f.fam):f.hp<=50?Math.min(3,maxStage(f.fam)):2;if(target>f.stage){f.stage=target;f.flash=40;f.hp=Math.min(100,f.hp+6);sfx.win();sparks.push({x:f.x,y:f.y-60,r:10,c:FAMILIES[f.fam].color,life:40,txt:'¡Digievolución! '+FAMILIES[f.fam].line[f.stage]});}}
function input(i){const f=st.f[i];if(i===1&&cfg.cpu)return ai(f,st.f[0]);const c=CTRL[i];return {l:kb.is(c.l),r:kb.is(c.r),j:kb.hit(c.j),b:kb.is(c.b),a:kb.hit(c.a)};}
function ai(f,o){f.ai.t++;const d=o.x-f.x,ad=Math.abs(d);const r={l:false,r:false,j:false,b:false,a:false};if(f.ai.t%12===0)f.ai.plan=Math.random();const p=f.ai.plan||0;
 if(ad>90){if(d>0)r.r=true;else r.l=true;if(p<.08&&f.ai.t%30===0)r.j=true;}else{if(o.state==='attack'&&o.t<8&&p<.45)r.b=true;else if(f.ai.t%26===0&&p<.7)r.a=true;else if(p>.9){if(d>0)r.l=true;else r.r=true;}}return r;}
function update(){
 st.t++;if(st.intro>0){st.intro--;}else if(!st.over){st.time--;$('timer').textContent=Math.ceil(st.time/60);}
 st.f.forEach((f,i)=>{const o=st.f[1-i];const inp=st.intro>0||st.over?{}:input(i);f.t++;if(f.cd>0)f.cd--;if(f.inv>0)f.inv--;if(f.flash>0)f.flash--;
  const grounded=f.y>=FLOOR;
  if(f.state==='hurt'){if(f.t>14)f.state='idle';}
  else if(f.state==='attack'){if(f.t>=6&&f.t<=12&&!f.hitDone){const reach=f.stage>=4?110:f.stage===3?95:80;if(o.inv===0&&Math.abs(o.x-f.x)<reach&&Math.sign(o.x-f.x)===f.dir&&Math.abs(o.y-f.y)<70){f.hitDone=true;o.inv=36;const blocked=o.state==='block';const dmg=blocked?2:damageOf(f);o.hp=Math.max(0,o.hp-dmg);o.vx=f.dir*(blocked?4:9);if(!blocked){o.state='hurt';o.t=0;o.vy=-3;sfx.hit();}else sfx.tick();sparks.push({x:o.x-f.dir*30,y:o.y-60,r:blocked?8:16,c:blocked?'#9fc7ff':'#ffd86a',life:14});evolveCheck(o);}}if(f.t>20)f.state='idle';}
  else{f.state=inp.b&&grounded?'block':'idle';if(f.state!=='block'){if(inp.l){f.vx-=1.2;}if(inp.r){f.vx+=1.2;}if(inp.j&&grounded){f.vy=-13;sfx.jump();}if(inp.a&&f.cd===0){f.state='attack';f.t=0;f.cd=26;f.hitDone=false;}}
   if(f.state!=='attack')f.dir=o.x>f.x?1:-1;}
  f.vx=clamp(f.vx*.82,-7,7);if(Math.abs(f.vx)<.1)f.vx=0;f.x=clamp(f.x+f.vx,50,W-50);f.vy+=.7;f.y=Math.min(FLOOR,f.y+f.vy);if(f.y===FLOOR)f.vy=0;
  const el=$('f'+(i+1));const bar=el.querySelector('.hp i');bar.style.width=f.hp+'%';bar.classList.toggle('low',f.hp<=35);el.querySelector('img').src=stageSprite(f.fam,f.stage);});
 const [a,b]=st.f;if(Math.abs(a.x-b.x)<60){const push=(60-Math.abs(a.x-b.x))/2,s=Math.sign(a.x-b.x)||1;a.x=clamp(a.x+push*s,50,W-50);b.x=clamp(b.x-push*s,50,W-50);}
 sparks=sparks.filter(s=>(s.life--)>0);
 if(!st.over&&st.intro===0&&(a.hp<=0||b.hp<=0||st.time<=0)){st.over=true;const w=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(w>=0){rounds[w]++;$('f'+(w+1)).querySelectorAll('.rounds s')[rounds[w]-1].classList.add('won');}
  setTimeout(()=>{const name=w>=0?FAMILIES[st.f[w].fam].line[st.f[w].stage]:'Nadie';const match=rounds[0]===2||rounds[1]===2;$('ov-title').textContent=match?'🏆 ¡'+name+' gana el combate!':w>=0?name+' gana la ronda':'Empate';$('ov-text').textContent=match?`Rondas ${rounds[0]} – ${rounds[1]}`:`Rondas ${rounds[0]} – ${rounds[1]} · Siguiente ronda`;$('next').textContent=match?'Revancha':'Siguiente ronda';$('next').onclick=match?startMatch:startRound;$('overlay').hidden=false;sfx.win();},700);}
}
function draw(){
 ctx.clearRect(0,0,W,H);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e3a4a');g.addColorStop(1,'#2d5a4d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#ffffff14';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<FLOOR;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 ctx.fillStyle='#38624f';ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.fillStyle='#6fae63';ctx.fillRect(0,FLOOR,W,8);
 st.f.forEach((f,i)=>{const size=f.stage>=4?124:f.stage===3?108:96,img=imageSync(stageSprite(f.fam,f.stage));ctx.save();ctx.translate(f.x,f.y);
  if(f.state==='attack'){const k=Math.sin(Math.min(f.t,12)/12*Math.PI);ctx.translate(f.dir*k*26,0);}
  if(f.state==='hurt')ctx.rotate(-f.dir*.2);if(f.state==='block')ctx.scale(.9,.9);
  ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,FLOOR-f.y+4,size*.45,8,0,0,7);ctx.fill();
  drawSticker(ctx,img,-size/2,-size,size,{border:f.flash>0&&Math.floor(f.flash/3)%2?'#fff':FAMILIES[f.fam].color,lineWidth:5,flip:f.dir<0});
  if(f.state==='block'){ctx.strokeStyle='#9fc7ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.dir*size*.35,-size/2,size*.5,-1.1+(f.dir<0?Math.PI:0),1.1+(f.dir<0?Math.PI:0));ctx.stroke();}
  if(f.state==='attack'&&f.t>=4&&f.t<=14){ctx.strokeStyle='#ffd86a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();const r=size*.75;ctx.arc(f.dir*20,-size/2,r,(f.dir>0?-.9:Math.PI-.9)+f.t*.05,(f.dir>0?.9:Math.PI+.9)-f.t*.02);ctx.stroke();}
  ctx.restore();});
 for(const s of sparks){ctx.fillStyle=s.c;ctx.globalAlpha=Math.min(1,s.life/10);ctx.beginPath();ctx.arc(s.x,s.y,s.r*(1+(14-Math.min(14,s.life))/8),0,7);ctx.fill();if(s.txt){ctx.font='700 20px Outfit';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(s.txt,W/2,80);}ctx.globalAlpha=1;}
 if(st.intro>0){ctx.fillStyle='#fff';ctx.font='800 64px Outfit';ctx.textAlign='center';ctx.fillText(st.intro>30?'RONDA '+(rounds[0]+rounds[1]+1):'¡LUCHEN!',W/2,200);}
}
function loop(){update();draw();kb.flush();raf=requestAnimationFrame(loop);}
$('start').onclick=startMatch;$('menu').onclick=()=>{cancelAnimationFrame(raf);$('game').hidden=true;$('setup').hidden=false;};
