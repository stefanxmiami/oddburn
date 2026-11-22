const el=id=>document.getElementById(id);

const attempts=7;


const uplinkSeconds=25;

const practiceTopic=new URLSearchParams(location.search).get('practice');
const countryNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'region'}):null;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let memory={};
try{memory=JSON.parse(localStorage.getItem('vernier-flight-v1')||'{}')||{}}catch{}
let audible=memory.sound!==false,audio=null,engine=null;
let mode='title',run=null,elapsed=0,previousTime=0,oldPhase='',current={km:48,power:.75},drawn=-1;
let artReady=false,armed=false;
let clockSecond=-1;
let markedUntil=0;
let cameraAltitude=0;
let followCenter=0;
let browseTarget=null;
let browseCenter=0;
let browseWeight=0;
function panSky(pixels){
  if(!artReady||!pixels)return;
  if(browseTarget===null)browseCenter=Math.max(padCenter,mix(followCenter,browseCenter,browseWeight));
  const step=pixels*H/(sky.clientHeight*altitudeScale);
  const start=browseTarget??browseCenter;
  const target=Math.max(padCenter,Math.min(destination,start+step));
  if(Math.abs(target-start)<.001)return;
  browseTarget=target;
  el('followRocket').hidden=false;
}
function followRocket(){
  browseTarget=null;
  el('followRocket').hidden=true;
}
function resetCamera(){
  followRocket();
  browseWeight=0;
}
function updateBrowse(dt){
  const ease=reducedMotion.matches?1:1-Math.exp(-dt*15);
  if(browseTarget!==null)browseCenter=mix(browseCenter,browseTarget,ease);
  browseWeight=mix(browseWeight,browseTarget===null?0:1,ease);
  if(browseWeight<.001&&browseTarget===null)browseWeight=0;
  if(browseWeight>.999&&browseTarget!==null)browseWeight=1;
}
el('followRocket').onclick=followRocket;
const gameView=el('game');
function fitKeyboard(){
  const viewport=window.visualViewport;
  const editing=viewport&&document.activeElement===el('response')&&viewport.scale===1&&innerHeight-viewport.height>100;
  gameView.toggleAttribute('data-keyboard',!!editing);
  if(editing){
    gameView.style.setProperty('--keyboard-top',(viewport.offsetTop+6)+'px');
    gameView.style.setProperty('--keyboard-room',Math.max(1,viewport.height-12)+'px');
  }
}
window.visualViewport?.addEventListener('resize',fitKeyboard);
window.visualViewport?.addEventListener('scroll',fitKeyboard);
el('response').addEventListener('focus',fitKeyboard);
el('response').addEventListener('blur',()=>gameView.removeAttribute('data-keyboard'));
gameView.addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
  const panel=event.target.closest('.overlay');
  if(event.target.closest('#rankList,#record')||(panel&&panel.scrollHeight>panel.clientHeight+1))return;
  event.preventDefault();
  const unit=event.deltaMode===1?16:event.deltaMode===2?sky.clientHeight:1;
  panSky(-event.deltaY*unit);
},{passive:false});
let dragY=null;
gameView.addEventListener('touchstart',event=>{
  dragY=event.touches.length===1&&!event.target.closest('.overlay,button,input,header,footer')?event.touches[0].clientY:null;
},{passive:true});
gameView.addEventListener('touchmove',event=>{
  if(dragY===null||event.touches.length!==1){dragY=null;return}
  const y=event.touches[0].clientY;
  event.preventDefault();
  panSky(y-dragY);dragY=y;
},{passive:false});
gameView.addEventListener('touchend',()=>{dragY=null});
gameView.addEventListener('touchcancel',()=>{dragY=null});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&browseTarget!==null){followRocket();return}
  if(event.target.closest('input,textarea,#rankList,#record,summary')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
  event.preventDefault();panSky(event.key==='ArrowUp'?100:-100);
});
const key='vernier-horizon-mission-v1';
const playableIds=QUESTIONS.filter(q=>!q.replacedBy).map(q=>q.id);
function save(){try{localStorage.setItem('vernier-flight-v1',JSON.stringify(memory))}catch{}}
function persist(){if(run&&!run.practice)try{localStorage.setItem(key,JSON.stringify(run))}catch{}}
function stored(){
  try{
    const saved=localStorage.getItem(key);
    const r=JSON.parse(saved??localStorage.getItem('vernier-relay-mission-v1'));
    if(Array.isArray(r?.deck)&&Array.isArray(r.log)){
      for(let i=r.log.length;i<r.deck.length;i++){
        const replacement=qFor(r.deck[i])?.replacedBy;
        if(!replacement)continue;
        r.deck[i]=r.deck.includes(replacement)?playableIds.find(id=>!r.deck.includes(id)):replacement;
        if(i===r.log.length)delete r.deadline;
      }
    }
    if(r?.deck?.length===5&&r.step!=='record'&&Array.isArray(r.log)){
      const extra=shuffle(playableIds.filter(id=>!r.deck.includes(id)));
      r.deck.push(...extra.slice(0,attempts-r.deck.length));
      let distance=0,drifting=false;
      const entries=[];
      for(const old of r.log){
        const q=qFor(old.id);
        const answer=q?.answers.find(a=>a.name===old.name);
        const burn=old.correct&&answer?flyAnswer(distance,answer.km,old.boost,drifting):{gain:0,trim:0};
        const missed=!old.correct&&distance>0;
        entries.push({...old,...burn,offCourse:missed,failure:old.correct?'':missed?'flyby':'scrub'});
        distance+=burn.gain;drifting=missed;
        if(distance>=destination)break;
      }
      r.log=entries;
      if(distance>=destination)r.step='receipt';
    }
    if(r&&!r.practice&&['answer','receipt','record'].includes(r.step)&&r.deck?.length===attempts&&r.deck.every(id=>QUESTIONS.some(q=>q.id===id))&&Array.isArray(r.log)&&r.log.length<=attempts)return r;
  }catch{}
  return null;
}
const total=()=>run.log.reduce((a,e)=>a+e.gain,0);
function rarityPoints(q,rank){
  const fraction=(rank-1)/Math.max(1,q.answers.length-1);
  return 10+10*Math.round(9*fraction**1.6);
}
const entryPoints=e=>e.correct?rarityPoints(qFor(e.id),e.rank):0;
const score=()=>run.log.reduce((sum,e)=>sum+entryPoints(e),0);
const last=()=>run.log[run.log.length-1];
const offCourse=()=>!!last()?.offCourse;
function coastStatus(km){
  if(!km)return 'On pad / tanks venting';
  if(offCourse())return 'Guidance lost / correction required';
  return km>=840?'Deep space / carrier locked':'Cruising / carrier locked';
}
const complete=()=>!run.practice&&(run.log.length>=attempts);
function shuffle(items){
  const deck=[...items];
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  return deck;
}
function fresh(practice){
  const ids=playableIds;
  let deck=shuffle(ids).slice(0,attempts);
  if(practice||!memory.played)deck=['planets',...shuffle(ids.filter(id=>id!=='planets')).slice(0,attempts-1)];
  const topic=qFor(practiceTopic)?.replacedBy??practiceTopic;
  if(practice&&ids.includes(topic))deck=[topic,...shuffle(ids.filter(id=>id!==topic))];
  return {practice,deck,log:[],boostUsed:false,step:'answer',id:Date.now()+'-'+Math.random().toString(36).slice(2,7)};
}
function qFor(id){return QUESTIONS.find(q=>q.id===id)}
function rankText(rank,q){return 'Rarity '+rank+' / '+q.answers.length}
function showPracticeRanks(q,name){
  el('rankSummary').textContent='Estimated rarity · all '+q.answers.length+' answers · signal points';
  const list=el('rankList');list.replaceChildren();
  for(const a of q.answers){
    const row=document.createElement('li');
    const value=document.createElement('b');
    row.dataset.selected=String(a.name===name);
    value.textContent=rarityPoints(q,a.rank)+' pts';
    row.append(a.rank+'. '+a.name+(a.country?' · '+(countryNames?.of(a.country)??a.country):''),value);
    list.append(row);
  }
}
function activeQuestion(){return qFor(run.deck[run.log.length])}
function label(id,text){
  const h=el(id);h.replaceChildren();h.setAttribute('aria-label',text);
  if(!artReady){h.textContent=text;return}
  for(const [i,word] of text.toUpperCase().replace(/[‘’ʼ]/g,"'").split(' ').entries()){
    if(i)h.append(' ');
    const c=document.createElement('canvas');c.className='pixel-word';c.setAttribute('aria-hidden','true');
    const letters=[...word];
    c.width=Math.max(1,letters.reduce((width,ch)=>width+(ch==="'"?3:6),0)-1);c.height=7;
    c.style.width=(c.width*.082)+'em';c.style.height='.574em';
    const g=c.getContext('2d');g.fillStyle='#ffefd6';
    let x=0;
    for(const ch of letters){
      if(ch==="'"){
        g.fillRect(x+1,0,1,2);g.fillRect(x,2,1,1);
        x+=3;continue;
      }
      const index=glyphs.indexOf(ch);
      if(index>=0)g.drawImage(inkFont,index*6,0,5,7,x,0,5,7);
      x+=6;
    }
    h.append(c);
  }
}
function screen(s){
  mode=s;el('game').dataset.scene=s;
  el('title').hidden=s!=='title';el('radio').hidden=!['ready','receipt','flying'].includes(s);
  el('record').hidden=s!=='record';el('pad').hidden=s!=='ready';el('continue').hidden=s!=='receipt';
  el('rankings').hidden=s!=='receipt'||!run?.practice;
  el('rankings').open=false;
  el('skip').hidden=s!=='flying';el('meters').hidden=s==='title'||memory.altitude===false;
  el('windowTrack').hidden=s!=='ready'||run?.practice;
  el('flightReadout').hidden=s!=='flying'&&!(s==='ready'&&performance.now()<markedUntil);
  el('game').dataset.result='';
}
function title(){
  resetCamera();
  markedUntil=0;screen('title');silence();run=null;current={km:48,power:.75};drawn=-1;
  const saved=stored();
  el('start').textContent=saved&&saved.step!=='record'?'Resume mission':'Start mission';
  el('practice').textContent=practiceTopic==='capitals'?'Practice capitals':'Practice';
  el('personal').textContent=memory.signalBest!==undefined?'Best signal: '+memory.signalBest+' pts / '+signalRating(memory.signalBest).name:memory.voyageBest!==undefined?'Best voyage: '+formatKm(memory.voyageBest):'';
  el('signal').textContent='Observatory ready';
}
function begin(practice,force=false){
  if(!artReady)return;
  resetCamera();
  wakeAudio();tone(480,.07);const old=stored();
  run=!practice&&!force&&old&&old.step!=='record'?old:fresh(practice);
  cameraAltitude=run.practice?0:total();armed=false;persist();
  if(run.step==='receipt')receipt();else ready();
}
function pips(n){
  const bar=el('pips');bar.replaceChildren();
  if(run.practice)return;
  for(let i=0;i<attempts;i++){
    const p=document.createElement('i');p.className=i<n?'done':i===n?'now':'';bar.append(p);
  }
}
function syncBoost(){
  el('boost').hidden=run.practice;
  el('boost').disabled=run.boostUsed;
  el('boost').setAttribute('aria-pressed',armed);
  el('boost').textContent=run.boostUsed?'Spent':'Boost ×1.5';
  el('boost').setAttribute('aria-label',run.boostUsed?'Boost spent':'Boost ×1.5 on this answer');
}
function ready(){
  screen('ready');const q=activeQuestion();
  current={km:run.practice?0:total(),power:0};armed=false;syncBoost();
  el('legend').textContent=run.practice?'Open frequency / practice':'Uplink '+(run.log.length+1)+' / '+attempts;
  pips(run.log.length);label('headline',q.prompt);
  el('receiverArt').src=assetURLs[current.km>=orbitGate?'orbital-station':'launch-observatory'];
  el('detail').textContent=run.practice?'Try an answer, then see its rank.':current.km===0?'First answer launches you.':'Uplink open.';
  el('signal').textContent=run.practice?'Practice channel':'Receiving transmission';
  el('clock').hidden=run.practice;
  if(!run.practice){
    if(!Number.isFinite(run.deadline)){run.deadline=Date.now()+uplinkSeconds*1000;persist()}
    clockSecond=-1;
    el('signal').textContent=coastStatus(total())+' / '+score()+' pts';
    if(total()>0)el('detail').textContent=offCourse()?'Signal lost. Realignment shortens your next burn.':'Next flyby: '+nextWaypoint(total()).name+'.';
    updateClock();
    if(mode!=='ready')return;
  }
  el('error').textContent='';el('response').value='';
  if(matchMedia('(pointer:fine)').matches)el('response').focus({preventScroll:true});
}
function updateClock(){
  const seconds=Math.max(0,Math.ceil((run.deadline-Date.now())/1000));
  if(seconds!==clockSecond){
    clockSecond=seconds;el('clock').textContent=String(seconds).padStart(2,'0')+' s';
    el('clock').classList.toggle('low',seconds<=5);
    el('windowTrack').firstElementChild.style.transform='scaleX('+clip(seconds/uplinkSeconds)+')';
    el('windowTrack').classList.toggle('low',seconds<=5);
    if(seconds===5){el('announce').textContent='Five seconds left';tone(720,.07)}
  }
  if(!seconds)transmit(false,true);
}
function transmit(pass=false,timeout=false){
  if(mode!=='ready')return;
  const input=el('response'),typed=input.value.trim();
  timeout=timeout||(!run.practice&&Date.now()>=run.deadline);
  if(!timeout&&!pass&&!typed){el('error').textContent='Enter an answer or pass this uplink.';input.focus();return}
  const q=activeQuestion(),a=(pass||timeout)?null:validateAnswer(q,typed);
  if(!timeout&&!pass&&!a){el('error').textContent='No clear match. Check the spelling or try another answer.';input.focus();input.select();return}
  const boost=armed&&!pass&&!timeout&&!run.boostUsed;
  const base=run.practice?0:total();
  const failure=a?'':base>=orbitGate?'flyby':base>0?'fall':'scrub';
  const loss=failure==='fall'?Math.min(base,Math.max(12,Math.round(base*.3))):0;
  const {gain,trim}=a?flyAnswer(base,a.km,boost,offCourse()):{gain:-loss,trim:0};
  const entry={id:q.id,name:a?.name??(timeout?'Timed out':pass?'Passed':typed),rank:a?.rank,gain,boost,pass,timeout,correct:!!a,failure,trim,offCourse:failure==='flyby'};
  delete run.deadline;
  run.log.push(entry);if(boost)run.boostUsed=true;
  run.step='receipt';persist();screen('flying');wakeAudio();elapsed=0;markedUntil=0;previousTime=performance.now();oldPhase='';
  el('legend').textContent='Uplink '+String(run.log.length).padStart(2,'0')+' / '+(a?'transmitted':'closed');el('clock').hidden=true;
  el('burnType').textContent=!a?'Missed transmission':(boost?'Boost · ':'')+rankText(a.rank,q);
  el('burnAnswer').textContent=a?a.name+' / +'+distanceText(distanceKm(base+gain)-distanceKm(base)):failure==='fall'?'Descent / '+distanceText(distanceKm(base)-distanceKm(base+gain)):failure==='flyby'?'Guidance lock lost':'Launch held';
  el('signal').textContent=a?'Ignition':'Signal lost';el('announce').textContent=el('signal').textContent;
  if(!a)tone(155,.19);
  if(reducedMotion.matches)receipt();else el('skip').focus({preventScroll:true});
}
function receipt(){
  silence();const e=last(),q=qFor(e.id);
  if(!run.practice){
    current={km:total(),power:0};
    el('burnType').textContent=e.rank?'+'+entryPoints(e)+' pts / '+rankText(e.rank,q):e.correct?'Burn complete':e.failure==='flyby'?'Signal lost':'Uplink closed';
    el('burnAnswer').textContent=e.name+' / '+formatKm(total());
    markedUntil=performance.now()+1800;
    el('announce').textContent=el('burnType').textContent+'. '+el('burnAnswer').textContent;
    if(complete()){record();return}
    run.step='answer';delete run.deadline;ready();return;
  }
  screen('receipt');
  current={km:e.gain,power:0};
  el('clock').hidden=true;
  const name=e.correct?e.name:'Uplink passed';
  label('headline',name);
  el('game').dataset.result=e.correct?'good':'miss';
  el('legend').textContent=e.correct?entryPoints(e)+' pts / '+rankText(e.rank,q):'Signal lost';
  showPracticeRanks(q,e.name);
  el('receiverArt').src=assetURLs[e.correct?'survey-rocket':'launch-observatory'];
  const example=q.answers.reduce((a,b)=>a.km>b.km?a:b).name;
  el('detail').textContent=e.correct?'Orbit reached. Launch covered '+formatKm(e.gain)+'.':example+' was on this frequency.';
  el('signal').textContent='Practice channel';
  el('next').textContent='Try another answer';
  el('practiceNext').hidden=el('exitPractice').hidden=false;
  el('announce').textContent=name+'. '+el('detail').textContent;el('next').focus({preventScroll:true});
}
function record(){
  run.step='record';persist();screen('record');const reached=total()>=destination;
  const points=score(),rating=signalRating(points);
  memory.signalBest=Math.max(memory.signalBest||0,points);
  memory.played=true;memory.voyageBest=Math.max(memory.voyageBest||0,total());save();
  label('outcome',rating.name);
  el('ratingScore').textContent=points;
  el('ratingNote').textContent=points?rating.note:'The night crew heard only the carrier tone.';
  el('ratingBars').replaceChildren(...signalRatings.map(tier=>{
    const bar=document.createElement('i');
    bar.classList.toggle('lit',points>=tier.min);
    return bar;
  }));
  el('game').dataset.result=reached?'docked':'miss';
  drawProfile();
  el('recordBody').scrollTop=0;
  if(reached){tone(560,.12);tone(704,.15,.15);tone(838,.34,.36)}
  el('summary').textContent=reached?'Your last signal left just before the fictional black hole swallowed the probe at the galactic rim.':total()===0?'The probe stayed on the pad. Send a valid answer to launch.':formatKm(total())+' from launch. Last contact near '+(passedWaypoint(total())?.name??'Earth')+'.';
  el('log').replaceChildren();
  let position=0;
  for(const [i,e] of run.log.entries()){
    const row=document.createElement('li'),v=document.createElement('b');
    const delta=distanceKm(position+e.gain)-distanceKm(position);
    position+=e.gain;
    const index=document.createElement('span'),answer=document.createElement('span'),detail=document.createElement('small');
    index.className='log-index';index.textContent=String(i+1).padStart(2,'0');
    answer.textContent=e.name;
    const distance=e.failure==='flyby'?'Lock lost':(delta<0?'-':delta>0?'+':'')+distanceText(Math.abs(delta));
    detail.textContent=[distance,e.rank&&rankText(e.rank,qFor(e.id)),e.boost&&'×1.5'].filter(Boolean).join(' · ');
    answer.append(detail);v.textContent=entryPoints(e)+' pts';
    row.append(index,answer,v);el('log').append(row);
  }
  el('signal').textContent=reached?'Mission complete':'Ground control / off air';
  el('announce').textContent=rating.name+'. '+points+' points. '+el('summary').textContent;el('again').focus({preventScroll:true});
}
function drawProfile(){
  const canvas=el('profile'),pen=canvas.getContext('2d');
  let altitude=0;
  const points=[0,...run.log.map(e=>altitude+=e.gain)];
  canvas.setAttribute('aria-label','Distance from launch after each transmission: '+points.map(formatKm).join(', '));
  pen.clearRect(0,0,288,40);pen.fillStyle='#385055';
  for(let x=0;x<288;x+=8){pen.fillRect(x,3,3,1);pen.fillRect(x,37,3,1)}
  const scale=Math.max(destination,...points);
  const step=(canvas.width-8)/attempts;
  const xy=points.map((k,i)=>[4+Math.round(i*step),36-Math.round(k/scale*32)]);
  for(let i=1;i<xy.length;i++){
    const [x,y]=xy[i-1],end=xy[i];
    pen.fillStyle=run.log[i-1].correct?'#9af3b7':'#ff9b79';
    const width=end[0]-x;
    for(let n=0;n<=width;n++)pen.fillRect(x+n,Math.round(mix(y,end[1],n/width)),1,1);
    pen.fillRect(end[0]-1,end[1]-1,3,3);
  }
}
el('start').onclick=()=>begin(false);
el('again').onclick=()=>begin(false,true);
el('practice').onclick=()=>begin(true);
el('home').onclick=el('exitPractice').onclick=title;
el('practiceNext').onclick=()=>{run.deck.push(run.deck.shift());run.log=[];run.step='answer';ready()};
el('pad').onsubmit=ev=>{ev.preventDefault();transmit()};
el('pass').onclick=()=>transmit(true);
el('boost').onclick=()=>{armed=!armed;syncBoost();if(matchMedia('(pointer:fine)').matches)el('response').focus({preventScroll:true})};
el('response').oninput=()=>el('error').textContent='';
el('skip').onclick=()=>{if(mode==='flying')receipt()};
el('next').onclick=()=>{
  if(mode!=='receipt')return;
  if(complete()){record();return}
  if(run.practice)run.log=[];
  run.step='answer';persist();ready();
};
function altLabel(){el('altSwitch').textContent=memory.altitude===false?'HUD off':'HUD on';el('altSwitch').setAttribute('aria-pressed',memory.altitude!==false)}
el('altSwitch').onclick=()=>{memory.altitude=memory.altitude===false;save();altLabel();el('meters').hidden=mode==='title'||memory.altitude===false};
function soundLabel(){el('sound').textContent=audible?'Sound on':'Sound off';el('sound').setAttribute('aria-pressed',audible)}
el('sound').onclick=()=>{audible=!audible;memory.sound=audible;save();soundLabel();if(audible){wakeAudio();if(mode==='flying')phaseSound(current.phase);else tone(660,.08)}else silence()};
document.addEventListener('visibilitychange',()=>{previousTime=performance.now();if(document.hidden)silence();else if(mode==='flying')phaseSound(current.phase)});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&mode==='flying')receipt()});
function frame(now){
  if(mode==='ready'&&!run.practice&&!document.hidden)updateClock();
  if(!document.hidden&&mode==='flying'){
    elapsed+=Math.min(.1,Math.max(0,(now-previousTime)/1000));
    const e=last(),base=run.practice?0:total()-e.gain;
    const answer=qFor(e.id).answers[e.rank-1];
    const t=e.correct?trajectory(elapsed,e.gain,e.boost||answer?.km>=rareBurnKm):failedBurn(elapsed,e);
    if(e.trim){t.drift=1-smooth(elapsed/1.6);if(elapsed<1.6)t.phase='Correcting course'}
    if(e.correct&&base<orbitGate&&base+t.km>=orbitGate&&!t.power)t.phase='Orbital insertion';
    const crossed=waypoints.find(stop=>current.km<stop.at&&base+t.km>=stop.at);
    if(crossed){el('legend').textContent=crossed.name.toUpperCase()+' / signal acquired';tone(680,.12)}
    current={...t,km:base+t.km};
    if(t.phase!==oldPhase){oldPhase=t.phase;phaseSound(t.phase);el('signal').textContent=t.phase}
    if(t.done){if(e.correct)tone(820,.13);receipt()}
  }
  const dt=Math.min(.1,Math.max(0,(now-previousTime)/1000));
  previousTime=now;
  if(!document.hidden){
    cameraAltitude=reducedMotion.matches?current.km:mix(cameraAltitude,current.km,1-Math.exp(-dt*4.5));
    updateBrowse(dt);
    if(mode==='ready'&&now>=markedUntil)el('flightReadout').hidden=true;
    drawScene(current,reducedMotion.matches?0:now/1000,memory.altitude!==false);
    const km=current.km;
    if(km!==drawn){
      drawn=km;altitudeMeter(km);el('counter').setAttribute('aria-label',formatKm(km)+' from launch');
      el('track').firstElementChild.style.width=(100*km/destination)+'%';
      el('zone').textContent=passedWaypoint(km)?.name??(km>0?'Earth ascent':'Launch pad');
      const next=nextWaypoint(km);
      el('routeTarget').textContent=next?' / Next: '+next.name:' / Final signal';
    }
  }
  requestAnimationFrame(frame);
}
for(const [i,tier] of signalRatings.entries()){
  const row=document.createElement('li'),range=document.createElement('b');
  range.textContent=i===signalRatings.length-1?tier.min+'+':tier.min+'–'+(signalRatings[i+1].min-1);
  row.append(range,tier.name);el('ratingGuide').append(row);
}
el('receiverArt').src=assetURLs['launch-observatory'];el('wordmark').src=assetURLs['oddburn-wordmark'];soundLabel();altLabel();title();
loadArt().then(()=>{artReady=true;el('start').disabled=el('practice').disabled=false;requestAnimationFrame(frame)}).catch(()=>{el('personal').textContent='Unable to load the range. Reopen the game.'});


