/* Jay's smileys: the common emoji faces and gestures, done her way — her own eyes, mouth and colour flushes,
   a few props (tongue, halo, glasses, steam, icicles…) and two little hands for the gestures.
   Each one is a mood called e_<name>, so poke('e_grin',3600) shows it. Say "do the grin face", "give me a hug",
   or "show me the smileys" for all of them in a row. Hooks in index.html: emoStart (onMood), emoFx (frame),
   emoDraw (after drawJay), emoCommand (what you said), emoSpiral (spiral eyes). */
(()=>{
const SV='http://www.w3.org/2000/svg';
const el=(tag,at,par)=>{ const e=document.createElementNS(SV,tag); for(const k in at) e.setAttribute(k,at[k]); if(par) par.appendChild(e); return e; };
const ease=x=>{ x=clamp(x,0,1); return x*x*(3-2*x); };
const HEART='M0 3C-6-2-9-6-5-9C-3-10-1-9 0-7C1-9 3-10 5-9C9-6 6-2 0 3Z';
const layer=el('g',{id:'emo','pointer-events':'none'},E.body);        // on her face: moves and tilts with her
const top=el('g',{'pointer-events':'none'},E.fx);                       // around her

/* ---------------- the smileys. eye: lid shapes (see MOODS), pu: pupils, mouth: see MOUTH, props: drawn below,
   eyes: 'chev' (> <), 'x', 'spiral' instead of her eyes, move(p,t): how she moves (p = 0…1 through it) */
const side=(x=7)=>()=>({tx:x,ty:1});
const EM={
  grin:       {e:'😀', eye:{bot:.2,bow:.1}, pu:'circle', mouth:{c:7,w:16,o:8}, flush:['#7fc4ff',.25]},
  big_grin:   {e:'😃', eye:{sz:1.06,es:1.06}, pu:'big', mouth:{c:7,w:17,o:10}, flush:['#7fc4ff',.3]},
  smile:      {e:'😄', base:'happy', mouth:{c:7,w:16,o:9}},
  beam:       {e:'😁', eye:{shut:1,cup:1,sz:1.04}, pu:'circle', mouth:{c:4,w:18,o:6}, props:['teeth_line'], blush:.5},
  laugh:      {e:'😆', eyes:'chev', mouth:{c:8,w:16,o:11}, props:['tongue'], blush:.5, move:(p,t)=>({by:-Math.abs(Math.sin(t*14))*4,rot:Math.sin(t*14)*3})},
  touched:    {e:'🥹', eye:{top:.1,sl:-.3,bot:.12}, pu:'plead', mouth:{c:3,w:7,wv:.35}, props:['welling'], blush:.6},
  sweat_smile:{e:'😅', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:7,w:15,o:8}, props:['sweat']},
  tears_of_joy:{e:'😂', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:8,w:16,o:11}, props:['tongue','joy_tears'], move:(p,t)=>({by:-Math.abs(Math.sin(t*13))*3,rot:Math.sin(t*13)*3})},
  rofl:       {e:'🤣', eyes:'chev', mouth:{c:8,w:16,o:11}, props:['tongue','joy_tears'], move:(p,t)=>({rot:ease(p*5)*24+Math.sin(t*9)*9,bx:Math.sin(t*9)*5})},
  smile_tear: {e:'🥲', base:'happy', mouth:{c:4,w:10}, props:['one_tear']},
  content:    {e:'☺️', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:4,w:9}, blush:.9},
  blush:      {e:'😊', eye:{shut:1,cup:1,bot:.2}, pu:'circle', mouth:{c:5,w:10}, blush:1, flush:['#ff5a7a',.25]},
  angel:      {e:'😇', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:5,w:10}, props:['halo'], blush:.5},
  slight_smile:{e:'🙂', pu:'circle', mouth:{c:3,w:9}},
  upside_down:{e:'🙃', pu:'circle', mouth:{c:4,w:9}, dur:4200, move:p=>({rot:180*ease(p/.18)*ease((1-p)/.18)})},
  wink:       {e:'😉', use:'wink'},
  relieved:   {e:'😌', eye:{shut:1,cup:0,sz:.98}, pu:'circle', mouth:{c:3,w:8}, blush:.4, move:(p,t)=>({jt:.05*Math.sin(p*Math.PI),tilt:-4})},
  heart_eyes: {e:'😍', base:'love', mouth:{c:7,w:15,o:8}},
  in_love:    {e:'🥰', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:5,w:10}, props:['orbit_hearts'], blush:.9, flush:['#ff3b5c',.35]},
  blow_kiss:  {e:'😘', base:'wink', mouth:{r:1,w:4,o:1.5}, props:['kiss_heart'], blush:.6, quiet:1},
  kiss:       {e:'😗', pu:'circle', mouth:{r:1,w:4,o:1.5}},
  kiss_smile: {e:'😙', eye:{bot:.46,bow:.08}, pu:'joy', mouth:{r:1,w:4,o:1.5}},
  kiss_closed:{e:'😚', eye:{shut:1,cup:0}, pu:'circle', mouth:{r:1,w:4,o:1.5}, blush:.9},
  yum:        {e:'😋', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:5,w:10}, props:['tongue_side']},
  tongue:     {e:'😛', pu:'circle', mouth:{c:1.5,w:10,o:2}, props:['tongue']},
  tongue_squint:{e:'😝', eyes:'chev', mouth:{c:6,w:15,o:8}, props:['tongue']},
  tongue_wink:{e:'😜', eye:{shut:[0,1],bot:[.2,0],bow:.3,es:[1.08,1]}, pu:'big', mouth:{c:4,w:11,o:4}, props:['tongue']},
  zany:       {e:'🤪', eye:{es:[1.18,.78]}, pu:'odd', mouth:{c:5,w:12,o:5}, props:['tongue'], move:(p,t)=>({tilt:12,rot:Math.sin(t*3.2)*5,tx:Math.sin(t*5)*3})},
  raised_brow:{e:'🤨', eye:{top:[0,.36],sl:[0,.22],es:[1.07,.9]}, pu:'small', mouth:{c:0,w:7,k:-4}, move:()=>({tilt:-5})},
  monocle:    {e:'🧐', eye:{top:[.28,0],sl:[.15,0],es:[.95,1.1]}, pu:'small', mouth:{c:-1,w:6,k:3}, props:['monocle'], move:()=>({tilt:-4,ty:-1})},
  nerd:       {e:'🤓', pu:'circle', mouth:{c:5,w:10,o:2}, props:['glasses','buck_teeth']},
  cool:       {e:'😎', use:'cool'},
  disguise:   {e:'🥸', pu:'circle', mouth:{c:2,w:8}, props:['glasses','nose','tache','brows'], move:(p,t)=>({tx:Math.sin(t*1.6)*5})},
  star_struck:{e:'🤩', base:'excited', mouth:{c:7,w:16,o:9}},
  party:      {e:'🥳', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:4,w:9}, props:['party_hat','horn'], blush:.6, start:()=>confetti(24), move:(p,t)=>({tilt:-6,by:-Math.abs(Math.sin(t*5))*3})},
  smirk:      {e:'😏', eye:{top:.34,sl:[.12,-.04],bot:.1}, pu:'small', mouth:{c:2,w:8,k:6}, move:side(7)},
  unamused:   {e:'😒', eye:{top:.48,sq:.9}, pu:'small', mouth:{c:-2.5,w:8}, move:side(8)},
  no:         {e:'🙂‍↔️', pu:'circle', mouth:{c:1,w:8}, props:['motion'], move:(p,t)=>({tx:Math.sin(t*11)*8,bx:Math.sin(t*11)*5})},
  yes:        {e:'🙂‍↕️', base:'happy', mouth:{c:4,w:9}, move:(p,t)=>({ty:Math.sin(t*9)*7,by:Math.sin(t*9)*3})},
  disappointed:{e:'😞', eye:{top:.46,sl:-.42,bot:.06}, pu:'small', mouth:{c:-3.5,w:9}, move:()=>({ty:6,tilt:-3})},
  pensive:    {e:'😔', eye:{shut:1,cup:0,sl:-.3}, pu:'circle', mouth:{c:-2.5,w:8}, move:()=>({ty:5,tilt:-5,by:2})},
  worried:    {e:'😟', eye:{top:.12,sl:-.5,es:1.03}, pu:'circle', mouth:{c:-3,w:9,o:1}},
  confused:   {e:'😕', use:'confused'},
  slight_frown:{e:'🙁', pu:'circle', mouth:{c:-2.5,w:8}},
  frown:      {e:'☹️', eye:{top:.06,sl:-.2}, pu:'circle', mouth:{c:-4.5,w:10}},
  persevere:  {e:'😣', eyes:'chev', mouth:{c:-3,w:9,wv:.6}, move:(p,t)=>({bx:Math.sin(t*40)*.8,jt:.06})},
  confounded: {e:'😖', eyes:'chev', mouth:{wv:1,w:10}, move:(p,t)=>({bx:Math.sin(t*40)*1,jt:.08})},
  tired:      {e:'😫', eyes:'chev', mouth:{c:-4,w:10,o:5}, move:(p,t)=>({by:Math.sin(t*3)*2,tilt:-5})},
  weary:      {e:'😩', eye:{top:.3,sl:-.55,bot:.1}, pu:'plead', mouth:{c:-4,w:10,o:4}, move:()=>({tilt:-8,ty:-4})},
  pleading:   {e:'🥺', use:'pleading'},
  cry:        {e:'😢', use:'sad'},
  sob:        {e:'😭', eye:{shut:1,cup:0,sl:-.3}, pu:'circle', mouth:{c:-5,w:12,o:7}, props:['streams'], move:(p,t)=>({by:Math.sin(t*18)*1.5,tilt:-4})},
  huff:       {e:'😤', eye:{top:.3,sl:.5,shut:.6,cup:0}, pu:'small', mouth:{c:-2,w:8}, props:['steam'], flush:['#e8452c',.35], move:(p,t)=>({jt:-.05-.03*Math.abs(Math.sin(t*4))})},
  angry:      {e:'😠', use:'angry'},
  rage:       {e:'😡', base:'angry', mouth:{c:-4,w:10,o:1}, flush:['#c4001a',1], move:(p,t)=>({bx:Math.sin(t*44)*1.6})},
  cursing:    {e:'🤬', base:'angry', props:['grawlix'], flush:['#a3001a',.9], move:(p,t)=>({bx:Math.sin(t*44)*1.8})},
  mind_blown: {e:'🤯', base:'scared', mouth:{r:1,w:6,o:7}, props:['boom'], flush:['#ff9a2e',.5],
               start:()=>{ burstLines('#ffb347',14,80); shock('#ff8a00',true); flash('#ffcf70'); G.zoom.kick(.4); G.jelly.kick(-.8); }},
  flushed:    {e:'😳', eye:{sz:1.08,es:1.1}, pu:'dot', mouth:{r:1,w:4,o:2}, props:['red_cheeks'], blush:1, flush:['#ff4d6d',.45]},
  hot:        {e:'🥵', eye:{top:.32,sl:-.2}, pu:'small', mouth:{c:-1,w:10,o:5}, props:['tongue_pant','sweat','heat'], flush:['#ff3d1f',.8], move:(p,t)=>({by:Math.sin(t*6)*1.5})},
  cold:       {e:'🥶', eye:{es:1.06,top:.08,sl:-.25}, pu:'dot', props:['teeth','icicles'], flush:['#38c6ff',.8], move:(p,t)=>({bx:Math.sin(t*70)*1.4,jt:.05})},
  in_the_clouds:{e:'😶‍🌫️', eye:{top:.2}, pu:'small', props:['no_mouth','fog']},
  scream:     {e:'😱', eye:{sz:1.08,es:1.16}, pu:'dot', mouth:{r:1,w:8,o:13}, props:['hands_cheeks'], flush:['#9fd3ff',.55], move:(p,t)=>({bx:Math.sin(t*50)*1.2,jt:-.06})},
  fearful:    {e:'😨', eye:{top:.1,sl:-.45,es:1.08}, pu:'dot', mouth:{c:-3,w:9,o:4}, flush:['#6fa8ff',.45]},
  anxious:    {e:'😰', eye:{top:.1,sl:-.45,es:1.06}, pu:'dot', mouth:{c:-3,w:9,o:3}, props:['sweat'], flush:['#6fa8ff',.4]},
  sad_relieved:{e:'😥', eye:{top:.2,sl:-.45,bot:.08}, pu:'plead', mouth:{c:-2,w:6}, props:['sweat']},
  downcast:   {e:'😓', eye:{shut:1,cup:0,sl:-.3}, pu:'circle', mouth:{c:-2.5,w:8}, props:['sweat'], move:()=>({ty:4,tilt:-4})},
  hug:        {e:'🤗', eye:{shut:1,cup:1}, pu:'circle', mouth:{c:7,w:15,o:6}, props:['hands_hug'], blush:.7, move:(p,t)=>({by:-Math.abs(Math.sin(t*4))*3})},
  thinking:   {e:'🤔', eye:{top:[.05,.3],sl:[0,.2]}, pu:'small', mouth:{c:0,w:6,k:-4}, props:['hand_chin'], move:(p,t)=>({tx:-5,ty:-6,tilt:5})},
  peek:       {e:'🫣', pu:'circle', mouth:{r:1,w:4,o:2}, props:['hands_peek'], dur:4200, blush:.6},
  giggle:     {e:'🤭', eye:{bot:.46,bow:.08}, pu:'joy', props:['no_mouth','hand_mouth'], blush:.8, move:(p,t)=>({by:-Math.abs(Math.sin(t*9))*2})},
  gasp:       {e:'🫢', eye:{sz:1.06,es:1.1}, pu:'dot', props:['no_mouth','hand_mouth']},
  salute:     {e:'🫡', eye:{top:.18,sl:.12}, pu:'circle', mouth:{c:0,w:7}, props:['hand_salute'], move:()=>({tilt:-3,jt:-.04})},
  shush:      {e:'🤫', eye:{top:.15}, pu:'small', props:['no_mouth','hand_shush'], move:side(6)},
  melt:       {e:'🫠', pu:'circle', mouth:{c:4,w:10}, props:['drips'], dur:4400, move:p=>({jt:.26*ease(p/.4),by:14*ease(p/.4),tilt:8})},
  liar:       {e:'🤥', eye:{top:.22}, pu:'small', mouth:{c:-1,w:7,k:2}, props:['long_nose'], dur:4000, move:side(-6)},
  no_mouth:   {e:'😶', pu:'circle', props:['no_mouth']},
  invisible:  {e:'🫥', pu:'circle', props:['no_mouth','dotted'], dur:4000},
  neutral:    {e:'😐', pu:'circle', mouth:{c:0,w:9}},
  meh:        {e:'🫤', eye:{top:.2}, pu:'circle', mouth:{c:0,w:9,k:8}},
  expressionless:{e:'😑', eye:{shut:1,cup:.5}, pu:'circle', mouth:{c:0,w:9}},
  shaking:    {e:'🫨', eye:{es:1.08}, pu:'dot', mouth:{r:1,w:6,o:3}, props:['motion'], move:(p,t)=>({bx:Math.sin(t*55)*4,rot:Math.sin(t*47)*3})},
  grimace:    {e:'😬', eye:{es:1.06}, pu:'small', props:['teeth'], move:()=>({jt:.06})},
  eye_roll:   {e:'🙄', eye:{top:.2}, pu:'small', mouth:{c:0,w:8,k:-3}, move:p=>{ const a=Math.PI-ease((p-.1)/.5)*Math.PI; return {tx:Math.cos(a)*9,ty:-Math.abs(Math.sin(a))*9-(p>.6?9:0)}; }},
  hushed:     {e:'😯', eye:{es:1.05}, pu:'dot', mouth:{r:1,w:4,o:3}},
  frown_open: {e:'😦', pu:'dot', mouth:{c:-3,w:9,o:4}},
  anguished:  {e:'😧', eye:{top:.12,sl:-.5}, pu:'dot', mouth:{c:-4,w:10,o:6}},
  open_mouth: {e:'😮', pu:'circle', mouth:{r:1,w:6,o:6}},
  astonished: {e:'😲', eye:{sz:1.08,es:1.12}, pu:'dot', mouth:{r:1,w:7,o:9}, start:()=>{ burstLines('#ffffff',8,90); G.jelly.kick(-.6); }},
  yawn:       {e:'🥱', eye:{shut:1,cup:0}, pu:'circle', mouth:{r:1,w:6,o:8}, props:['hand_yawn','one_tear'], move:p=>({jt:-.09*Math.sin(clamp(p/.7,0,1)*Math.PI),tilt:-5})},
  exhausted:  {e:'🫩', eye:{top:.42,sq:.92}, pu:'small', mouth:{c:-1,w:8}, props:['bags'], move:(p,t)=>({ty:3,by:2,tilt:4})},
  sleeping:   {e:'😴', eye:{shut:1,cup:0}, pu:'rest', mouth:{r:1,w:3.5,o:1.5}, props:['zzz'], move:(p,t)=>({by:Math.sin(t*1.6)*2,tilt:4})},
  drool:      {e:'🤤', eye:{top:.4,bot:.2,bow:.3}, pu:'small', mouth:{c:3,w:9,o:2}, props:['drool'], move:()=>({tx:-4,ty:-5,tilt:-6})},
  sleepy:     {e:'😪', eye:{shut:1,cup:0}, pu:'circle', mouth:{c:-1,w:6}, props:['bubble'], move:(p,t)=>({by:Math.sin(t*1.8)*2,tilt:5})},
  exhale:     {e:'😮‍💨', eye:{shut:1,cup:0}, pu:'circle', mouth:{r:1,w:3.5,o:2}, props:['puff'], move:p=>({jt:-.05+.1*ease((p-.2)/.4)})},
  knocked_out:{e:'😵', eyes:'x', mouth:{r:1,w:5,o:4}, start:()=>dizzyStars(3200), move:(p,t)=>({tilt:Math.sin(t*3)*6})},
  dizzy_face: {e:'😵‍💫', eyes:'spiral', mouth:{wv:1,w:8,o:1}, start:()=>dizzyStars(3200), move:(p,t)=>({tx:Math.cos(t*7)*4,ty:Math.sin(t*7)*3,tilt:Math.sin(t*4.5)*10})},
};
// what you can call them by voice (besides the name itself, with spaces): "do the <x> face", "give me a <x>"
const ALIAS={'grinning':'grin','big smile':'big_grin','happy':'smile','beaming':'beam',laughing:'laugh','lol':'laugh',
  'holding back tears':'touched','crying with joy':'tears_of_joy','tears of joy':'tears_of_joy','laughing crying':'tears_of_joy',
  'rolling on the floor':'rofl','rolling on the floor laughing':'rofl','halo':'angel','innocent':'angel','upside down':'upside_down',
  'heart eyes':'heart_eyes','love':'in_love','hearts':'in_love','blowing a kiss':'blow_kiss','kiss':'blow_kiss','kissy':'kiss',
  'tongue out':'tongue','silly':'tongue_wink','crazy':'zany','goofy':'zany','suspicious':'raised_brow','eyebrow':'raised_brow',
  'fancy':'monocle','posh':'monocle','geek':'nerd','sunglasses':'cool','incognito':'disguise','star eyes':'star_struck','starstruck':'star_struck',
  'celebrate':'party','birthday':'party','sad':'cry','crying':'sob','sobbing':'sob','steam':'huff','mad':'angry','furious':'rage',
  'swearing':'cursing','exploding head':'mind_blown','mind blown':'mind_blown','embarrassed':'flushed','sweating':'hot','freezing':'cold',
  'shocked':'scream','scared':'fearful','nervous':'anxious','worried':'worried','hug':'hug','think':'thinking','hmm':'thinking',
  'peekaboo':'peek','peeking':'peek','oops':'giggle','hand over mouth':'giggle','salute':'salute','quiet':'shush','shh':'shush','melting':'melt',
  'lying':'liar','pinocchio':'liar','speechless':'no_mouth','straight':'neutral','blank':'expressionless','eyeroll':'eye_roll','eye roll':'eye_roll',
  'surprised':'open_mouth','wow':'astonished','tired':'exhausted','asleep':'sleeping','sleep':'sleeping','snoring':'sleeping','drooling':'drool',
  'relief':'exhale','sigh':'exhale','dead':'knocked_out','dizzy':'dizzy_face','nod':'yes','nodding':'yes','shake your head':'no','head shake':'no',
  'shake':'no','nope':'no','yep':'yes','chuckle':'giggle','cheeky':'tongue_wink','smug':'smirk','bored':'unamused','fed up':'weary','shy':'blush'};
