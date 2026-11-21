const destination=1000;
const spaceBoundary=100;
const orbitGate=110;
const waypoints=[
  {at:100,km:100,name:'Edge of space'},
  {at:110,km:200,name:'Earth orbit'},
  {at:230,km:384400,name:'Lunar distance'},
  {at:280,km:78.3e6,name:'Mars',art:'voyage-mars',width:58,x:.40},
  {at:440,km:628.7e6,name:'Jupiter',art:'voyage-jupiter',width:112,x:.49},
  {at:590,km:1.277e9,name:'Saturn',art:'voyage-saturn',width:155,x:.31},
  {at:665,km:2.721e9,name:'Uranus',art:'voyage-uranus',width:63,x:.28},
  {at:740,km:4.349e9,name:'Neptune',art:'voyage-neptune',width:84,x:.48},
  {at:840,km:17.8e9,name:'Heliopause'},
  {at:905,km:15e12,name:'Outer Oort cloud'},
  {at:destination,km:2.27e17,name:'Galactic rim',art:'voyage-horizon',width:218,x:.73}
];
const scaleStops=[{at:0,km:0},...waypoints];
function distanceKm(position){
  if(position<=0)return 0;
  if(position>=destination)return waypoints.at(-1).km;
  const index=scaleStops.findIndex(stop=>stop.at>=position);
  const from=scaleStops[index-1],to=scaleStops[index];
  const t=(position-from.at)/(to.at-from.at);
  if(t===1)return to.km;
  return from.km===0?t*to.km:from.km*(to.km/from.km)**t;
}
const units=[[1e15,'Q','quadrillion'],[1e12,'T','trillion'],[1e9,'B','billion'],[1e6,'M','million']];
function distanceText(km,short=false){
  const unit=units.find(([size])=>Math.abs(km)>=size);
  if(!unit)return Math.round(km).toLocaleString('en-US',{useGrouping:!short})+(short?'':' km');
  const value=Number((km/unit[0]).toPrecision(3));
  return short?value+unit[1]:value+' '+unit[2]+' km';
}
const formatKm=position=>distanceText(distanceKm(position));
const shortKm=position=>distanceText(distanceKm(position),true);
const nextWaypoint=value=>waypoints.find(stop=>stop.at>value);
const passedWaypoint=value=>waypoints.filter(stop=>stop.at<=value).at(-1);
const signalRatings=[
  {min:0,name:'Carrier Tone',note:'Ground control tuned in on the usual frequency.'},
  {min:151,name:'Beacon',note:'Your call stood out against the background noise.'},
  {min:251,name:'Pulsar',note:'Unlikely answers kept coming, pulse after pulse.'},
  {min:351,name:'Magnetar',note:'The night crew swung a second dish onto your signal.'},
  {min:450,name:'Wow! Signal',note:'Someone circled your transmission on the printout.'}
];
const signalRating=score=>signalRatings.filter(rating=>score>=rating.min).at(-1);
function flyAnswer(position,bonus,boost,offCourse){
  const thrust=position===0?spaceBoundary+bonus*(boost?1.5:1):(35+bonus)*(boost?1.5:1);
  const trim=offCourse?Math.min(25,thrust):0;
  return {trim,gain:Math.min(destination-position,thrust-trim)};
}
