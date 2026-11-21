function silence(){
  if(!engine)return;
  const {noise,gain}=engine;
  gain.gain.setTargetAtTime(.0001,audio.currentTime,.035);
  noise.stop(audio.currentTime+.22);
  engine=null;
}
function rumble(volume){
  silence();
  if(!audible||!audio||document.hidden)return;
  const buf=audio.createBuffer(1,audio.sampleRate,audio.sampleRate);
  const samples=buf.getChannelData(0);
  let previous=0;
  for(let i=0;i<samples.length;i++){previous=(previous+.055*(Math.random()*2-1))/1.02;samples[i]=previous*4}
  const noise=audio.createBufferSource(), gain=audio.createGain();
  noise.buffer=buf;noise.loop=true;
  gain.gain.setValueAtTime(.001,audio.currentTime);gain.gain.linearRampToValueAtTime(volume,audio.currentTime+.14);
  noise.connect(gain).connect(audio.destination);noise.start();engine={noise,gain};
}
function tone(hz,duration,delay=0){
  if(!audio||!audible||document.hidden)return;
  const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+delay;
  osc.type='sine';osc.frequency.value=hz;
  gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.075,t+.014);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+duration+.02);
}
function wakeAudio(){
  if(!audible)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio??=new Audio();audio.resume().catch(()=>{});}}catch{}
}
function phaseSound(phase){
  if(phase==='Main engine'||phase==='Second burn')rumble(phase==='Second burn'?.52:.34);
  else silence();
  if(phase==='Vernier pulse')tone(1250,.085);
  if(phase==='Signal acquired'){tone(730,.085);tone(1100,.1,.13);}
}