const DEF_DUR=3600;

/* ---------------- register each one as a mood: e_<name> */
const BASE_EYE={top:0,sl:0,tc:0,bot:0,bow:0,sq:1,shut:0,es:1,cup:0,sz:1,tilt:0};
for(const n in EM){ const d=EM[n], k='e_'+n, b=d.base; d.k=k; d.name=n; if(d.use) continue;
  MOODS[k]=Object.assign({},BASE_EYE,b?MOODS[b]:{pu:'circle'},d.eye||{},d.pu?{pu:d.pu}:{});
  MOUTH[k]=d.mouth||MOUTH[b]||MOUTH.idle;
  AURA[k]=AURA[b]||AURA[(d.mouth&&d.mouth.c<0)?'sad':'happy'];
  if(d.blush!=null) BLUSH[k]=d.blush; else if(b&&BLUSH[b]!=null) BLUSH[k]=BLUSH[b];
  if(d.flush) FLUSH[k]=d.flush; else if(b&&FLUSH[b]) FLUSH[k]=FLUSH[b];
  d.k=k; d.name=n; }
const byMood=m=>m&&m[0]==='e'&&m[1]==='_'?EM[m.slice(2)]:null;
let cur=null, t0=0;
window.emoStart=m=>{ const d=byMood(m); cur=d; t0=performance.now(); if(d&&d.start) d.start(); };
const prog=()=>cur?clamp((performance.now()-t0)/(cur.dur||DEF_DUR),0,1):0;
window.emoFx=(m,ts,t,fx)=>{ const d=byMood(m); window.emoSpiral=!!(d&&d.eyes==='spiral');
  if(!d||!d.move) return fx; return Object.assign({},fx,d.move(prog(),t)); };
