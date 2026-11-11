// Datos compartidos de los juegos de Luma Digi Arcade.
// Todos los sprites salen del DigiDex de Luma (carpeta ../digidex).
export const FAMILIES=[
 {name:'Agumon',kid:'Tai',kidFile:'tai',color:'#e9a14b',gen:1,line:['Koromon','Agumon','Greymon','MetalGreymon','WarGreymon'],files:['koromon','agumon','greymon','metalgreymon','wargreymon']},
 {name:'Gabumon',kid:'Matt',kidFile:'matt',color:'#6aabe0',gen:1,line:['Tsunomon','Gabumon','Garurumon','WereGarurumon','MetalGarurumon'],files:['tsunomon','gabumon','garurumon','weregarurumon','metalgarurumon']},
 {name:'Biyomon',kid:'Sora',kidFile:'sora',color:'#e598b5',gen:1,line:['Yokomon','Biyomon','Birdramon','Garudamon'],files:['yokomon','piyomon','birdramon','garudamon']},
 {name:'Tentomon',kid:'Izzy',kidFile:'izzy',color:'#a695d5',gen:1,line:['Motimon','Tentomon','Kabuterimon','MegaKabuterimon'],files:['motimon','tentomon','kabuterimon','megakabuterimon']},
 {name:'Palmon',kid:'Mimi',kidFile:'mimi',color:'#89b974',gen:1,line:['Tanemon','Palmon','Togemon','Lillymon'],files:['tanemon','palmon','togemon','lillymon']},
 {name:'Gomamon',kid:'Joe',kidFile:'joe',color:'#7bbcc5',gen:1,line:['Bukamon','Gomamon','Ikkakumon','Zudomon'],files:['bukamon','gomamon','ikkakumon','zudomon']},
 {name:'Patamon',kid:'T.K.',kidFile:'tk',color:'#e0bc65',gen:1,line:['Tokomon','Patamon','Angemon','MagnaAngemon','Seraphimon'],files:['tokomon','patamon','angemon','magnaangemon','seraphimon']},
 {name:'Gatomon',kid:'Kari',kidFile:'kari',color:'#c5a8d7',gen:1,line:['Nyaromon','Salamon','Gatomon','Angewomon','Magnadramon'],files:['nyaromon','salamon','tailmon','angewomon','magnadramon']},
 {name:'Veemon',kid:'Davis',kidFile:'davis',color:'#6ba0d7',gen:2,line:['DemiVeemon','Veemon','ExVeemon','Paildramon','Imperialdramon'],files:['demiveemon','veemon','exveemon','paildramon','imperialdramon']},
 {name:'Hawkmon',kid:'Yolei',kidFile:'yolei',color:'#c48175',gen:2,line:['Poromon','Hawkmon','Aquilamon','Silphymon','Valkyrimon'],files:['poromon','hawkmon','aquillamon','silphymon','valkyrimon']},
 {name:'Armadillomon',kid:'Cody',kidFile:'cody',color:'#c5ad63',gen:2,line:['Upamon','Armadillomon','Ankylomon','Shakkoumon','Vikemon'],files:['upamon','armadillomon','ankylomon','shakkoumon','vikemon']},
 {name:'Wormmon',kid:'Ken',kidFile:'ken',color:'#8aaf6e',gen:2,line:['Minomon','Wormmon','Stingmon','Dinobeemon','Imperialdramon FM'],files:['minomon','wormmon','stingmon','dinobeemon','imperialdramon-fighter']},
 {name:'Guilmon',kid:'Takato',kidFile:'takato',color:'#e26d5a',gen:3,line:['Gigimon','Guilmon','Growlmon','WarGrowlmon','Gallantmon'],files:['gigimon','guilmon','growlmon','wargrowlmon','gallantmon']},
 {name:'Terriermon',kid:'Henry',kidFile:'henry',color:'#58c997',gen:3,line:['Gummymon','Terriermon','Gargomon','Rapidmon','MegaGargomon'],files:['gummymon','terriermon','gargomon','rapidmon','megagargomon']},
 {name:'Renamon',kid:'Rika',kidFile:'rika',color:'#f2c14e',gen:3,line:['Viximon','Renamon','Kyubimon','Taomon','Sakuyamon'],files:['viximon','renamon','kyubimon','taomon','sakuyamon']}
];
// Otros Digimon del DigiDex que no están en las líneas principales (armor, extras).
export const EXTRA=['flamedramon','raidramon','magnamon','halsemon','shurimon','digmon','submarimon','omnimon','botamon','punimon','nyokimon','pabumon','yuramon','pichimon','poyomon','snowbotamon','chibomon','pururumon','tsubumon','leafmon','jyarimon','zerimon','relemon','megidramon','gallantmon-crimson'];
export const ALL_FILES=[...new Set([...FAMILIES.flatMap(f=>f.files),...EXTRA])];
export const prettyName=file=>{const f=FAMILIES.find(x=>x.files.includes(file));if(f)return f.line[f.files.indexOf(file)];const m={flamedramon:'Flamedramon',raidramon:'Raidramon',magnamon:'Magnamon',halsemon:'Halsemon',shurimon:'Shurimon',digmon:'Digmon',submarimon:'Submarimon',omnimon:'Omnimon',botamon:'Botamon',punimon:'Punimon',nyokimon:'Nyokimon',pabumon:'Pabumon',yuramon:'Yuramon',pichimon:'Pichimon',poyomon:'Poyomon',snowbotamon:'SnowBotamon',chibomon:'Chibomon',pururumon:'Pururumon',tsubumon:'Tsubumon',leafmon:'Leafmon',jyarimon:'Jyarimon',zerimon:'Zerimon',relemon:'Relemon',megidramon:'Megidramon','gallantmon-crimson':'Gallantmon Crimson'};return m[file]||file;};
export const LEVELS=['BEBÉ','NOVATO','CAMPEÓN','ULTRA','MEGA'];
export const levelName=(family,stage)=>{const n=FAMILIES[family].line.length;return n===4&&stage===3?'ULTRA':LEVELS[stage];};

