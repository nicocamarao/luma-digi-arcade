import {FAMILIES,stageSprite,familyPicker,header,sfx,rand,$,save,load} from '../shared/digi.js';
header($('app'),{kicker:'LUMA · DIGI ARCADE',title:'Digi-',em:'Ludo',help:'<p>1. Cada jugador elige una familia. Sus 4 fichas nacen bebés en la base.</p><p>2. Tirá el dado (botón, <span class="kbd">Espacio</span> o tocando el dado). Con un 6 sacás una ficha de la base y volvés a tirar.</p><p>3. Tocá la ficha iluminada que querés mover. Al avanzar, tus Digimon evolucionan: Novato, Campeón, Ultra y Mega en la meta.</p><p>4. Si caés sobre una ficha rival la mandás a su base, salvo en las casillas ★. Gana quien lleva sus 4 Mega al centro.</p>'});
const TRACK=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const SAFE=new Set([0,8,13,21,26,34,39,47]);
const PLAYERS=[{start:0,home:[[7,1],[7,2],[7,3],[7,4],[7,5]],nests:[[1,1],[1,4],[4,1],[4,4]],base:(r,c)=>r<6&&c<6},{start:26,home:[[7,13],[7,12],[7,11],[7,10],[7,9]],nests:[[10,10],[10,13],[13,10],[13,13]],base:(r,c)=>r>8&&c>8}];
const GOAL=56,KEY='luma-ludo-teams';
let teams=load(KEY,{p1:0,p2:1,cpu:false}),state=null,busy=false;
const p1=familyPicker($('pick1'),{selected:teams.p1,onPick:v=>{teams.p1=v;save(KEY,teams);}}),p2=familyPicker($('pick2'),{selected:teams.p2,onPick:v=>{teams.p2=v;save(KEY,teams);}});
$('cpu').checked=teams.cpu;$('cpu').onchange=()=>{teams.cpu=$('cpu').checked;save(KEY,teams);};
const cellOf=(p,pos)=>pos===GOAL?[7,7]:pos>=51?PLAYERS[p].home[pos-51]:TRACK[(PLAYERS[p].start+pos)%52];
const stageOf=(fam,pos)=>{const n=FAMILIES[fam].line.length-1;if(pos<0)return 0;if(pos>=51)return n;return Math.min(n,1+Math.floor(pos/17));};
function buildBoard(){
 const board=$('board');board.replaceChildren();
 const trackSet=new Map(TRACK.map(([r,c],i)=>[r*15+c,i]));
 for(let r=0;r<15;r++)for(let c=0;c<15;c++){const d=document.createElement('div');d.className='sq';const t=trackSet.get(r*15+c);
  if(r>=6&&r<=8&&c>=6&&c<=8)d.classList.add('center');
  else if(t!==undefined){if(SAFE.has(t))d.classList.add('safe');if(t===0)d.classList.add('start1');if(t===26)d.classList.add('start2');}
  else if(r===7&&c>=1&&c<=5)d.classList.add('home1');else if(r===7&&c>=9&&c<=13)d.classList.add('home2');
  else if(PLAYERS[0].base(r,c)){d.classList.add('base1');if(PLAYERS[0].nests.some(([a,b])=>a===r&&b===c))d.classList.add('nest');}
  else if(PLAYERS[1].base(r,c)){d.classList.add('base2');if(PLAYERS[1].nests.some(([a,b])=>a===r&&b===c))d.classList.add('nest');}
  else d.style.background='#e3eadb';
  d.dataset.rc=r+','+c;board.append(d);}
 board.append($('dice'));
}
function start(){
 state={players:[{family:teams.p1,tokens:[-1,-1,-1,-1]},{family:teams.p2,tokens:[-1,-1,-1,-1]}],turn:0,dice:null,movable:[],winner:null,cpu:teams.cpu};
 document.documentElement.style.setProperty('--c1',FAMILIES[teams.p1].color);document.documentElement.style.setProperty('--c2',FAMILIES[teams.p2].color);
 $('setup').hidden=true;$('game').hidden=false;buildBoard();
 [0,1].forEach(i=>{const w=$('who'+(i+1)),f=FAMILIES[state.players[i].family];w.style.setProperty('--c',f.color);w.querySelector('img').src=stageSprite(state.players[i].family,1);w.querySelector('b').textContent=f.name+(i===1&&state.cpu?' (CPU)':'');});
 $('lines').innerHTML=[0,1].map(i=>{const p=state.players[i],f=FAMILIES[p.family];return `<div style="--c:${f.color}">${f.files.map((_,s)=>`<img src="${stageSprite(p.family,s)}" title="${f.line[s]}" alt="${f.line[s]}">`).join('<span>›</span>')}</div>`;}).join('');
 say('Empieza '+FAMILIES[state.players[0].family].name+'. ¡Tirá el dado!');render();
}
function say(m){$('message').textContent=m;}
function render(){
 const board=$('board');board.querySelectorAll('.tok').forEach(t=>t.remove());board.querySelectorAll('.sq.movable').forEach(s=>s.classList.remove('movable'));
 const groups=new Map();
 state.players.forEach((p,pi)=>p.tokens.forEach((pos,ti)=>{const [r,c]=pos<0?PLAYERS[pi].nests[ti]:cellOf(pi,pos);const k=r+','+c;if(!groups.has(k))groups.set(k,[]);groups.get(k).push({pi,ti,pos,r,c});}));
 for(const list of groups.values()){const n=list.length,size=n===1?86:n===2?62:50;list.forEach((t,i)=>{const img=document.createElement('img');img.className='tok p'+(t.pi+1)+(t.pos===GOAL?' goal':'');const mv=t.pi===state.turn&&state.movable.includes(t.ti);if(mv)img.classList.add('movable');img.src=stageSprite(state.players[t.pi].family,stageOf(state.players[t.pi].family,t.pos));img.title=FAMILIES[state.players[t.pi].family].line[stageOf(state.players[t.pi].family,t.pos)];const off=n===1?7:n===2?(i?36:2):(i%2?48:2),offY=n<=2?7:(i<2?2:48);img.style.cssText=`width:${size/15}%;height:${size/15}%;left:${(t.c*100+off)/15}%;top:${(t.r*100+offY)/15}%`;img.onclick=()=>moveToken(t.ti);board.append(img);if(mv)board.querySelector(`[data-rc="${t.r},${t.c}"]`)?.classList.add('movable');});}
 [0,1].forEach(i=>$('who'+(i+1)).classList.toggle('active',state.turn===i&&!state.winner));
 $('turn').textContent=state.winner!==null?'FIN':FAMILIES[state.players[state.turn].family].name;
 $('roll').disabled=busy||state.winner!==null||state.movable.length>0;
}
function roll(){
 if(busy||state.winner!==null||state.movable.length)return;busy=true;sfx.tick();
 const d=$('dice');d.classList.add('rolling');state.dice=1+rand(6);setTimeout(()=>{d.classList.remove('rolling');d.textContent=state.dice;busy=false;
  const p=state.players[state.turn];state.movable=p.tokens.map((pos,i)=>pos<0?(state.dice===6?i:-1):pos+state.dice<=GOAL?i:-1).filter(i=>i>=0);
  if(!state.movable.length){say('Sin movimientos para '+FAMILIES[p.family].name+'.');render();setTimeout(nextTurn,900);return;}
  say('Tocá la ficha que querés mover.');render();
  if(state.movable.length===1)setTimeout(()=>moveToken(state.movable[0]),450);
  else if(state.cpu&&state.turn===1)setTimeout(()=>moveToken(cpuChoice()),600);
 },420);
}
function cpuChoice(){
 const p=state.players[1],other=state.players[0];let best=null,bestScore=-1;
 for(const i of state.movable){const pos=p.tokens[i],np=pos<0?0:pos+state.dice;let s=np===GOAL?90:pos<0?70:np;
  if(np<51){const [r,c]=cellOf(1,np);const idx=(PLAYERS[1].start+np)%52;if(!SAFE.has(idx)&&other.tokens.some(op=>op>=0&&op<51&&cellOf(0,op)[0]===r&&cellOf(0,op)[1]===c))s=100;}
  if(s>bestScore){bestScore=s;best=i;}}
 return best;
}
function moveToken(ti){
 if(!state.movable.includes(ti)||busy)return;const pi=state.turn,p=state.players[pi];
 const pos=p.tokens[ti],np=pos<0?0:pos+state.dice;p.tokens[ti]=np;state.movable=[];sfx.ok();let msg=FAMILIES[p.family].line[stageOf(p.family,np)]+' avanza.';
 if(np<51){const idx=(PLAYERS[pi].start+np)%52;const [r,c]=TRACK[idx];const other=state.players[1-pi];
  if(!SAFE.has(idx))other.tokens.forEach((op,oi)=>{if(op>=0&&op<51){const [orr,oc]=cellOf(1-pi,op);if(orr===r&&oc===c){other.tokens[oi]=-1;msg='¡'+FAMILIES[p.family].line[stageOf(p.family,np)]+' manda a '+FAMILIES[other.family].name+' a su base!';sfx.hit();}}});}
 if(np===GOAL){msg='✦ ¡'+FAMILIES[p.family].line[FAMILIES[p.family].line.length-1]+' llegó a la meta!';sfx.win();}
 if(stageOf(p.family,pos)!==stageOf(p.family,np)&&np!==GOAL)msg='¡Digievolución! '+FAMILIES[p.family].line[stageOf(p.family,np)]+'.';
 if(p.tokens.every(t=>t===GOAL)){state.winner=pi;say('🏆 ¡'+FAMILIES[p.family].name+' gana la partida!');sfx.win();render();return;}
 say(msg);
 if(state.dice===6){render();say(msg+' Repetís turno.');if(state.cpu&&state.turn===1)setTimeout(roll,700);return;}
 render();setTimeout(nextTurn,500);
}
function nextTurn(){state.turn=1-state.turn;state.movable=[];$('dice').textContent='?';say('Turno de '+FAMILIES[state.players[state.turn].family].name+'.');render();if(state.cpu&&state.turn===1)setTimeout(roll,600);}
$('start').onclick=start;$('roll').onclick=roll;$('dice').onclick=roll;
$('restart').onclick=()=>{$('game').hidden=true;$('setup').hidden=false;state=null;};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&state&&!$('dialog')?.open){e.preventDefault();roll();}});