window.emote=(n,ms)=>{ const d=EM[n]; if(!d) return false; wake(); poke(d.use||d.k,ms||d.dur||DEF_DUR); return true; };

/* ---------------- props: each is built once, then drawn with its fade-in a (0…1) */
const S={ex:27.5, ey:-4.5, my:40, mo:0};          // eye centre x/y, mouth y, mouth opening — updated every frame
const C={pink:'#ff7d9c', pinkD:'#d9506f', water:'#bfe6ff', waterD:'#8fcfff', gold:'#ffd86b', white:'#ffffff'};
const hand=(par,pose)=>{        // a little mitten in her colour; pose: open (fingers up), point, flat
  const g=el('g',{fill:'var(--body1)',stroke:'var(--rim)','stroke-width':1.6,'stroke-linejoin':'round'},par);
  if(pose==='open') for(const x of [-10.5,-4.8,.9,6.6]) el('rect',{x,y:-23+(x===-10.5||x===6.6?3:0),width:5.6,height:16,rx:2.8},g);
  if(pose==='point') el('rect',{x:-3,y:-27,width:6,height:20,rx:3},g);
  if(pose==='flat'){ el('rect',{x:-11,y:-31,width:22,height:26,rx:7},g); el('path',{d:'M-5 -29V-12M0.5 -30V-12M6 -29V-12',fill:'none','stroke-width':1.1},g); }
  el('rect',{x:-11.5,y:-11,width:23,height:22,rx:9},g);
  el('ellipse',{cx:-13,cy:1,rx:4.6,ry:7.5,transform:'rotate(-28 -13 1)'},g);
  if(pose==='point') el('path',{d:'M-8 -3Q0 1 8 -3',fill:'none','stroke-width':1.2},g);
  return g; };
