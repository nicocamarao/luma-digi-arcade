import {FAMILIES,stageSprite,familyPicker,header,sfx,rand,$,save,load} from '../shared/digi.js';
header($('app'),{kicker:'LUMA · DIGI ARCADE',title:'Tateti',em:'4×4',help:'<p>Como el tateti de siempre, pero en un tablero más grande.</p><p>Gana quien pone <b>3 fichas seguidas</b> en fila, columna o diagonal. En 4×4 hay muchas más líneas: ¡mirá bien las diagonales cortas!</p><p>Podés jugar de a dos o contra la computadora.</p>'});
const KEY='luma-tateti';let cfg=load(KEY,{p1:0,p2:7,cpu:true}),wins=[0,0],board,turn,over,starter=0,busy=false;
familyPicker($('pick1'),{selected:cfg.p1,onPick:v=>{cfg.p1=v;save(KEY,cfg);}});familyPicker($('pick2'),{selected:cfg.p2,onPick:v=>{cfg.p2=v;save(KEY,cfg);}});
$('cpu').checked=cfg.cpu;$('cpu').onchange=()=>{cfg.cpu=$('cpu').checked;save(KEY,cfg);};
const LINES=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){const r2=r+2*dr,c2=c+2*dc;if(r2>=0&&r2<4&&c2>=0&&c2<4)LINES.push([r*4+c,(r+dr)*4+c+dc,r2*4+c2]);}
const fam=i=>i?cfg.p2:cfg.p1;
const winner=b=>{for(const l of LINES){const v=b[l[0]];if(v!==null&&v===b[l[1]]&&v===b[l[2]])return {p:v,line:l};}return null;};
function startRound(){board=Array(16).fill(null);turn=starter;over=false;$('setup').hidden=true;$('game').hidden=false;
 [0,1].forEach(i=>{const w=$('who'+(i+1)),f=FAMILIES[fam(i)];w.style.setProperty('--c',f.color);w.querySelector('img').src=stageSprite(fam(i),1);w.querySelector('b').textContent=f.line[1]+(i&&cfg.cpu?' (CPU)':'');w.querySelector('.wins').textContent=wins[i];});
 render();say('Empieza '+FAMILIES[fam(turn)].line[1]+'.');if(cfg.cpu&&turn===1)setTimeout(cpuMove,500);}
function say(m){$('message').textContent=m;}
function render(winLine){
 $('grid').replaceChildren(...board.map((v,i)=>{const b=document.createElement('button');b.className='cell'+(winLine?.includes(i)?' win':'');b.setAttribute('aria-label','Casilla '+(i+1)+(v!==null?': '+FAMILIES[fam(v)].line[1]:''));if(v!==null){b.style.setProperty('--c',FAMILIES[fam(v)].color);b.innerHTML=`<img src="${stageSprite(fam(v),1)}" alt="">`;}b.disabled=over||v!==null||(cfg.cpu&&turn===1);b.onclick=()=>play(i);return b;}));
 [0,1].forEach(i=>$('who'+(i+1)).classList.toggle('active',!over&&turn===i));
}
function play(i){
 if(over||board[i]!==null)return;board[i]=turn;sfx.tick();const w=winner(board);
 if(w){over=true;wins[w.p]++;starter=1-starter;render(w.line);say('🏆 ¡'+FAMILIES[fam(w.p)].line[1]+' hizo tres en línea!');sfx.win();$('who'+(w.p+1)).querySelector('.wins').textContent=wins[w.p];return;}
 if(board.every(v=>v!==null)){over=true;starter=1-starter;render();say('Empate. ¡Tablero lleno!');return;}
 turn=1-turn;render();say('Turno de '+FAMILIES[fam(turn)].line[1]+'.');if(cfg.cpu&&turn===1)setTimeout(cpuMove,450);
}
function cpuMove(){
 if(over)return;const empties=board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);let best=[],bestScore=-Infinity;
 for(const i of empties){let s=0;const b=[...board];b[i]=1;if(winner(b))s+=1000;b[i]=0;if(winner(b))s+=500;
  for(const l of LINES){if(!l.includes(i))continue;const vals=l.map(k=>board[k]);if(!vals.includes(0))s+=4+vals.filter(v=>v===1).length*6;if(!vals.includes(1))s+=2+vals.filter(v=>v===0).length*3;}
  s+=Math.random();if(s>bestScore){bestScore=s;best=i;}}
 play(best);
}
$('start').onclick=()=>{wins=[0,0];starter=0;startRound();};$('again').onclick=startRound;$('menu').onclick=()=>{$('game').hidden=true;$('setup').hidden=false;};