const ROOT=new URL('../digidex/',import.meta.url).href;
export const sprite=file=>ROOT+file+'.jpg';
export const stageSprite=(family,stage)=>sprite(FAMILIES[family].files[stage]);
export const kidSprite=file=>ROOT+'children/'+file+'.jpg';

const cache=new Map();
export function loadImage(src){
 if(cache.has(src))return cache.get(src);
 const p=new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});
 cache.set(src,p);return p;
}
export const imageSync=src=>{const p=cache.get(src);if(!p){loadImage(src);return null;}return p.ready||null;};
export async function preload(list){const imgs=await Promise.all(list.map(loadImage));list.forEach((src,i)=>{cache.get(src).ready=imgs[i];});return imgs;}

// Dibuja un sprite como "sticker" redondo en canvas (clip circular + borde).
export function drawSticker(ctx,img,x,y,size,opts={}){
 const r=size/2;ctx.save();
 if(opts.flip){ctx.translate(x+r,0);ctx.scale(-1,1);ctx.translate(-(x+r),0);}
 ctx.beginPath();ctx.arc(x+r,y+r,r,0,Math.PI*2);ctx.closePath();
 ctx.fillStyle=opts.bg||'#fff';ctx.fill();ctx.clip();
 if(img)ctx.drawImage(img,x,y,size,size);
 ctx.restore();
 ctx.save();ctx.beginPath();ctx.arc(x+r,y+r,r,0,Math.PI*2);ctx.lineWidth=opts.lineWidth||3;ctx.strokeStyle=opts.border||'#244f3d';ctx.stroke();ctx.restore();
}

// Sonido simple (osciladores) compartido. Empieza silenciado.
export const sfx={muted:true,ctx:null,
 play(notes,len=.2,type='sine'){if(this.muted)return;try{this.ctx??=new AudioContext();this.ctx.resume();notes.forEach((n,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime+i*.085;o.type=type;o.frequency.value=n;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+len+.02);});}catch{}},
 ok(){this.play([440,660]);},win(){this.play([392,523,659,784],.25);},bad(){this.play([220,160],.25,'square');},tick(){this.play([880],.08);},hit(){this.play([180,120],.12,'sawtooth');},jump(){this.play([330,520],.1);}
};
export function soundButton(btn){const paint=()=>{btn.textContent=sfx.muted?'♫':'♪';btn.setAttribute('aria-label',sfx.muted?'Activar sonido':'Silenciar sonido');};btn.onclick=()=>{sfx.muted=!sfx.muted;paint();sfx.ok();};paint();}

export const $=id=>document.getElementById(id);
export const rand=n=>Math.floor(Math.random()*n);
export const pick=arr=>arr[rand(arr.length)];
export const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// Teclado: conjunto de teclas presionadas (e.code) y "pulsaciones" de un frame.
export function keyboard(target=window){
 const down=new Set(),pressed=new Set();
 target.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!down.has(e.code))pressed.add(e.code);down.add(e.code);});
 target.addEventListener('keyup',e=>down.delete(e.code));
 window.addEventListener('blur',()=>down.clear());
 return {down,pressed,is:(...codes)=>codes.some(c=>down.has(c)),hit:(...codes)=>codes.some(c=>pressed.has(c)),flush:()=>pressed.clear()};
}

// Selector de familia/compañero reutilizable (devuelve el índice elegido).
export function familyPicker(container,{selected=0,onPick,label=f=>f.line[1],stage=1,kids=false}={}){
 const paint=()=>{container.replaceChildren(...FAMILIES.map((f,i)=>{const b=document.createElement('button');b.className='pick'+(i===selected?' active':'');b.style.setProperty('--c',f.color);b.innerHTML=`<img src="${kids?kidSprite(f.kidFile):stageSprite(i,stage)}" alt=""><b>${kids?f.kid:label(f)}</b><small>${kids?f.line[1]:'GEN '+f.gen}</small>`;b.onclick=()=>{selected=i;paint();onPick?.(i);};return b;}));};
 paint();return {get value(){return selected;},set value(v){selected=v;paint();}};
}

// Encabezado estándar de los juegos.
export function header(root,{kicker,title,em,help}){
 root.insertAdjacentHTML('afterbegin',`<header class="gamehead"><a class="back" href="../index.html" title="Volver a Luma Digi Arcade">←</a><div class="brand"><span class="brand-icon">✦</span><div><small>${kicker}</small><h1>${title} <em>${em||''}</em></h1></div></div><div class="tools"><button id="sound" aria-label="Activar sonido">♫</button>${help?'<button id="help">Cómo jugar</button>':''}</div></header>`);
 soundButton(root.querySelector('#sound'));
 root.querySelector('.back').onclick=e=>{if(window.parent!==window){e.preventDefault();window.parent.postMessage('luma-back','*');}};
 if(help){const d=document.createElement('dialog');d.id='dialog';d.innerHTML=`<button class="close" aria-label="Cerrar">×</button><small>MANUAL DEL DIGIELEGIDO</small><h2>${title}</h2>${help}<button class="primary" id="dialog-ok">¡Al Mundo Digital!</button>`;document.body.append(d);root.querySelector('#help').onclick=()=>d.showModal();d.querySelector('.close').onclick=d.querySelector('#dialog-ok').onclick=()=>d.close();}
}
export const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
export const load=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback;}catch{return fallback;}};