// place a hand: from below her (a=0) up to (x,y) turned r degrees, mirrored for her left
const putHand=(g,a,x,y,r,mir,s=1.25)=>{ const e=1-Math.pow(1-a,3);
  g.setAttribute('transform',`translate(${f1(x)},${f1(lerp(y+95,y,e))}) rotate(${f1(r*e)}) scale(${mir?-s:s},${s})`); g.setAttribute('opacity',f1(Math.min(1,a*1.4))); };
let lastSpawn={};
const every=(key,ms,now)=>{ if(now-(lastSpawn[key]||0)<ms) return false; lastSpawn[key]=now; return true; };
function particle(par,node,life,upd){ const t0=performance.now(); par.appendChild(node);
  parts.push((now,dt)=>{ const p=(now-t0)/life; if(p>=1){ node.remove(); return false; } upd(node,p,dt); return true; }); }
const puff=(par,x,y,vx,vy,col,r0,grow,life)=>{ const c=el('circle',{fill:col}); let X=x,Y=y;
  particle(par,c,life,(n,p,dt)=>{ X+=vx*dt; Y+=vy*dt; n.setAttribute('cx',f1(X)); n.setAttribute('cy',f1(Y)); n.setAttribute('r',f1(r0+grow*eOut(p))); n.setAttribute('opacity',(.75*(1-p)).toFixed(2)); }); };
const tongueD=(w,l)=>`M${-w} 0L${w} 0L${w} ${l-w}A${w} ${w} 0 0 1 ${-w} ${l-w}Z`;

