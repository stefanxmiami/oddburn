const clip = n => Math.max(0, Math.min(1,n));
const smooth = n => { const t=clip(n); return t*t*(3-2*t); };
const mix = (a,b,n) => a+(b-a)*n;
const images = {};
const sky = document.querySelector('#sky');
const ctx = sky.getContext('2d');
const tape = document.querySelector('#altitudeTape');
const tapePen = tape.getContext('2d');
const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .:!?-/+';
let inkFont;
let logicalW = 480;
const H = 270;
const altitudeScale=1.1;
const padCenter=(237+24*Math.sin(-.47)-39*Math.cos(-.47)-H/2)/altitudeScale;

async function loadArt() {
  await Promise.all(Object.entries(assetURLs).map(async ([name,src])=>{
    const image = new Image();
    image.src=src;
    await image.decode();
    images[name]=image;
  }));
  inkFont=document.createElement('canvas');
  inkFont.width=images['telemetry-font'].width;
  inkFont.height=8;
  const pen=inkFont.getContext('2d');
  pen.drawImage(images['telemetry-font'],0,0);
  pen.globalCompositeOperation='source-in';
  pen.fillStyle='#ffefd6';
  pen.fillRect(0,0,inkFont.width,8);
}

function altitudeMeter(km) {
  const canvas=document.querySelector('#counter');
  const pen=canvas.getContext('2d');
  pen.imageSmoothingEnabled=false;
  pen.clearRect(0,0,canvas.width,canvas.height);
  let x=0;
  for(const ch of shortKm(km)){
    const idx=glyphs.indexOf(ch);
    pen.drawImage(inkFont,idx*6,0,6,8,x,0,18,24);
    x+=18;
  }
  for(const ch of 'KM'){
    pen.drawImage(inkFont,glyphs.indexOf(ch)*6,0,6,8,x+3,8,12,16);
    x+=12;
  }
}

const rareBurnKm=80;

function drawAltitudeTape(km,noseX,noseY,viewWidth,viewHeight) {
  const ratio=window.devicePixelRatio||1;
  const width=Math.round(tape.clientWidth*ratio),height=Math.round(viewHeight*ratio);
  if(tape.width!==width||tape.height!==height){tape.width=width;tape.height=height}
  const pen=tapePen;
  pen.imageSmoothingEnabled=false;
  pen.clearRect(0,0,width,height);
  const px=Math.max(1,Math.round(ratio));
  const glyphSize=Math.max(1,Math.round(ratio*1.6));
  const rail=width-6*px;
  const y=Math.round(noseY*height/H);
  const x=Math.round(noseX/logicalW*viewWidth*ratio-(viewWidth*ratio-width));
  const spacing=height/H*altitudeScale;
  const currentLabel=shortKm(km)+' KM';
  const labelHeight=8*glyphSize;
  function label(value,right,top,atlas){
    const start=right-value.length*6*glyphSize;
    pen.fillStyle='#081626';
    pen.fillRect(start-2*px,top-2*px,right-start+4*px,labelHeight+4*px);
    for(let i=0;i<value.length;i++){
      pen.drawImage(atlas,glyphs.indexOf(value[i])*6,0,6,8,start+i*6*glyphSize,top,6*glyphSize,labelHeight);
    }
  }
  const first=Math.max(0,Math.ceil((km-(height-y)/spacing)/10)*10);
  const last=Math.min(destination,km+y/spacing);
  const liveTop=y-labelHeight-4*px;
  for(let mark=first;mark<=last;mark+=10){
    const row=Math.round(y+(km-mark)*spacing);
    const major=mark%50===0;
    const length=(major?12:5)*px;
    pen.fillStyle='#102b38';
    pen.fillRect(rail-length,row+px,length,px);
    pen.fillStyle=mark===destination?'#ffd890':major?'#a8dfc2':'#6a9b95';
    pen.fillRect(rail-length,row,length,px);
    const top=row-4*glyphSize;
    if(major&&(top+labelHeight+3*px<liveTop||top>y+4*px)){
      label(shortKm(mark)+' KM',rail-15*px,top,images['telemetry-font']);
    }
  }
  if(browseTarget!==null){
    const mid=Math.round(height/2);
    pen.fillStyle='#90f6b6';
    pen.fillRect(rail,mid,5*px,px);
    pen.fillRect(rail+2*px,mid-px,3*px,3*px);
  }
  if(y<0||y>=height)return;
  pen.fillStyle='#142f39';
  pen.fillRect(x+3*px,y,Math.max(0,rail-x-3*px),2*px);
  pen.fillStyle='#93d9b8';
  for(let dash=x+3*px;dash<rail;dash+=7*px){
    pen.fillRect(dash,y,Math.min(3*px,rail-dash),px);
  }
  pen.fillStyle='#fff0c9';
  pen.fillRect(rail-11*px,y-px,11*px,3*px);
  pen.fillRect(rail-2*px,y-3*px,2*px,7*px);
  label(currentLabel,rail-2*px,liveTop,inkFont);
}

