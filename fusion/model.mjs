export const FAMILIES=[
 {name:'Agumon',color:'#e9a14b',gen:1,line:['Koromon','Agumon','Greymon','MetalGreymon','WarGreymon'],files:['koromon','agumon','greymon','metalgreymon','wargreymon']},
 {name:'Gabumon',color:'#6aabe0',gen:1,line:['Tsunomon','Gabumon','Garurumon','WereGarurumon','MetalGarurumon'],files:['tsunomon','gabumon','garurumon','weregarurumon','metalgarurumon']},
 {name:'Biyomon',color:'#e598b5',gen:1,line:['Yokomon','Biyomon','Birdramon','Garudamon'],files:['yokomon','piyomon','birdramon','garudamon']},
 {name:'Tentomon',color:'#a695d5',gen:1,line:['Motimon','Tentomon','Kabuterimon','MegaKabuterimon'],files:['motimon','tentomon','kabuterimon','megakabuterimon']},
 {name:'Palmon',color:'#89b974',gen:1,line:['Tanemon','Palmon','Togemon','Lillymon'],files:['tanemon','palmon','togemon','lillymon']},
 {name:'Gomamon',color:'#7bbcc5',gen:1,line:['Bukamon','Gomamon','Ikkakumon','Zudomon'],files:['bukamon','gomamon','ikkakumon','zudomon']},
 {name:'Patamon',color:'#e0bc65',gen:1,line:['Tokomon','Patamon','Angemon','MagnaAngemon','Seraphimon'],files:['tokomon','patamon','angemon','magnaangemon','seraphimon']},
 {name:'Gatomon',color:'#c5a8d7',gen:1,line:['Nyaromon','Salamon','Gatomon','Angewomon','Magnadramon'],files:['nyaromon','salamon','tailmon','angewomon','magnadramon']},
 {name:'Veemon',color:'#6ba0d7',gen:2,line:['DemiVeemon','Veemon','ExVeemon','Paildramon','Imperialdramon'],files:['demiveemon','veemon','exveemon','paildramon','imperialdramon']},
 {name:'Hawkmon',color:'#c48175',gen:2,line:['Poromon','Hawkmon','Aquilamon','Silphymon','Valkyrimon'],files:['poromon','hawkmon','aquillamon','silphymon','valkyrimon']},
 {name:'Armadillomon',color:'#c5ad63',gen:2,line:['Upamon','Armadillomon','Ankylomon','Shakkoumon','Vikemon'],files:['upamon','armadillomon','ankylomon','shakkoumon','vikemon']},
 {name:'Wormmon',color:'#8aaf6e',gen:2,line:['Minomon','Wormmon','Stingmon','Dinobeemon','Imperialdramon Fighter Mode'],files:['minomon','wormmon','stingmon','dinobeemon','imperialdramon-fighter']}
];
export const initialState=()=>({version:1,board:Array.from({length:36},(_,i)=>i===14||i===15?{family:0,stage:0}:i===20?{family:1,stage:0}:i===21?{family:6,stage:0}:null),score:0,focus:0,complete:[],merges:0});
export function move(state,from,to){
 if(from===to||!state.board[from])return null;
 const a=state.board[from],b=state.board[to];
 if(b&&(a.family!==b.family||a.stage!==b.stage))return null;
 const next=structuredClone(state);next.board[from]=null;
 if(!b){next.board[to]=a;return {state:next,type:'move'};}
 const stage=a.stage+1,family=FAMILIES[a.family];
 next.merges++;next.score+=10*2**stage;
 if(stage===family.line.length-1){next.board[to]=null;if(!next.complete.includes(a.family))next.complete.push(a.family);return {state:next,type:'guardian',name:family.line[stage]};}
 next.board[to]={family:a.family,stage};return {state:next,type:'merge',name:family.line[stage]};
}
export function spawn(state,random=Math.random){const free=state.board.map((v,i)=>v?null:i).filter(v=>v!==null);if(!free.length)return null;const next=structuredClone(state);const pos=free[Math.floor(random()*free.length)];const stage=random()<.12?1:0;next.board[pos]={family:state.focus,stage};return {state:next,name:FAMILIES[state.focus].line[stage]};}
export function pairs(board){const seen=new Map();for(let i=0;i<board.length;i++){const d=board[i];if(!d)continue;const k=d.family+':'+d.stage;if(seen.has(k))return [seen.get(k),i];seen.set(k,i);}return null;}
export function valid(s){return s?.version===1&&Array.isArray(s.board)&&s.board.length===36&&s.board.every(d=>d===null||(Number.isInteger(d.family)&&Number.isInteger(d.stage)&&d.family>=0&&d.family<12&&d.stage>=0&&d.stage<FAMILIES[d.family].line.length-1))&&Number.isFinite(s.score)&&s.score>=0&&Number.isInteger(s.focus)&&s.focus>=0&&s.focus<12&&Array.isArray(s.complete)&&s.complete.every(n=>Number.isInteger(n)&&n>=0&&n<12);}