const PROPS={
  tongue:{ build:g=>{ el('path',{d:tongueD(5.5,13),fill:C.pink},g); el('path',{d:'M0 2V8',stroke:C.pinkD,'stroke-width':1.4,'stroke-linecap':'round'},g); },
    draw:(g,a)=>g.setAttribute('transform',`translate(0,${f1(S.my+1.5+S.mo*.75)}) scale(1,${f1(a)})`) },
  tongue_side:{ build:g=>{ el('path',{d:tongueD(4.5,11),fill:C.pink},g); },
    draw:(g,a,t)=>g.setAttribute('transform',`translate(7,${f1(S.my+1)}) rotate(${f1(-25+Math.sin(t*4)*8)}) scale(1,${f1(a)})`) },
  tongue_pant:{ build:g=>{ el('path',{d:tongueD(5.5,15),fill:C.pink},g); el('path',{d:'M0 2V9',stroke:C.pinkD,'stroke-width':1.4,'stroke-linecap':'round'},g); },
    draw:(g,a,t)=>g.setAttribute('transform',`translate(0,${f1(S.my+3+S.mo*.75)}) scale(1,${f1(a*(.85+.25*Math.abs(Math.sin(t*6))))})`) },
  teeth_line:{ build:g=>{ el('path',{d:'M-12 0H12',stroke:'var(--body1)','stroke-width':1.3,'stroke-linecap':'round'},g); },
    draw:(g,a)=>{ g.setAttribute('transform',`translate(0,${f1(S.my+MS.c*.55+(1.5+MS.o)*.45)}) scale(${f1(MS.w/14)},1)`); g.setAttribute('opacity',f1(a)); } },
  teeth:{ build:g=>{ el('rect',{x:-16,y:-6.5,width:32,height:13,rx:5,fill:C.white},g);
      el('path',{d:'M-16 0H16M-8 -6.5V6.5M0 -6.5V6.5M8 -6.5V6.5',stroke:'var(--body1)','stroke-width':1.3},g); },
    draw:(g,a,t)=>{ g.setAttribute('transform',`translate(0,${f1(S.my+3)}) scale(${f1(a)},1)`); E.mouth.style.opacity=f1(1-a); } },
  buck_teeth:{ build:g=>{ el('rect',{x:-4.6,y:0,width:4.3,height:5,rx:1,fill:C.white},g); el('rect',{x:.3,y:0,width:4.3,height:5,rx:1,fill:C.white},g); },
    draw:(g,a)=>{ g.setAttribute('transform',`translate(0,${f1(S.my+1)})`); g.setAttribute('opacity',f1(a)); } },
  no_mouth:{ build:()=>{}, draw:(g,a)=>{ E.mouth.style.opacity=f1(1-a); } },
  welling:{ build:g=>{ for(const s of [-1,1]) el('path',{'data-s':s,fill:C.water,opacity:.85},g); },
    draw:(g,a,t)=>{ for(const p of g.children){ const s=+p.dataset.s, x=s*S.ex, y=S.ey+EYE.ry*G.sz.x*.55, w=EYE.rx*G.sz.x*.8, h=(4+Math.sin(t*5+s)*.8)*a;
      p.setAttribute('d',`M${f1(x-w)} ${f1(y)}Q${f1(x)} ${f1(y+h*2)} ${f1(x+w)} ${f1(y)}Q${f1(x)} ${f1(y+h*.6)} ${f1(x-w)} ${f1(y)}Z`); } } },
  sweat:{ build:g=>{ el('path',{d:'M0-8C4-2 6 2 6 5A6 6 0 0 1-6 5C-6 2-4-2 0-8Z',fill:C.water,stroke:C.waterD,'stroke-width':1},g); },
    draw:(g,a,t)=>{ const k=(t*.45)%1; g.setAttribute('transform',`translate(60,${f1(-46+eOut(k)*16)}) scale(${f1(a)})`); g.setAttribute('opacity',f1(a*(k<.8?1:(1-k)/.2))); } },
  one_tear:{ build:()=>{}, draw:(g,a,t,now)=>{ if(a>.6&&every('tear',1500,now)) tear(1); } },
  streams:{ build:()=>{}, draw:(g,a,t,now)=>{ if(a>.4&&every('streams',110,now)){ tear(-1); tear(1); } } },
  joy_tears:{ build:()=>{}, draw:(g,a,t,now)=>{ if(a<.5||!every('joyt',70,now)) return;
      for(const s of [-1,1]){ const d=el('path',{d:'M0-5C2.5-1 3.8 1.6 3.8 3.4A3.8 3.8 0 0 1-3.8 3.4C-3.8 1.6-2.5-1 0-5Z',fill:C.water});
        let x=s*(S.ex+16), y=S.ey+8, vx=s*(70+Math.random()*60), vy=-(60+Math.random()*70);
        particle(layer,d,650,(n,p,dt)=>{ vy+=420*dt; x+=vx*dt; y+=vy*dt; n.setAttribute('transform',`translate(${f1(x)},${f1(y)}) rotate(${f1(Math.atan2(vy,vx)*57.3-90)})`); n.setAttribute('opacity',f1(1-p)); }); } } },
  halo:{ build:g=>{ el('ellipse',{rx:34,ry:8.5,fill:'none',stroke:C.gold,'stroke-width':4.5,filter:'url(#glow)'},g); },
    draw:(g,a,t)=>{ g.setAttribute('transform',`translate(0,${f1(-96+Math.sin(t*2.2)*3-(1-a)*30)})`); g.setAttribute('opacity',f1(a)); } },
  orbit_hearts:{ build:g=>{ for(let i=0;i<4;i++) el('path',{d:HEART,fill:i%2?'#ff4d6d':'#ff8fab'},g); },
    draw:(g,a,t)=>{ [...g.children].forEach((h,i)=>{ const q=t*1.8+i*Math.PI/2, z=Math.sin(q), r=lerp(40,94,a);
      h.setAttribute('transform',`translate(${f1(Math.cos(q)*r)},${f1(-8+z*26)}) scale(${f1(1.1+z*.35)})`); h.setAttribute('opacity',f1(a*(.55+.45*(z*.5+.5)))); }); } },
  kiss_heart:{ build:g=>{ el('path',{d:HEART,fill:'#ff4d6d'},g); },
    draw:(g,a,t)=>{ const k=(t*.7)%1; g.setAttribute('transform',`translate(${f1(8+k*58)},${f1(S.my-k*44)}) scale(${f1(.4+k*1.2)}) rotate(${f1(Math.sin(k*9)*12)})`);
      g.setAttribute('opacity',f1(a*(k<.75?1:(1-k)/.25))); } },
  monocle:{ build:g=>{ el('circle',{r:25,fill:'rgba(255,255,255,.08)',stroke:C.gold,'stroke-width':3.2},g); el('path',{d:'M18 18Q34 46 26 70',fill:'none',stroke:C.gold,'stroke-width':1.4,'stroke-dasharray':'3 2'},g); },
    draw:(g,a)=>{ g.setAttribute('transform',`translate(${f1(S.ex)},${f1(S.ey+(1-a)*-60)})`); g.setAttribute('opacity',f1(a)); } },
  glasses:{ build:g=>{ for(const s of [-1,1]){ el('circle',{'data-s':s,r:27,fill:'rgba(255,255,255,.06)',stroke:'#0b0d14','stroke-width':6.5},g); el('circle',{'data-s':s,r:30.5,fill:'none',stroke:'rgba(255,255,255,.35)','stroke-width':1},g); }
      el('path',{'data-b':1,fill:'none',stroke:'#0b0d14','stroke-width':5,'stroke-linecap':'round'},g); },
    draw:(g,a)=>{ for(const c of g.children){ if(c.dataset.s){ c.setAttribute('cx',f1(+c.dataset.s*S.ex)); c.setAttribute('cy',f1(S.ey)); } }
      g.lastChild.setAttribute('d',`M${f1(-S.ex+26)} ${f1(S.ey-4)}Q0 ${f1(S.ey-10)} ${f1(S.ex-26)} ${f1(S.ey-4)}`);
      g.setAttribute('transform',`translate(0,${f1(-(1-a)*50)})`); g.setAttribute('opacity',f1(a)); } },
  nose:{ build:g=>{ el('ellipse',{rx:10,ry:9,fill:'#f2b08c',stroke:'#c27a55','stroke-width':1.4},g); el('ellipse',{cx:-3,cy:-3,rx:3,ry:2,fill:'#fff',opacity:.5},g); },
    draw:(g,a)=>{ g.setAttribute('transform',`translate(0,${f1(S.ey+26)}) scale(${f1(a)})`); } },
  tache:{ build:g=>{ el('path',{d:'M0-2C-4-6-10-6-15-3C-20 0-24-1-26-4C-25 3-18 7-10 5C-5 4-2 2 0 1C2 2 5 4 10 5C18 7 25 3 26-4C24-1 20 0 15-3C10-6 4-6 0-2Z',fill:'#3a2416',stroke:'#1f130b','stroke-width':1},g); },
    draw:(g,a,t)=>{ g.setAttribute('transform',`translate(0,${f1(S.ey+37)}) scale(${f1(a)},${f1(a*(1+Math.sin(t*6)*.06))})`); E.mouth.style.opacity=f1(1-a); } },
  brows:{ build:g=>{ for(const s of [-1,1]) el('path',{d:`M${-15*s} 3Q${-2*s} -6 ${15*s} -1`,fill:'none',stroke:'#2a1a10','stroke-width':6,'stroke-linecap':'round','data-s':s},g); },
    draw:(g,a,t)=>{ for(const b of g.children) b.setAttribute('transform',`translate(${f1(+b.dataset.s*S.ex)},${f1(S.ey-38+Math.sin(t*5)*1.5)})`); g.setAttribute('opacity',f1(a)); } },
  party_hat:{ build:g=>{ el('path',{d:'M-19 0L0-48L19 0Z',fill:'#ff5fa2',stroke:'#c23a7a','stroke-width':1.2},g);
      el('path',{d:'M-13-15L6-35M-7-1L12-25M5 0L15-12',stroke:'#ffd23f','stroke-width':4,'stroke-linecap':'round'},g);
      el('ellipse',{cx:0,cy:0,rx:19,ry:4,fill:'#c23a7a'},g); el('circle',{cx:0,cy:-50,r:6,fill:'#ffd23f'},g); },
    draw:(g,a,t)=>{ g.setAttribute('transform',`translate(18,${f1(-64-(1-a)*60)}) rotate(${f1(22+Math.sin(t*5)*4)})`); g.setAttribute('opacity',f1(a)); } },
  horn:{ build:g=>{ el('path',{fill:'none',stroke:'#4cc3ff','stroke-width':6,'stroke-linecap':'round'},g); el('path',{d:'M-3-5L3 0L-3 5',fill:'#ffd23f'},g); },
    draw:(g,a,t)=>{ const L=lerp(4,42,Math.abs(Math.sin(t*2.2)))*a, curl=Math.max(0,22-L)*.6;
      g.firstChild.setAttribute('d',`M0 0L${f1(L)} ${f1(L*.22)}`+(curl>1?`a${f1(curl/2)} ${f1(curl/2)} 0 1 1 0 ${f1(-curl)}`:''));
      g.lastChild.setAttribute('transform',`translate(-2,0)`); g.setAttribute('transform',`translate(10,${f1(S.my+1)})`); E.mouth.style.opacity=f1(1-a*.6); } },
  motion:{ build:g=>{ for(const s of [-1,1]) for(let i=0;i<3;i++) el('path',{d:`M${s*(90+i*7)} ${-20+i*20}q${s*6} 0 ${s*8} 6`,fill:'none',stroke:'#fff','stroke-width':2.4,'stroke-linecap':'round'},g); },
    draw:(g,a,t)=>g.setAttribute('opacity',f1(a*(.4+.4*Math.abs(Math.sin(t*12))))) },
  steam:{ build:()=>{}, draw:(g,a,t,now)=>{ if(a>.5&&every('steam',140,now)) for(const s of [-1,1]) puff(layer,s*10,S.ey+30,s*(70+Math.random()*30),18+Math.random()*10,'#ffffff',3,9,700); } },
  grawlix:{ build:g=>{ el('rect',{x:-26,y:-9,width:52,height:18,rx:5,fill:'#111'},g);
      const tx=el('text',{x:0,y:4.5,'text-anchor':'middle','font-size':12.5,'font-weight':800,'font-family':'monospace',fill:'#ff5050'},g); tx.textContent='&$!#%'; },
    draw:(g,a,t)=>{ g.setAttribute('transform',`translate(${f1(Math.sin(t*30)*.8)},${f1(S.my+2)}) scale(${f1(a)})`); E.mouth.style.opacity=f1(1-a); } },
  boom:{ build:g=>{ for(let i=0;i<9;i++) el('circle',{fill:['#ffb36b','#ff7a3c','#ffe0a0'][i%3]},g); },
    draw:(g,a,t)=>{ const p=prog(), up=eOut(Math.min(1,p*2.5)); [...g.children].forEach((c,i)=>{ const q=i/9*Math.PI*2+t*.6;
      c.setAttribute('cx',f1(Math.cos(q)*24*up)); c.setAttribute('cy',f1(-78-up*34+Math.sin(q)*10*up)); c.setAttribute('r',f1((10+i%3*4)*up)); });
      g.setAttribute('opacity',f1(a*.92)); } },
  red_cheeks:{ build:g=>{ for(const s of [-1,1]) el('ellipse',{'data-s':s,rx:14,ry:7,fill:'#ff4d6d'},g); },
    draw:(g,a)=>{ for(const c of g.children){ c.setAttribute('cx',f1(+c.dataset.s*(S.ex+8))); c.setAttribute('cy',f1(S.my-12)); } g.setAttribute('opacity',f1(a*.7)); } },
  heat:{ build:g=>{ for(let i=0;i<3;i++) el('path',{fill:'none',stroke:'#ff9a6b','stroke-width':2.6,'stroke-linecap':'round'},g); },
    draw:(g,a,t)=>{ [...g.children].forEach((w,i)=>{ const k=(t*.8+i/3)%1, x=(i-1)*22, y=-84-k*30;
      w.setAttribute('d',`M${x} ${f1(y)}q4-5 0-10t0-10`); w.setAttribute('opacity',f1(a*Math.sin(k*Math.PI))); }); } },
  icicles:{ build:g=>{ el('path',{d:'M-46-60Q-30-74 0-77Q30-74 46-60Q36-66 22-64Q14-70 2-66Q-10-71-20-64Q-34-68-46-60Z',fill:'#eaf8ff',opacity:.9},g);
      for(const [x,l] of [[-44,10],[-30,16],[-15,11],[0,18],[15,12],[30,15],[44,9]]){ const y=Math.sqrt(76*76-x*x)-5;
        el('path',{d:`M${x-4} ${f1(y)}L${x} ${f1(y+l)}L${x+4} ${f1(y)}Z`,fill:'#d8f3ff',stroke:'#9fd8ff','stroke-width':.8},g); } },
    draw:(g,a)=>g.setAttribute('opacity',f1(a)) },
  fog:{ build:g=>{ for(let i=0;i<6;i++) el('ellipse',{fill:'#eef4ff'},g); },
    draw:(g,a,t)=>{ [...g.children].forEach((c,i)=>{ const x=((t*12+i*37)%150)-75, y=-30+i*13;
      c.setAttribute('cx',f1(x)); c.setAttribute('cy',f1(y)); c.setAttribute('rx',f1(26+i%3*8)); c.setAttribute('ry',f1(11+i%2*4)); c.setAttribute('opacity',f1(a*.55)); }); } },
  hands_cheeks:{ build:g=>{ hand(g,'open'); hand(g,'open'); },
    draw:(g,a,t)=>{ const [L,R]=g.children, w=Math.sin(t*40)*1; putHand(L,a,-58+w,40,-18,true); putHand(R,a,58-w,40,18,false); } },
  hands_hug:{ build:g=>{ hand(g,'open'); hand(g,'open'); },
    draw:(g,a,t)=>{ const [L,R]=g.children, w=Math.sin(t*6)*8; putHand(L,a,-78,30,-40-w,true); putHand(R,a,78,30,40+w,false); } },
  hand_chin:{ build:g=>{ hand(g,'point'); }, draw:(g,a)=>putHand(g.firstChild,a,24,70,-12,false,1.15) },
  hands_peek:{ build:g=>{ hand(g,'open'); hand(g,'open'); },
    draw:(g,a)=>{ const [L,R]=g.children, p=prog(), open=ease((p-.35)/.15)*(1-ease((p-.75)/.12));
      putHand(L,a,-S.ex-2,S.ey+14,-10,true,1.9); putHand(R,a,S.ex+2+open*26,S.ey+14+open*34,10+open*30,false,1.9); } },
  hand_mouth:{ build:g=>{ hand(g,'open'); }, draw:(g,a)=>putHand(g.firstChild,a,4,S.my+12,-12,false,1.15) },
  hand_yawn:{ build:g=>{ hand(g,'open'); }, draw:(g,a)=>putHand(g.firstChild,a,6,S.my+16,-8,false,1.1) },
  hand_salute:{ build:g=>{ hand(g,'flat'); }, draw:(g,a)=>putHand(g.firstChild,a,S.ex+24,S.ey-40,-78,false,1.35) },
  hand_shush:{ build:g=>{ hand(g,'point'); }, draw:(g,a)=>putHand(g.firstChild,a,0,S.my+20,0,false,1.1) },
  drips:{ build:g=>{ el('ellipse',{'data-p':1,cx:0,cy:84,fill:'var(--body2)',stroke:'var(--rim)','stroke-width':1.2},g);
      for(const x of [-42,-16,12,38]) el('rect',{'data-x':x,width:12,rx:6,fill:'var(--body1)',stroke:'var(--rim)','stroke-width':1.2},g); },
    draw:(g,a,t)=>{ const p=prog(), k=ease(p/.5)*a;
      for(const c of g.children){ if(c.dataset.p){ c.setAttribute('rx',f1(30+k*55)); c.setAttribute('ry',f1(4+k*7)); c.setAttribute('opacity',f1(a)); continue; }
        const x=+c.dataset.x, y=Math.sqrt(76*76-x*x)-14, l=8+k*(14+Math.abs(x)%9)+Math.sin(t*2+x)*2;
        c.setAttribute('x',f1(x-6)); c.setAttribute('y',f1(y)); c.setAttribute('height',f1(l)); c.setAttribute('opacity',f1(a)); } } },
  long_nose:{ build:g=>{ el('path',{fill:'#e0a878',stroke:'#a8703f','stroke-width':1.4,'stroke-linejoin':'round'},g); },
    draw:(g,a)=>{ const L=4+ease((prog()-.15)/.6)*54*a;
      g.firstChild.setAttribute('d',`M-6 -5Q-8 0-6 5L${f1(L)} 2.5Q${f1(L+5)} 0 ${f1(L)} -2.5Z`); g.setAttribute('transform',`translate(${f1(-S.ex*.15)},${f1(S.ey+24)}) scale(-1,1)`); g.setAttribute('opacity',f1(Math.min(1,a*2))); } },
  dotted:{ build:g=>{ top.appendChild(g); el('circle',{r:77,fill:'none',stroke:'#ffffff','stroke-width':2.6,'stroke-dasharray':'9 8','stroke-linecap':'round'},g); },
    draw:(g,a,t)=>{ g.setAttribute('opacity',f1(a*.9)); g.setAttribute('transform',`rotate(${f1(t*12)})`); E.body.style.opacity=f1(1-a*.8); },
    off:()=>{ E.body.style.opacity=''; } },
  bags:{ build:g=>{ for(const s of [-1,1]) el('path',{'data-s':s,fill:'none',stroke:'#6b5aa8','stroke-width':3,'stroke-linecap':'round',opacity:.85},g); },
    draw:(g,a)=>{ for(const b of g.children){ const x=+b.dataset.s*S.ex, y=S.ey+EYE.ry*G.sz.x*.62, w=EYE.rx*.75;
      b.setAttribute('d',`M${f1(x-w)} ${f1(y)}Q${f1(x)} ${f1(y+9)} ${f1(x+w)} ${f1(y)}`); } g.setAttribute('opacity',f1(a)); } },
  zzz:{ build:g=>{ for(let i=0;i<3;i++){ const z=el('text',{'font-size':14+i*5,'font-weight':800,fill:'#cfe3ff','font-family':'sans-serif'},g); z.textContent='z'; } },
    draw:(g,a,t)=>{ [...g.children].forEach((z,i)=>{ const k=(t*.5+i/3)%1; z.setAttribute('x',f1(46+k*30+Math.sin(k*6)*4)); z.setAttribute('y',f1(-50-k*50)); z.setAttribute('opacity',f1(a*Math.sin(k*Math.PI))); }); } },
  drool:{ build:g=>{ el('path',{fill:C.water,stroke:C.waterD,'stroke-width':.8},g); },
    draw:(g,a,t)=>{ const k=(t*.4)%1, l=2+eOut(Math.min(1,k/.8))*16; g.firstChild.setAttribute('d',`M-2 0Q-1.6 ${f1(l*.6)} -3 ${f1(l)}A3 3 0 0 0 3 ${f1(l)}Q1.6 ${f1(l*.6)} 2 0Z`);
      g.setAttribute('transform',`translate(9,${f1(S.my+1)})`); g.setAttribute('opacity',f1(a*(k<.85?1:(1-k)/.15))); } },
  bubble:{ build:g=>{ el('circle',{fill:'rgba(191,230,255,.35)',stroke:'#e8f7ff','stroke-width':1.4},g); el('circle',{r:1.8,fill:'#fff'},g); },
    draw:(g,a,t)=>{ const k=(t*.42)%1, r=2+k*13; g.firstChild.setAttribute('r',f1(r)); g.lastChild.setAttribute('cx',f1(-r*.4)); g.lastChild.setAttribute('cy',f1(-r*.4));
      g.setAttribute('transform',`translate(${f1(10+r*.6)},${f1(S.ey+26+r*.3)})`); g.setAttribute('opacity',f1(a*(k<.94?1:0))); } },
  puff:{ build:()=>{}, draw:(g,a,t,now)=>{ const p=prog(); if(a>.5&&p>.25&&p<.7&&every('puff',60,now)) puff(layer,-6,S.my+1,-(90+Math.random()*40),-10+Math.random()*20,'#ffffff',2,10,800); } },
};
const live={};      // prop name → {g, a}
const eyeHide={a:0};
const EYEX=el('g',{},layer); const eyeL=el('path',{fill:'none',stroke:'var(--whiteL)','stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'},EYEX), eyeR=eyeL.cloneNode(); EYEX.appendChild(eyeR);
let eyeMode='';