function trajectory(time,goal,rare) {
  const length=2.1+Math.sqrt(goal)*.12;
  const t=clip(time/length);
  const second=rare?smooth((t-.34)/.62):0;
  const distance=rare?.73*smooth(t)+.27*second:smooth(t);
  const ignition=smooth(t/.115),cutoff=1-smooth((t-.70)/.26);
  const power=ignition*cutoff*(.64+Math.min(goal,260)/420+(rare?.24*second:0));
  const phase=t<.1?'Ignition':t>.86?'Coasting':rare&&t>.44?'Second burn':'Main engine';
  return {km:goal*distance,power,phase,jet:rare&&t>.38&&t<.43,done:t>=1};
}

function failedBurn(time,entry) {
  if(entry.failure==='fall'){
    const t=clip(time/2.8);
    return {km:entry.gain*t*t,fall:t,power:0,phase:'Past apogee / falling',done:time>=3};
  }
  if(entry.failure==='flyby'){
    return {km:0,drift:smooth(time/3),power:0,phase:'Guidance lock lost',done:time>=3.2};
  }
  return {km:0,power:0,phase:'Launch scrubbed',done:time>=1.2};
}

function stamp(name,x,y,w) {
  const img=images[name];
  const width=w??img.width;
  ctx.drawImage(img,Math.round(x),Math.round(y),Math.round(width),Math.round(img.height*width/img.width));
}

function panorama(name,w,focus,offset=0,zoom=1){
  const img=images[name];
  const scale=Math.max(w/img.width,H/img.height)*zoom;
  const width=Math.ceil(img.width*scale),height=Math.ceil(img.height*scale);
  ctx.drawImage(img,Math.round((w-width)*focus),Math.round((H-height)*.52+offset),width,height);
}

const nozzle={x:1,y:6,angle:Math.atan(.50)};
const burnFrames=[
  {x:37.5,y:1.5}, {x:38,y:2.5}, {x:36,y:1.5}, {x:38,y:1.5}
];
const burnArtAngle=Math.atan(.76);

function brightTrail(clock,power){
  for(let i=13;i>0;i--){
    const spread=i/13;
    const j=clock?Math.sin(i*3+clock*8):0;
    const x=j*spread*2;
    const y=i*3.4*power;
    ctx.globalAlpha=(1-spread*.8)*.75;
    ctx.fillStyle=i>8?'#a47e89':i>4?'#ff956e':'#fff1b4';
    const size=Math.max(1,Math.round((1+(1-spread)*4)*Math.min(1,power)));
    ctx.fillRect(Math.round(x-size*.5),Math.round(y),size,size);
  }
  ctx.globalAlpha=1;
}

function holdingFlame(clock,strength){
  const pulse=.5+.5*Math.sin(clock*7+.4*Math.sin(clock*3));
  const length=Math.round(4+3*strength+2*pulse);
  for(let i=0;i<length;i++){
    const width=i<3?3:i<length-2?2:1;
    ctx.globalAlpha=strength*(1-.45*i/length);
    ctx.fillStyle=i<3?'#ffe8ac':i<6?'#ffae79':'#dc7966';
    ctx.fillRect(-width/2,i-1,width,1);
  }
  ctx.globalAlpha=1;
}

