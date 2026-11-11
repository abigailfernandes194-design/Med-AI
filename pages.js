/* page-specific behaviour (each block only runs if its elements exist) */
if($('#chips')){
/* symptom checker */
const SYM=[['Fever','🌡️'],['Cough','😷'],['Headache','🤕'],['Fatigue','😴'],['Sore Throat','🗣️'],['Runny Nose','🤧'],['Stomach Pain','🤢'],['Nausea','🤮'],['Body Pain','💢'],['Dizziness','😵'],['Skin Rash','🔴'],['Itching','🖐️']];
const DB=[
['Common Cold',['Cough','Sore Throat','Runny Nose','Fatigue','Headache'],'Rest, fluids and warm drinks usually help. See a doctor if it lasts over a week.'],
['Influenza (Flu)',['Fever','Body Pain','Fatigue','Cough','Headache','Sore Throat'],'Rest and hydrate. Seek care if you have trouble breathing or a very high fever.'],
['Migraine',['Headache','Nausea','Dizziness','Fatigue'],'Rest in a quiet, dark room. Frequent migraines deserve a doctor’s review.'],
['Gastroenteritis',['Stomach Pain','Nausea','Fever','Fatigue'],'Sip oral rehydration fluids. See a doctor if it lasts beyond two days.'],
['Allergic Reaction',['Skin Rash','Itching','Runny Nose','Cough'],'Avoid known triggers. Get urgent help if you have swelling or breathing difficulty.'],
['Dehydration',['Dizziness','Fatigue','Headache','Nausea'],'Drink fluids with electrolytes and rest. Seek care if symptoms persist.'],
['Viral Fever',['Fever','Body Pain','Fatigue','Headache'],'Rest, fluids and monitoring your temperature. Consult a doctor if fever lasts over 3 days.']];
const sel=new Set();
SYM.forEach(([n,e])=>{const b=document.createElement('button');b.className='chip';b.type='button';b.setAttribute('aria-pressed','false');b.textContent=e+' '+n;
b.onclick=()=>{sel.has(n)?sel.delete(n):sel.add(n);b.setAttribute('aria-pressed',sel.has(n))};$('#chips').append(b)});
$('#clear').onclick=()=>{sel.clear();document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed','false'));$('#out').innerHTML='<p style="color:var(--mute);margin-top:10px">Selection cleared. Pick your symptoms to begin.</p>'};
$('#analyze').onclick=()=>{
if(!sel.size){$('#out').innerHTML='<p style="margin-top:10px">Please select at least one symptom first.</p>';return}
const r=DB.map(([n,s,t])=>{const m=s.filter(x=>sel.has(x)).length;return{n,t,p:Math.round(m/Math.max(s.length,sel.size)*100)}}).filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,3);
$('#out').innerHTML=r.length?r.map(x=>`<div class="res-item"><b>${x.n}</b> <span style="float:right;color:var(--teal);font-weight:700">${x.p}% match</span><div class="bar"><i style="width:${x.p}%"></i></div><small>${x.t}</small></div>`).join(''):'<p style="margin-top:10px">No match found in the demo database. Please consult a doctor.</p>'};


}
if($('#bcalc')){
/* BMI + water */
$('#bcalc').onclick=()=>{const h=+$('#bh').value/100,w=+$('#bw').value;if(!h||!w){$('#bout').textContent='Please enter a valid height and weight.';return}
const b=w/(h*h),c=b<18.5?'Underweight':b<25?'Healthy range':b<30?'Overweight':'Obesity range';
const pos=Math.min(100,Math.max(0,(b-12)/(40-12)*100));
$('#bout').innerHTML=`<span class="big">${b.toFixed(1)}</span> <b>${c}</b><div class="gauge"><i style="left:calc(${pos}% - 3px)"></i></div><small style="color:var(--mute)">BMI is a general screen and doesn’t reflect muscle, age or health history. Ask a doctor for personal advice.</small>`};
$('#wcalc').onclick=()=>{const w=+$('#ww').value;if(!w){$('#wout').textContent='Please enter a valid weight.';return}
const l=w*.035+ +$('#wa').value;$('#wout').innerHTML=`<span class="big">${l.toFixed(1)} L</span> <b>per day</b><p style="color:var(--mute);margin-top:6px">That’s about ${Math.round(l*1000/250)} glasses of 250 ml. Needs rise in hot weather or when you’re unwell.</p>`};

}
if($('#docs')){
/* staff */
const DOCS=[['Dr. Rahul Sharma','General Physician','12+ years','Treats everyday illnesses and manages long-term conditions for patients of all ages.'],['Dr. Priya Mehta','Cardiologist','10+ years','Focuses on heart health, blood pressure management and preventive cardiology.'],['Dr. Arjun Patel','Pediatrician','8+ years','Cares for infants, children and teens, from vaccinations to growth checks.'],['Dr. Ananya Rao','Dermatologist','7+ years','Treats skin, hair and nail conditions including rashes, allergies and acne.']];
const dlg=$('#dlg');
DOCS.forEach(([n,r,y,d])=>{const c=document.createElement('div');c.className='card doc';
c.innerHTML=`<div class="av">${n.split(' ')[1][0]}${n.split(' ')[2][0]}</div><h3>${n}</h3><small>${r}</small><p>${y} experience</p><button class="btn alt">View profile</button>`;
c.querySelector('button').onclick=()=>{$('#dn').textContent=n;$('#dr').textContent=r+' · '+y+' experience';$('#dx').textContent=d;dlg.showModal()};$('#docs').append(c)});


}
if($('#topics')){

['Which doctor should I see?','I have a fever','I feel stressed','I can’t sleep','Skin problems','Back or joint pain','Child health','Book appointment'].forEach(q=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=q;b.onclick=()=>openAsk(q);$('#topics').append(b)});
$('#openchat').onclick=()=>openAsk();

}
if($('#apptForm')){
const q=new URLSearchParams(location.search).get('dept');if(q)$('#adep').value=q;
$('#ad').min=new Date().toISOString().split('T')[0];
$('#apptForm').onsubmit=async e=>{e.preventDefault();const o=$('#apptOk'),n=$('#an').value.trim(),d=$('#adep').value,dt=$('#ad').value;
store.set('medai-appts',[...store.get('medai-appts'),{name:n,phone:$('#ap').value,email:$('#aem').value.trim().toLowerCase(),date:dt,dept:d,reason:$('#ar').value.trim()}]);
await askPerm();o.style.display='block';o.textContent='✓ Thanks '+n+'! Your '+d+' appointment on '+dt+' is confirmed (demo).';
notify('Appointment booked',d+' on '+dt);e.target.reset()}}
if($('#regForm')){
const show=(o,h)=>{o.style.display='block';o.innerHTML=h};
$('#regForm').onsubmit=async e=>{e.preventDefault();const f=e.target,o=$('#regOk'),name=$('#rn').value.trim(),em=$('#re').value.trim().toLowerCase(),list=store.get('medai-patients');
if(em===DEMO.email||list.some(p=>p.email===em)){show(o,'A profile with this email already exists. You can request your health report below.');return}
await askPerm();
list.push({name:name,email:em,dob:normDob($('#rd').value),gender:$('#rg').value,created:Date.now()});store.set('medai-patients',list);
show(o,'✓ Welcome, '+esc(name)+'! Your patient profile has been created. Sending your welcome email…');
notify('Profile created','Welcome to MedAI, '+name+'!');
const r=await sendMail(em,name,'Welcome to MedAI, '+name,welcomeBody(name));
show(o,'✓ Welcome, '+esc(name)+'! Your patient profile has been created.'+mailNote(r,em,'A welcome email'));f.reset()};
$('#repForm').onsubmit=async e=>{e.preventDefault();const o=$('#repOk');show(o,'Checking your record…');
const r=await deliverReport($('#pe').value.trim().toLowerCase(),normDob($('#pd').value));
show(o,esc(r.msg)+(r.acts?r.acts.map(a=>' <a href="'+esc(a.href)+'">'+esc(a.label)+'</a>').join(''):''))}}