window.emoDraw=(m,t,dt,P)=>{
  const d=byMood(m), now=performance.now(), want=new Set(d&&d.props||[]);
  S.ex=Math.max(EYE.cx,EYE_HALFW*G.sz.x+2.6); S.ey=EYE.cy; S.my=EYE.cy+EYE.ry*G.sz.x*.72+15; S.mo=MS.o+MS.c*.55;
  for(const n in PROPS) if(want.has(n)||live[n]){
    let L=live[n]; if(!L){ L=live[n]={g:el('g',{},layer),a:0}; PROPS[n].build(L.g); }
    L.a=approach(L.a,want.has(n)?1:0,dt,want.has(n)?7:9);
    if(L.a<.01&&!want.has(n)){ PROPS[n].off&&PROPS[n].off(); if(n==='no_mouth'||n==='teeth'||n==='grawlix'||n==='tache'||n==='horn') E.mouth.style.opacity=''; L.g.remove(); delete live[n]; continue; }
    PROPS[n].draw(L.g,L.a*spinFront,t,now); }
  // her eyes turned into > <  or  x x
  const mode=d&&(d.eyes==='chev'||d.eyes==='x')?d.eyes:'';
  if(mode) eyeMode=mode;
  eyeHide.a=approach(eyeHide.a,mode?1:0,dt,10);
  if(eyeHide.a>.01){ const a=eyeHide.a, w=EYE.rx*.55, h=EYE.ry*.3;
    for(const [s,p] of [[-1,eyeL],[1,eyeR]]){ const x=s*S.ex, y=S.ey+4;
      p.setAttribute('d',eyeMode==='x'?`M${f1(x-w)} ${f1(y-w)}L${f1(x+w)} ${f1(y+w)}M${f1(x+w)} ${f1(y-w)}L${f1(x-w)} ${f1(y+w)}`
        :`M${f1(x+s*w)} ${f1(y-h)}L${f1(x-s*w)} ${f1(y)}L${f1(x+s*w)} ${f1(y+h)}`); }
    EYEX.setAttribute('opacity',f1(a*spinFront)); for(const e of [E.eL,E.eR,E.lash]) e.style.opacity=f1(1-a); }
  else if(EYEX.getAttribute('opacity')!=='0'){ EYEX.setAttribute('opacity','0'); for(const e of [E.eL,E.eR]) e.style.opacity=''; }
};