function drawScene(state,clock,showAltitude) {
  const aspect=sky.clientWidth/Math.max(1,sky.clientHeight);
  logicalW=Math.max(150,Math.round(H*aspect));
  if(sky.width!==logicalW||sky.height!==H){sky.width=logicalW;sky.height=H;}
  const w=logicalW,k=state.km;
  ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha=1;
  const titleScene=mode==='title';
  const follow=titleScene?k:cameraAltitude;
  const inspected=Math.max(0,browseCenter-padCenter);
  const viewKm=mix(k,Math.max(0,inspected),browseWeight);
  const terrain=mix(follow,inspected,browseWeight);
  const atAltitude=alt=>H/2+(browseCenter-alt)*altitudeScale;
  const lead=Math.max(-20,Math.min(24,(k-follow)*.75));
  const narrow=sky.clientWidth<=700;
  const bgWidth=Math.max(w+12,480);
  const tracking=k>0&&clock>0;
  const pan=tracking?5*Math.sin(clock*.14):0;
  ctx.drawImage(images['aurora-sky'],Math.round((w-bgWidth)*.5+pan),0,bgWidth,H);
  if(viewKm>0&&viewKm<orbitGate){
    ctx.globalAlpha=.35*(1-smooth((viewKm-95)/65));
    for(let i=0;i<9;i++){
      const x=((i*73-clock*(2+i%3))%(w+12)+w+12)%(w+12)-10;
      ctx.fillStyle=i%2?'#60738a':'#507977';
      ctx.fillRect(Math.floor(x),Math.floor(164+i*17%78+3*Math.sin(i)),4+i%6,1);
    }
    ctx.globalAlpha=1;
  }
  const orbit=smooth((viewKm-88)/78);
  if(orbit>0){
    ctx.globalAlpha=orbit;
    const climb=smooth((terrain-160)/850);
    panorama('oddburn-earth',w,.50+.13*Math.sin(clock*.046),climb*21,1.18);
    const departure=smooth((viewKm-160)/115);
    if(departure>0){
      ctx.globalAlpha=departure;
      panorama('voyage-starfield',w,.45+.10*Math.sin(clock*.018),8*Math.sin(terrain*.003),1.14);
    }
    ctx.globalAlpha=orbit;
    for(let i=1;i<=41;i++){
      ctx.fillStyle=i%7?'#708a9e':'#e4ead5';
      const x=((i*71.89%1)*w-clock*(i%3+1)*.55)%w;
      const parallax=browseWeight*browseCenter*(.014+(i%3)*.008);
      ctx.fillRect(Math.floor((x+w)%w),Math.floor(((i*37.17%1)*180+parallax)%H),1,1);
    }
    ctx.globalAlpha=orbit*(1-departure);stamp('crescent-moon',w*.79,23,14);
    ctx.globalAlpha=1;
  }
  const camera=terrain*1.17;
  const ridgeY=229+camera*.63;
  if(viewKm<145){
    const summitY=185+camera*.68;
    ctx.fillStyle='#101f32';
    ctx.beginPath();ctx.moveTo(w*.54,summitY+74);
    for(const [x,y] of [[.60,64],[.67,53],[.71,49],[.76,31],[.79,29],[.84,10],[.87,6],[.89,5],[.94,21],[.98,27],[1,36],[1,130],[.54,130]])ctx.lineTo(Math.round(w*x),Math.round(summitY+y));
    ctx.closePath();ctx.fill();
    const dishWidth=Math.min(43,w*.14);
    stamp('ridge-relay',w*.875-dishWidth*.5,summitY+7-dishWidth*.62,dishWidth);
  }
  if(ridgeY<270)ctx.drawImage(images['mountain-ridge'],0,ridgeY,w,44);
  if(titleScene||viewKm<60){
    ctx.globalAlpha=mix(titleScene?1:1-smooth(k/60),1-smooth(inspected/60),browseWeight);
    panorama('observatory-night',w,narrow?.81:.55,mix(titleScene?0:k*.8,inspected*.8,browseWeight));
    ctx.globalAlpha=1;
  }
  const padX=w*(narrow?.52:.60);
  const baseY=237+camera;
  if(!titleScene&&baseY<340){
    stamp('service-gantry',padX-30,baseY-56,31);
    ctx.fillStyle='#566775';ctx.fillRect(padX-8,baseY-2,20,3);ctx.fillStyle='#212e42';ctx.fillRect(padX-11,baseY+1,26,3);
  }
  const moving=clock!==0;
  const drifting=mode!=='title'&&run&&offCourse()?1:0;
  const drift=state.drift??drifting;
  const freeFlight=k>0;
  const pitch=freeFlight&&moving?Math.sin(clock*.85)*.085+Math.sin(clock*.33)*.045:0;
  const sway=freeFlight&&moving?Math.sin(clock*.65)*3:0;
  const fallDip=Math.sin((state.fall??0)*Math.PI);
  const cruiseX=w*(narrow?.68:.77);
  const trackX=titleScene?w*(narrow?.50:.66):mix(padX,cruiseX,smooth(k/96));
  const trackY=titleScene?(narrow?163:113):mix(237,narrow?174:102,smooth(k/92))-Math.min(12,k*.045);
  const rocketX=trackX+sway+drift*w*.06;
  const angle=mix(-.47,.12,smooth((k-3)/75))+pitch+fallDip*.84+drift*.23+(state.jet?-.15*Math.sin(clock*14):0);
  const noseOffset=24*Math.sin(angle)-39*Math.cos(angle);
  const followY=trackY+(freeFlight&&moving?Math.sin(clock*.83)*2:0)+fallDip*13+drift*5-lead;
  followCenter=k+(followY+noseOffset-H/2)/altitudeScale;
  const rocketY=mix(followY,atAltitude(k)-noseOffset,browseWeight);
  const balloonY=mix(followY+(k-47)*2.1-20,atAltitude(47),browseWeight);
  if(!titleScene&&balloonY>-60&&balloonY<H)stamp('weather-balloon',w*.45+Math.sin(clock*.7)*1.7,balloonY,26);
  const relayY=mix(followY+(k-133)*2.15-17,atAltitude(133),browseWeight);
  if(relayY>-48&&relayY<H)stamp('relay-satellite',w*.72,relayY,39);
  const center=mix(followCenter,browseCenter,browseWeight);
  const horizonX=w*(narrow?.65:.76);
  const horizonY=H/2+(center-destination)*altitudeScale;
  for(const stop of waypoints){
    if(!stop.art)continue;
    const y=H/2+(center-stop.at)*altitudeScale;
    if(y < -100 || y > H+100)continue;
    const horizon=stop.at===destination;
    const span=Math.min(stop.width,w*(horizon?.92:.60));
    const x=horizon?horizonX:w*stop.x;
    const height=span*images[stop.art].height/images[stop.art].width;
    stamp(stop.art,x-span/2,y-height/2,span);
    if(stop.name==='Jupiter'||stop.name==='Neptune'){
      const orbit=clock*.22+(stop.at*.05);
      ctx.fillStyle='#b8bcc2';
      ctx.fillRect(Math.round(x+Math.cos(orbit)*span*.66),Math.round(y+Math.sin(orbit)*span*.17),3,2);
    }
    if(horizon&&clock){
      ctx.fillStyle='#ffdfac';
      for(let i=0;i<5;i++){
        const a=clock*.6+i*1.26;
        const dx=Math.cos(a)*span*.28,dy=Math.sin(a)*span*.034;
        ctx.fillRect(Math.round(x+dx),Math.round(y+dy-dx*.18),2,1);
      }
    }
  }
  if(center>650){
    const y=H/2+(center-840)*altitudeScale;
    if(y>-20&&y<H+20){
      ctx.globalAlpha=.48;ctx.fillStyle='#9f8abf';
      for(let i=0;i<48;i++){
        const x=(i*53%101)/100*w;
        ctx.fillRect(Math.round(x),Math.round(y+5*Math.sin(i*.83+clock*.16)+x*.025),i%3===0?3:1,1);
      }
      ctx.globalAlpha=1;
    }
  }
  const capture=smooth((k-955)/45);
  ctx.save();
  ctx.translate(Math.round(mix(rocketX,horizonX,capture)),Math.round(mix(rocketY,horizonY,capture)));
  ctx.rotate(angle+capture*1.2);
  ctx.scale(1-capture,1-capture);
  ctx.save();ctx.translate(nozzle.x,nozzle.y);ctx.rotate(nozzle.angle);
  if(!titleScene&&freeFlight&&k<spaceBoundary&&state.fall===undefined&&state.power<.12){
    const air=1-smooth((k-(spaceBoundary-20))/20);
    const idle=1-smooth(state.power/.12);
    holdingFlame(clock,air*idle);
  }
  if(state.power>0){
    const size=state.power;
    brightTrail(clock,size);
    const step=Math.floor(clock*12)%4;
    const origin=burnFrames[step];
    ctx.rotate(-burnArtAngle);
    const scale=size*.7;
    ctx.drawImage(images['burn-loop'],step*40,0,40,48,-origin.x*scale,-origin.y*scale,40*scale,48*scale);
  }
  ctx.restore();
  stamp('survey-rocket',-5,-39,30);
  if(k===0&&!state.power&&moving){
    for(let i=0;i<6;i++){
      const age=(clock*.55+i/6)%1;
      ctx.globalAlpha=(1-age)*.68;
      ctx.fillStyle=i%2?'#b5cdd1':'#819fab';
      ctx.fillRect(Math.round(10+age*15),Math.round(-16-age*8+Math.sin(age*7+i)*2),2+Math.floor(age*4),2);
    }
    ctx.globalAlpha=1;
  }
  if(k>=spaceBoundary&&!state.power&&moving&&state.fall===undefined){
    const cycle=clock%3.6;
    const puff=cycle<.38?cycle:cycle>=1.8&&cycle<2.08?cycle-1.8:-1;
    if(puff>=0){
      const side=cycle<1?1:-1;
      for(let i=0;i<3;i++){
        const reach=puff*26+i*2;
        ctx.globalAlpha=Math.max(0,1-puff*2.4-i*.14);
        ctx.fillStyle=i===0?'#f2fcde':'#9bd8cf';
        ctx.fillRect(Math.round((side>0?12:4)+side*reach),Math.round(-19+side*reach*.35),3,2);
      }
      ctx.globalAlpha=1;
    }
  }
  if(state.jet){
    ctx.fillStyle='#ff8b70';ctx.fillRect(10,-17,9+(Math.floor(clock*15)%3),3);
    ctx.fillStyle='#ffebbe';ctx.fillRect(10,-17,5,2);
  }
  ctx.restore();
  tape.hidden=(titleScene&&!browseWeight)||!showAltitude;
  if(!tape.hidden){
    const noseX=mix(Math.round(rocketX)+24*Math.cos(angle)+39*Math.sin(angle),horizonX,capture);
    const noseY=Math.round(rocketY)+24*Math.sin(angle)-39*Math.cos(angle);
    drawAltitudeTape(k,noseX,noseY,sky.clientWidth,sky.clientHeight);
  }
  if(!el('flightReadout').hidden){
    const tag=el('flightReadout');
    tag.style.left=clip(rocketX/w)*100+'%';
    tag.style.visibility=rocketY<0||rocketY>H?'hidden':'visible';
    tag.style.top=clip((rocketY+(freeFlight&&k<spaceBoundary?16:8))/H)*100+'%';
  }
  if(browseTarget!==null){
    const label=browseCenter<=padCenter+.1?'Viewing launch pad':'Viewing '+formatKm(mix(followCenter,browseCenter,browseWeight));
    if(el('viewKm').textContent!==label)el('viewKm').textContent=label;
  }
}
