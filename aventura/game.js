import {FAMILIES,ALL_FILES,prettyName,sprite,stageSprite,kidSprite,familyPicker,header,sfx,rand,shuffle,$,save,load,keyboard,preload,imageSync,drawSticker,clamp} from '../shared/digi.js';
header($('app'),{kicker:'LUMA · DIGI ARCADE',title:'Aventura',em:'Digital',help:'<p>1. Elegí a tu niño elegido. Su compañero Digimon te acompaña.</p><p>2. Caminá por la isla con las flechas o <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span>. Los árboles y el agua no se pueden cruzar.</p><p>3. Hay 20 Digimon escondidos. Acercate a cada uno para registrarlo en tu Digidex.</p><p>4. ¡Encontralos a todos lo más rápido que puedas!</p>'});
const KEY='luma-aventura',T=48,MW=40,MH=30,W=960,H=600,TOTAL=20,cv=$('c'),ctx=cv.getContext('2d');
let kid=load(KEY+'-kid',0),best=load(KEY+'-best',null);
familyPicker($('pick'),{selected:kid,kids:true,onPick:v=>{kid=v;save(KEY+'-kid',v);}});
const kb=keyboard();
document.querySelectorAll('.dpad button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();kb.down.add(k);},off=()=>kb.down.delete(k);b.onpointerdown=on;b.onpointerup=b.onpointerleave=b.onpointercancel=off;});
let st=null,raf=0;
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const showBest=()=>$('best').textContent=best!==null?'Mejor tiempo: '+fmt(best):'';
function genMap(){
 const m=Array.from({length:MH},()=>Array(MW).fill(0));// 0 pasto, 1 árbol, 2 agua, 3 arena
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x===0||y===0||x===MW-1||y===MH-1)m[y][x]=1;
 for(let i=0;i<40;i++){const x=2+rand(MW-4),y=2+rand(MH-4),n=2+rand(5);for(let k=0;k<n;k++){const xx=clamp(x+rand(3)-1,1,MW-2),yy=clamp(y+rand(3)-1,1,MH-2);m[yy][xx]=1;}}
 for(let i=0;i<5;i++){const x=3+rand(MW-8),y=3+rand(MH-8),w=2+rand(4),h=2+rand(3);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){m[yy][xx]=2;}for(let yy=y-1;yy<=y+h;yy++)for(let xx=x-1;xx<=x+w;xx++)if(m[yy]?.[xx]===0)m[yy][xx]=3;}
 for(let y=MH/2-2;y<MH/2+2;y++)for(let x=MW/2-2;x<MW/2+2;x++)m[y][x]=0;
 return m;
}
const free=(m,x,y)=>m[y]?.[x]===0||m[y]?.[x]===3;
function reachable(m,sx,sy){const seen=new Set([sy*MW+sx]),q=[[sx,sy]];while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*MW+nx;if(!seen.has(k)&&free(m,nx,ny)){seen.add(k);q.push([nx,ny]);}}}return seen;}
function newGame(){
 const map=genMap(),sx=MW/2,sy=MH/2,reach=reachable(map,sx,sy);
 const partner=FAMILIES[kid].files;const files=shuffle(ALL_FILES.filter(f=>!partner.includes(f))).slice(0,TOTAL);
 const spots=shuffle([...reach].filter(k=>Math.abs(k%MW-sx)+Math.abs(Math.floor(k/MW)-sy)>4)).slice(0,TOTAL);
 const mons=files.map((file,i)=>({file,x:spots[i]%MW,y:Math.floor(spots[i]/MW),px:(spots[i]%MW)*T,py:Math.floor(spots[i]/MW)*T,bob:Math.random()*6,wander:Math.random()<.5,t:rand(120)}));
 preload([...files.map(sprite),kidSprite(FAMILIES[kid].kidFile),stageSprite(kid,1)]);
 st={map,mons,p:{x:sx*T,y:sy*T,dir:1,walk:0},trail:[],found:[],t:0,over:false,sec:0};
 const f=FAMILIES[kid],k=$('kid');k.style.setProperty('--c',f.color);k.querySelector('img').src=kidSprite(f.kidFile);k.querySelector('b').textContent=f.kid+' y '+f.line[1];
 $('setup').hidden=true;$('game').hidden=false;$('overlay').hidden=true;renderFound();showBest();cancelAnimationFrame(raf);loop();
}
function renderFound(){$('found').replaceChildren(...Array.from({length:TOTAL},(_,i)=>{const s=document.createElement('span');const f=st.found[i];if(f){s.innerHTML=`<img src="${sprite(f)}" title="${prettyName(f)}" alt="${prettyName(f)}">`;}return s;}));$('count').textContent=st.found.length+' / '+TOTAL;}
function toast(file){const t=$('toast');t.querySelector('img').src=sprite(file);t.querySelector('span').textContent='¡Encontraste a '+prettyName(file)+'!';t.classList.add('show');clearTimeout(t.h);t.h=setTimeout(()=>t.classList.remove('show'),1600);}
function blocked(px,py){const pad=10;for(const [ox,oy] of [[pad,pad+14],[T-pad,pad+14],[pad,T-4],[T-pad,T-4]]){if(!free(st.map,Math.floor((px+ox)/T),Math.floor((py+oy)/T)))return true;}return false;}
function step(){
 st.t++;if(st.t%60===0){st.sec++;$('time').textContent=fmt(st.sec);}
 const p=st.p,sp=3.4;let dx=(kb.is('ArrowRight','KeyD')?1:0)-(kb.is('ArrowLeft','KeyA')?1:0),dy=(kb.is('ArrowDown','KeyS')?1:0)-(kb.is('ArrowUp','KeyW')?1:0);
 if(dx&&dy){dx*=.71;dy*=.71;}if(dx)p.dir=Math.sign(dx);
 if(dx||dy){p.walk++;if(!blocked(p.x+dx*sp,p.y))p.x+=dx*sp;if(!blocked(p.x,p.y+dy*sp))p.y+=dy*sp;st.trail.unshift({x:p.x,y:p.y,dir:p.dir});if(st.trail.length>14)st.trail.pop();}
 for(const m of st.mons){m.bob+=.07;if(m.wander&&++m.t>140){m.t=0;const [ddx,ddy]=[[1,0],[-1,0],[0,1],[0,-1]][rand(4)];if(free(st.map,m.x+ddx,m.y+ddy)&&!st.mons.some(o=>o!==m&&o.x===m.x+ddx&&o.y===m.y+ddy)){m.x+=ddx;m.y+=ddy;}}m.px+=(m.x*T-m.px)*.1;m.py+=(m.y*T-m.py)*.1;}
 st.mons=st.mons.filter(m=>{const hit=Math.abs(m.px-p.x)<34&&Math.abs(m.py-p.y)<34;if(hit){st.found.push(m.file);renderFound();toast(m.file);sfx.win();}return !hit;});
 if(!st.mons.length&&!st.over){st.over=true;if(best===null||st.sec<best){best=st.sec;save(KEY+'-best',best);}showBest();$('ov-text').textContent='Encontraste a los 20 Digimon en '+fmt(st.sec)+'.';$('overlay').hidden=false;}
}
function draw(){
 const p=st.p,camx=clamp(p.x-W/2+T/2,0,MW*T-W),camy=clamp(p.y-H/2+T/2,0,MH*T-H);
 ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(-camx,-camy);
 const x0=Math.floor(camx/T),y0=Math.floor(camy/T);
 for(let y=y0;y<=y0+H/T+1&&y<MH;y++)for(let x=x0;x<=x0+W/T+1&&x<MW;x++){const v=st.map[y][x];ctx.fillStyle=v===2?'#7fb8d8':v===3?'#e8d9a8':((x+y)%2?'#a9d18e':'#b4d99a');ctx.fillRect(x*T,y*T,T,T);
  if(v===1){ctx.fillStyle='#8a6a48';ctx.fillRect(x*T+T/2-5,y*T+T/2,10,T/2-4);ctx.fillStyle=(x*7+y*13)%3?'#4f8f4a':'#3f7d44';ctx.beginPath();ctx.arc(x*T+T/2,y*T+T/2-6,T/2-5,0,7);ctx.fill();ctx.fillStyle='#6fae63';ctx.beginPath();ctx.arc(x*T+T/2-6,y*T+T/2-12,8,0,7);ctx.fill();}
  if(v===2){ctx.fillStyle='#ffffff55';ctx.fillRect(x*T+8+Math.sin(st.t*.05+x)*4,y*T+T/2,14,3);}}
 for(const m of st.mons){const img=imageSync(sprite(m.file));ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(m.px+T/2,m.py+T-2,16,5,0,0,7);ctx.fill();drawSticker(ctx,img,m.px+4,m.py+Math.sin(m.bob)*3,40,{border:'#fff',lineWidth:3});}
 const tr=st.trail[Math.min(st.trail.length-1,10)]||{x:p.x-30*p.dir,y:p.y,dir:p.dir};const pimg=imageSync(stageSprite(kid,1));drawSticker(ctx,pimg,tr.x+8,tr.y+10+Math.abs(Math.sin(p.walk*.2))*-3,32,{border:FAMILIES[kid].color,lineWidth:3,flip:tr.dir<0});
 const f=FAMILIES[kid],kimg=imageSync(kidSprite(f.kidFile)),leg=Math.sin(p.walk*.3)*5;ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(p.x+T/2,p.y+T-2,14,5,0,0,7);ctx.fill();
 ctx.fillStyle='#3b3b55';ctx.fillRect(p.x+T/2-9+leg*.6,p.y+T-16,7,14);ctx.fillRect(p.x+T/2+2-leg*.6,p.y+T-16,7,14);
 ctx.fillStyle=f.color;ctx.beginPath();ctx.roundRect(p.x+T/2-11,p.y+18,22,18,6);ctx.fill();
 drawSticker(ctx,kimg,p.x+T/2-17,p.y-8,34,{border:'#fff',lineWidth:3,flip:p.dir<0});
 ctx.restore();
 ctx.fillStyle='#244f3dcc';ctx.fillRect(W-150,H-100,140,90);ctx.fillStyle='#ffffff55';ctx.fillRect(W-150+2,H-100+2,136,86);const s=136/MW;for(const m of st.mons){ctx.fillStyle='#fff';ctx.fillRect(W-148+m.x*s,H-98+m.y*s*1.04,3,3);}ctx.fillStyle='#ffd86a';ctx.fillRect(W-148+p.x/T*s-1,H-98+p.y/T*s*1.04-1,5,5);
}
function loop(){if(!st.over)step();draw();kb.flush();raf=requestAnimationFrame(loop);}
$('start').onclick=newGame;$('again').onclick=newGame;