/* ---------------- by voice */
const NAMES={}; for(const n in EM) NAMES[n.replace(/_/g,' ')]=n; Object.assign(NAMES,ALIAS);
const TOUR=/\b(?:show|do)\b.*\b(?:smileys?|smilies|emojis?|emoticons|emotes)\b/i;
let tourT=[];
function tour(){ tourT.forEach(clearTimeout); tourT=Object.keys(EM).map((n,i)=>setTimeout(()=>{ emote(n,3200); tick(EM[n].e+'  '+n.replace(/_/g,' ')); },i*3400)); }
window.emoTour=tour;
window.emoCommand=text=>{
  if(TOUR.test(text)){ tour(); return true; }
  const s=text.toLowerCase().replace(/[.!?,]+/g,' ').replace(/^\s*(?:hey\s+)?(?:jay|void)\s+/,'').replace(/\s+/g,' ').trim();
  const mm=s.match(/^(?:(?:can|could|will|would) you\s+)?(?:please\s+)?(?:do|make|pull|give (?:me|us)|show (?:me|us))\s+(?:the\s+|a\s+|an\s+|your\s+|some\s+)?(.+?)(?:\s+(?:face|smiley|emoji|look))?(?:\s+for (?:me|us))?(?:\s+please)?$/);
  if(!mm) return false;
  const want=mm[1].trim(), keys=Object.keys(EM);
  const n=/^(?:face|funny face|silly face|random face|smiley|emoji|any face)$/.test(want)?keys[Math.random()*keys.length|0]:NAMES[want]; if(!n) return false;
  emote(n); tick(EM[n].e+'  '+n.replace(/_/g,' ')); return true; };
})();
