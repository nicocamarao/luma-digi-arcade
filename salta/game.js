import {FAMILIES,stageSprite,familyPicker,header,sfx,rand,pick,$,save,load,keyboard,preload,imageSync,drawSticker,clamp,levelName} from '../shared/digi.js';
header($('app'),{kicker:'LUMA · DIGI ARCADE',title:'Salta y',em:'Fusiona',help:'<p>1. Corré y saltá por las plataformas del Mundo Digital.</p><p>2. Recogé a los amigos que encuentres: van a tu bandeja (7 lugares).</p><p>3. Dos amigos iguales se fusionan solos en su evolución, como en Cuadricula Fusión.</p><p>4. Esquivá a los virus: te roban al último amigo. Si te caés, volvés a la plataforma anterior y también perdés uno.</p><p>5. Conseguí un Digimon <b>Mega</b> para ganar.</p>'});
const KEY='luma-salta',W=960,H=540,G=.55,cv=$('c'),ctx=cv.getContext('2d');
let best=load(KEY+'-best',0),family=load(KEY+'-family',0);$('best').textContent=best;
const picker=familyPicker($('pick'),{selected:family,onPick:v=>{family=v;save(KEY+'-family',v);}});
const kb=keyboard();
document.querySelectorAll('.touch button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();kb.down.add(k);kb.pressed.add(k);},off=()=>kb.down.delete(k);b.onpointerdown=on;b.onpointerup=b.onpointerleave=b.onpointercancel=off;});
let st=null,raf=0;
function newGame(){
 const fams=[family,...FAMILIES.map((_,i)=>i).filter(i=>i!==family).sort(()=>Math.random()-.5).slice(0,3)];
 preload(fams.flatMap(f=>FAMILIES[f].files.map((_,s)=>stageSprite(f,s))));
 st={fams,p:{x:80,y:380,vx:0,vy:0,w:44,h:50,ground:false,dir:1,inv:0,anim:0},cam:0,plats:[{x:0,y:470,w:620}],items:[],foes:[],tray:[],score:0,dist:0,over:false,lastSafe:{x:80,y:380},t:0};
 extend();$('setup').hidden=true;$('game').hidden=false;$('overlay').hidden=true;renderTray();cancelAnimationFrame(raf);loop();
}
function extend(){
 while(st.plats.at(-1).x<st.cam+W*2.2){const last=st.plats.at(-1),gap=70+rand(110),w=120+rand(190),y=clamp(last.y+rand(181)-90,200,470),x=last.x+last.w+gap;st.plats.push({x,y,w});
  const n=1+rand(3);for(let i=0;i<n;i++){const r=Math.random(),s=r<.68?0:r<.93?1:2,f=pick(st.fams);if(s<FAMILIES[f].line.length-1)st.items.push({x:x+20+i*((w-40)/Math.max(1,n-1)||0),y:y-46-(rand(2)?0:70),f,s,bob:Math.random()*6});}
  if(w>=190&&Math.random()<.45)st.foes.push({x:x+20,y:y-30,min:x+6,max:x+w-36,v:1.2+Math.random(),dir:1});}
 const cut=st.cam-400;st.plats=st.plats.filter(p=>p.x+p.w>cut);st.items=st.items.filter(i=>i.x>cut);st.foes=st.foes.filter(f=>f.max>cut);
}
function addFriend(f,s){
 st.tray.push({f,s,fresh:true});sfx.ok();let merged=true;
 while(merged){merged=false;for(let i=0;i<st.tray.length&&!merged;i++)for(let j=i+1;j<st.tray.length;j++){const a=st.tray[i],b=st.tray[j];if(a.f===b.f&&a.s===b.s){st.tray.splice(j,1);st.tray.splice(i,1);const ns=a.s+1;st.tray.push({f:a.f,s:ns,fresh:true});st.score+=10*2**ns;sfx.win();if(ns===FAMILIES[a.f].line.length-1)finish(true,FAMILIES[a.f].line[ns]);merged=true;break;}}}
 while(st.tray.length>7)st.tray.shift();renderTray();
}
function loseFriend(){if(st.tray.length){st.tray.pop();renderTray();}sfx.bad();}
function renderTray(){
 $('tray').replaceChildren(...Array.from({length:7},(_,i)=>{const d=document.createElement('div');const it=st.tray[i];d.className='slot'+(it?.fresh?' new':'');if(it){d.style.setProperty('--c',FAMILIES[it.f].color);d.innerHTML=`<img src="${stageSprite(it.f,it.s)}" title="${FAMILIES[it.f].line[it.s]}" alt="${FAMILIES[it.f].line[it.s]}"><i>${it.s+1}</i>`;it.fresh=false;}return d;}));
 $('score').textContent=st.score;
}
function finish(win,name){
 if(st.over)return;st.over=true;const m=Math.floor(st.dist/10);if(st.score>best){best=st.score;save(KEY+'-best',best);$('best').textContent=best;}
 $('ov-title').textContent=win?'✦ ¡'+name+' alcanzado!':'Fin de la aventura';$('ov-text').textContent=win?`Lograste un Mega con ${st.score} puntos y ${m} m recorridos.`:`Recorriste ${m} m y sumaste ${st.score} puntos.`;$('overlay').hidden=false;
}
function step(){
 const p=st.p;st.t++;
 const left=kb.is('ArrowLeft','KeyA'),right=kb.is('ArrowRight','KeyD'),jump=kb.hit('Space','ArrowUp','KeyW');
 const ax=(right?1:0)-(left?1:0);p.vx+=ax?ax*.9:-p.vx*.25;p.vx=clamp(p.vx,-5.5,5.5);if(right)p.dir=1;if(left)p.dir=-1;
 if(jump&&p.ground){p.vy=-12.5;p.ground=false;sfx.jump();}
 if(!kb.is('Space','ArrowUp','KeyW')&&p.vy<-4)p.vy+=.5;
 p.vy=Math.min(p.vy+G,16);p.x+=p.vx;p.y+=p.vy;p.ground=false;
 for(const pl of st.plats){if(p.x+p.w>pl.x&&p.x<pl.x+pl.w&&p.y+p.h>=pl.y&&p.y+p.h-p.vy<=pl.y+2&&p.vy>=0){p.y=pl.y-p.h;p.vy=0;p.ground=true;st.lastSafe={x:clamp(p.x,pl.x,pl.x+pl.w-p.w),y:pl.y-p.h};}}
 p.x=Math.max(p.x,st.cam-20);
 if(p.y>H+80){p.x=st.lastSafe.x;p.y=st.lastSafe.y-10;p.vx=0;p.vy=0;p.inv=90;loseFriend();}
 if(p.inv>0)p.inv--;
 st.cam=Math.max(st.cam,p.x-280);st.dist=Math.max(st.dist,p.x-80);$('dist').textContent=Math.floor(st.dist/10)+' m';
 for(const it of st.items){it.bob+=.08;}
 st.items=st.items.filter(it=>{const hit=Math.abs(it.x+18-(p.x+p.w/2))<34&&Math.abs(it.y+18-(p.y+p.h/2))<40;if(hit)addFriend(it.f,it.s);return !hit;});
 for(const f of st.foes){f.x+=f.v*f.dir;if(f.x<f.min||f.x>f.max)f.dir*=-1;if(!p.inv&&Math.abs(f.x+15-(p.x+p.w/2))<34&&Math.abs(f.y+15-(p.y+p.h/2))<36){p.inv=100;p.vy=-7;p.vx=f.x>p.x?-6:6;loseFriend();}}
 extend();
}
function draw(){
 ctx.clearRect(0,0,W,H);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfe6f5');g.addColorStop(1,'#eef4e6');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#b9d3b1';for(let i=-1;i<6;i++){const x=i*300-(st.cam*.3)%300;ctx.beginPath();ctx.arc(x+150,560,210,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#a3c59a';for(let i=-1;i<8;i++){const x=i*180-(st.cam*.6)%180;ctx.beginPath();ctx.arc(x+90,600,160,0,Math.PI*2);ctx.fill();}
 ctx.save();ctx.translate(-st.cam,0);
 for(const pl of st.plats){ctx.fillStyle='#8a6a48';ctx.fillRect(pl.x,pl.y+10,pl.w,34);ctx.fillStyle='#6fae63';ctx.beginPath();ctx.roundRect(pl.x,pl.y,pl.w,16,6);ctx.fill();}
 for(const it of st.items){const img=imageSync(stageSprite(it.f,it.s));drawSticker(ctx,img,it.x,it.y+Math.sin(it.bob)*4,36,{border:FAMILIES[it.f].color,lineWidth:3});}
 for(const f of st.foes){ctx.fillStyle='#3d2f55';ctx.beginPath();ctx.ellipse(f.x+15,f.y+18,16,13+Math.sin(st.t*.2)*2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x+9,f.y+14,4,0,7);ctx.arc(f.x+21,f.y+14,4,0,7);ctx.fill();ctx.fillStyle='#c33';ctx.beginPath();ctx.arc(f.x+9+f.dir*1.5,f.y+14,2,0,7);ctx.arc(f.x+21+f.dir*1.5,f.y+14,2,0,7);ctx.fill();}
 const p=st.p;if(!(p.inv>0&&Math.floor(st.t/4)%2)){const top=st.tray.reduce((m,t)=>t.f===family&&t.s>m?t.s:m,1);const img=imageSync(stageSprite(family,top));ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);const squash=p.ground?1+Math.abs(p.vx)*.01*Math.sin(st.t*.5):1.05;ctx.scale(1,squash);drawSticker(ctx,img,-28,-56,56,{border:FAMILIES[family].color,lineWidth:4,flip:p.dir<0});ctx.restore();}
 ctx.restore();
}
function loop(){if(!st.over){step();}draw();kb.flush();if(!st.over)raf=requestAnimationFrame(loop);}
$('start').onclick=newGame;$('again').onclick=newGame;
