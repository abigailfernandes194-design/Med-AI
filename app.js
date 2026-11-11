const $=s=>document.querySelector(s);
/* ---------- shared layout ---------- */
const cur=location.pathname.split('/').pop()||'index.html';
const PAGES=[['index.html','Home'],['health-check.html','Health Check'],['appointment.html','Appointment'],['doctors.html','Doctors'],['register.html','Register &amp; Reports'],['faq.html','FAQ']];
const HDR="<div class=\"alert\">🚑 Emergency? Call <b>112</b> · Ambulance <b>108</b> · MedAI helpline <b>+91 98765 43210</b></div>\n<header><div class=\"wrap\"><nav>\n<a class=\"logo\" href=\"index.html\"><b>✚</b> MedAI</a>\n<button class=\"menu\" id=\"menu\" aria-label=\"Toggle menu\">☰</button>\n<ul class=\"links\" id=\"links\">%LINKS%</ul><button class=\"tg\" id=\"theme\" aria-label=\"Toggle dark mode\">🌙</button></nav></div></header>",FTR="<footer><div class=\"wrap\">\n<div><a class=\"logo\" style=\"color:#fff\" href=\"index.html\"><b>✚</b> MedAI</a><p style=\"margin-top:8px\">AI-inspired solutions for better local healthcare.</p></div>\n<div><h3>Quick links</h3>%FLINKS%</div>\n<div><h3>Contact</h3><p>📍 Local Healthcare Centre</p><p>📞 +91 98765 43210</p><p>✉ info@medai.com</p></div>\n</div><p class=\"copy\">© 2026 MedAI | AI in Local Healthcare</p></footer>",CHAT="<button id=\"fab\" aria-label=\"Open MedAI chat\">💬</button>\n<div id=\"chat\" role=\"dialog\" aria-label=\"MedAI chat assistant\">\n<div class=\"ch\"><div class=\"av2\">🤖</div><div><b>MedAI Assistant</b><small>Health questions, doctors &amp; appointments</small></div><button id=\"x\" aria-label=\"Close chat\">×</button></div>\n<div id=\"msgs\"></div>\n<div class=\"qr\" id=\"qr\"></div>\n<form id=\"cf\"><input id=\"ci\" placeholder=\"Type your question…\" autocomplete=\"off\" aria-label=\"Your question\"><button>Send</button></form>\n</div>\n\n";
document.body.insertAdjacentHTML('afterbegin',HDR.replace('%LINKS%',PAGES.map(([h,n])=>`<li><a href="${h}"${cur===h?' class="on" aria-current="page"':''}>${n}</a></li>`).join('')));
document.body.insertAdjacentHTML('beforeend',FTR.replace('%FLINKS%',PAGES.slice(1).map(([h,n])=>`<a href="${h}">${n}</a>`).join(''))+CHAT);
/* nav */
$('#menu').onclick=()=>$('#links').classList.toggle('show');
document.querySelectorAll('.links a').forEach(a=>a.onclick=()=>$('#links').classList.remove('show'));

/* theme */
const th=$('#theme');
function setT(d){document.documentElement.dataset.theme=d?'dark':'';th.textContent=d?'☀️':'🌙';try{localStorage.setItem('medai-dark',d?1:0)}catch(e){}}
let sv=null;try{sv=localStorage.getItem('medai-dark')}catch(e){}
setT(sv===null?matchMedia('(prefers-color-scheme:dark)').matches:sv==='1');
th.onclick=()=>setT(document.documentElement.dataset.theme!=='dark');

/* ---------- shared helpers ---------- */
const store={get:k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mask=e=>e.replace(/^(.).*(@.*)$/,'$1***$2');
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=m;t.className='show';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',4500)}
function notify(title,body){toast('🔔 '+title+': '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body})}catch(e){}}
async function askPerm(){try{if('Notification' in window&&Notification.permission==='default')await Notification.requestPermission()}catch(e){}}
function normDob(s){s=String(s).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);return m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):''}
async function sendMail(to,name,subject,body){
const c=(window.MEDAI||{}).emailjs||{};
if(c.serviceId&&c.templateId&&c.publicKey){try{const r=await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:c.serviceId,template_id:c.templateId,user_id:c.publicKey,template_params:{to_email:to,to_name:name,subject:subject,message:body}})});return{status:r.ok?'sent':'failed'}}catch(e){return{status:'failed'}}}
return{status:'draft',link:'mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body.slice(0,1500))}}
function mailNote(r,email,what){return r.status==='sent'?' ✉ '+what+' has been sent to '+esc(mask(email))+'.':r.status==='draft'?' Email sending isn’t set up on this site yet. <a href="'+esc(r.link)+'">Open the email draft</a> in your mail app.':' We couldn’t send the email just now. Please try again later.'}
const welcomeBody=n=>`Hello ${n},\n\nWelcome to MedAI! Your patient profile has been created.\n\nWhat you can do next:\n- Book an appointment: ${new URL('appointment.html',location.href).href}\n- Meet our doctors: ${new URL('doctors.html',location.href).href}\n- Ask our chat assistant to email your health report any time.\n\nStay healthy,\nMedAI Local Healthcare Centre\n+91 98765 43210`;
const DEMO={name:'Demo Patient',email:'demo@medai.com',dob:'1990-05-15',gender:'Female',vitals:'BP 118/76 mmHg, weight 62 kg, fasting sugar 92 mg/dL',visits:[{date:'2026-09-03',dept:'General Medicine',doc:'Dr. Rahul Sharma',note:'Viral fever. Rest and fluids advised; recovered.'},{date:'2026-06-18',dept:'Cardiology',doc:'Dr. Priya Mehta',note:'Routine blood-pressure check. Normal range.'},{date:'2026-02-07',dept:'Dermatology',doc:'Dr. Ananya Rao',note:'Mild skin allergy. Trigger avoidance advised.'}]};
const findPatient=(e,d)=>[DEMO,...store.get('medai-patients')].find(p=>p.email===e&&p.dob===d);
function buildReport(p){
const ap=store.get('medai-appts').filter(a=>a.email===p.email).map(a=>({date:a.date,dept:a.dept,doc:'',note:a.reason||'Appointment booked'}));
const v=[...(p.visits||[]),...ap].sort((a,b)=>a.date<b.date?1:-1);
return ['MedAI Health Report','Generated: '+new Date().toLocaleDateString(),'','Patient: '+p.name,'Email: '+p.email,'Date of birth: '+p.dob,'Gender: '+(p.gender||'-'),'','Visit history:',...(v.length?v.map(x=>'- '+x.date+' | '+x.dept+(x.doc?' ('+x.doc+')':'')+': '+x.note):['- No visits on record yet.']),...(p.vitals?['','Latest readings: '+p.vitals]:[]),'','This is a demo summary, not a medical record. Please consult your doctor for medical advice.','MedAI Local Healthcare Centre | +91 98765 43210'].join('\n')}
async function deliverReport(email,dob){
const p=findPatient(email,dob);
if(!p)return{msg:'I couldn’t find a record matching that email and date of birth. Please check the details, or create a patient profile first.',acts:[{label:'Register',href:'register.html'}]};
const r=await sendMail(p.email,p.name,'Your MedAI health report',buildReport(p));
if(r.status==='sent'){notify('Health report sent','Check '+mask(p.email));return{msg:'✅ Your health report has been emailed to '+mask(p.email)+'. Please check your inbox (and spam folder).'}}
if(r.status==='draft')return{msg:'Email sending isn’t set up on this site yet, so I’ve prepared the report as an email draft. Tap the button to open it in your mail app.',acts:[{label:'Open email draft',href:r.link}]};
return{msg:'Sorry, I couldn’t send the email right now. Please try again in a little while.'}}
function openAsk(q){toggle(true);if(q)ask(q)}
/* chatbot */
const D={gen:['General Medicine','Dr. Rahul Sharma'],car:['Cardiology','Dr. Priya Mehta'],ped:['Pediatrics','Dr. Arjun Patel'],der:['Dermatology','Dr. Ananya Rao'],ort:['Orthopedics',null]};
const MH='\n\nIf things feel too heavy, you can call Tele-MANAS 14416 (free mental-health helpline in India, 24/7).';
const KB=[
[/suicid|kill myself|end my life|self.?harm|want to die|hurt myself/,'I’m really sorry you’re hurting. You deserve support right now. Please call 112 or Tele-MANAS 14416 (free, 24/7 in India), or reach someone you trust and stay with them. I’m only an automated assistant, so a real person can help you far better than I can.'],
[/chest pain|can.?t breathe|difficulty breathing|trouble breathing|breathless|unconscious|severe bleeding|heavy bleeding|seizure|poison|overdose|choking|stroke|heart attack|paraly|slurred|emergency/,'⚠️ This may be an emergency. Please call 112 (or ambulance 108) or go to the nearest hospital now. Don’t wait for an online answer.'],
[/\bhello|\bhi\b|\bhey\b|good (morning|evening|afternoon)/,'Hello! 👋 Ask me about symptoms, health worries, sleep, stress, diet, medicines, or which doctor to see. Personal questions are welcome too.'],
[/\breport|health record|medical record|\blab\b|test result|past visit|my records|medical history/,()=>startReport()],
[/who are you|are you (a )?(real|human|doctor|bot)|your name|how do you work/,'I’m the MedAI assistant, an automated helper with pre-written answers. I’m not a doctor and can’t diagnose, but I can share general information and point you to the right doctor.'],
[/embarrass|ashamed|shy|awkward|afraid to ask|scared to ask|silly question|judg|personal doubt|private/,'That’s not a silly question. Doctors hear personal concerns every day, and being open helps them help you. Ask me in your own words, or tell the doctor directly during your consultation.',['gen']],
[/child|kid|baby|infant|toddler|vaccin|immuniz|my son|my daughter/,'Children’s health changes quickly, so check any fever in babies and growth or vaccination questions with a pediatrician. Seek urgent care if a child is very drowsy, not feeding or breathing fast.',['ped']],
[/stomach|abdom|belly|nausea|vomit|diarr|loose motion|acidity|\bgas\b|constipat|indigestion/,'Sip oral rehydration fluids, eat light foods and rest. See a doctor if it lasts over two days, you can’t keep fluids down, you see blood, or the pain is severe.',['gen']],
[/blood pressure|\bbp\b|hypertens|palpitat|heart|cholesterol/,'Heart and blood-pressure concerns are best checked with a measurement. Less salt, regular activity and no smoking help. Seek urgent care for chest pain, fainting or sudden breathlessness.',['car']],
[/diabet|sugar|glucose|hba1c/,'Blood sugar needs a test and a doctor’s plan. Balanced meals, less sugary food and regular activity help. Frequent thirst, urination or tiredness are good reasons to get tested.',['gen']],
[/fever|temperature|dengue|malaria|viral/,'Rest, drink fluids and track your temperature. See a doctor if fever lasts over 3 days, is very high, or comes with a rash, severe body pain, vomiting or breathing trouble. These can point to infections like dengue, which need a test.',['gen']],
[/cough|\bcold\b|sore throat|runny|sneez|\bflu\b|congestion/,'Rest, warm fluids and steam usually help. See a doctor if it lasts over a week, you have a high fever, or you struggle to breathe.',['gen']],
[/asthma|wheez|breath/,'For wheezing or breathing trouble, avoid triggers like dust and smoke and keep any prescribed inhaler handy. Persistent or worsening symptoms need a doctor, and severe breathlessness is an emergency (112).',['gen']],
[/headache|migraine|dizz|vertigo|faint/,'Rest in a quiet room and drink water. Sudden severe headaches, or ones with vision changes, weakness or confusion, need urgent care. See a doctor for frequent headaches.',['gen']],
[/rash|itch|skin|acne|pimple|hair fall|hair loss|dandruff|eczema|allerg|fungal|ringworm/,'Avoid scratching and known triggers, and keep the area clean and dry. A dermatologist can help with persistent rashes, acne or hair fall. Swelling of the face or breathing trouble is an emergency.',['der']],
[/joint|knee|back pain|neck pain|bone|fractur|sprain|arthritis|shoulder|muscle|spine|ortho/,'Rest, avoid heavy strain and use a cold or warm pack. See a doctor if there’s swelling, injury, numbness or pain that lasts over a few days. Our Orthopedics department handles this, and our General Physician can do a first check.',['ort','gen']],
[/period|menstrua|pregnan|pcos|menopause|gyn/,'Cycle and pregnancy questions are completely normal to ask. We don’t have a gynecologist listed yet, so our General Physician can do a first consultation and guide you on next steps.',['gen']],
[/sleep|insomnia|snor|tired all/,'Try a fixed sleep and wake time, no screens an hour before bed, less caffeine after noon, and a cool dark room. If poor sleep lasts over 2–3 weeks or affects your day, talk to a doctor.',['gen']],
[/stress|anxi|panic|depress|\bsad\b|lonely|overwhelm|worr|scared|\bfear|low mood|mental|mood|burnout|\bcry/,'I’m sorry it feels hard. What you’re feeling is real, and many people go through it. Slow breathing, a short walk, sleep and talking to someone you trust can help. If it lasts or affects daily life, please speak to a doctor.'+MH,['gen']],
[/diet|nutrition|weight loss|lose weight|gain weight|\beat|\bfood|protein|vitamin|calcium|iron|an(a)?emi/,'Aim for a balanced plate: vegetables, fruit, whole grains, protein and enough water, with less sugar, fried and packaged food. Tiredness or pale skin may need a blood test. Try the BMI and water tools on the Health Check page.',['gen']],
[/exercise|workout|gym|yoga|walk|fitness/,'Most adults benefit from about 150 minutes of moderate activity a week, such as brisk walking, plus muscle-strengthening twice a week. Start gently, build up slowly, and check with a doctor if you have a heart or joint condition.',['gen']],
[/smok|tobacco|vape|alcohol|addict/,'Quitting is one of the best things you can do for your health, and support makes it easier. Don’t be hard on yourself about slips. A doctor can suggest safe ways to cut down or quit.',['gen']],
[/medicine|tablet|paracetamol|dolo|antibiotic|dose|dosage|painkiller|\bpill|syrup/,'I can’t give doses. Please follow your doctor’s prescription or the label, avoid self-medicating, finish antibiotics as prescribed, and tell the doctor about allergies and other medicines. A pharmacist can answer quick questions.',['gen']],
[/thyroid|hormon/,'Thyroid and hormone concerns, like unexplained weight change, hair fall or fatigue, are diagnosed with a blood test. A doctor can order it and explain the results.',['gen']],
[/burn|wound|first aid|bite|nosebleed|\bcut\b/,'First aid: for burns, cool under running water for 10–20 minutes. For cuts, press with a clean cloth and clean the wound. For nosebleeds, lean forward and pinch the nose. Get medical help for deep wounds, animal bites or severe burns.',['gen']],
[/bmi|body mass|water|hydrat|calculator|tool/,'Open the Health Check page for a BMI calculator and a daily water-goal estimator. They’re general guides, so ask a doctor for personal advice.',[{label:'Open Health Check',href:'health-check.html'}]],
[/dark|theme|night mode/,'Tap the 🌙 button at the top right to switch between light and dark mode.'],
[/faq/,'Common questions are answered on the FAQ page, and you can ask me directly too.',[{label:'Open FAQ',href:'faq.html'}]],
[/regist|sign ?up|account|profile|login/,'Open the Register page and fill in your name, email, date of birth, gender and a password. You’ll get an on-screen notification and a welcome email.',[{label:'Open Register page',href:'register.html'}]],
[/contact|phone|call|e-?mail|address|location|where|hours|open/,'📍 Local Healthcare Centre\n📞 +91 98765 43210\n✉ info@medai.com'],
[/data|secure|confidential|remember|record|store|safe to (share|tell)/,'This chat is a simple pre-written assistant running in your browser and it doesn’t send your messages anywhere. Still, avoid sharing passwords or ID numbers here.'],
[/benefit|advantage|challenge|risk/,'Benefits: earlier detection, faster analysis, better monitoring, less admin. Challenges: data privacy, cost, trained staff, tech limits and trust.'],
[/what is medai|about|medai/,'MedAI shows how AI can make local healthcare faster, smarter and more accessible, with symptom checks, appointments and a staff directory.'],
[/symptom|analy[sz]e|diagnos|ai health/,'Open the Health Check page: tap your symptoms and press Analyse symptoms to see possible matches. It’s an educational demo, not a diagnosis.',['gen',{label:'Open Health Check',href:'health-check.html'}]],
[/appointment|book|schedule|consult|visit|slot/,'Happy to help. Choose a department below and I’ll open the booking form with it selected. You then add your name, phone and date.',['gen','car','ped','der']],
[/doctor|staff|physician|cardio|pediatric|dermat|team|specialist|recommend|suggest/,'Our team: Dr. Rahul Sharma (General Physician, 12+ yrs), Dr. Priya Mehta (Cardiologist, 10+ yrs), Dr. Arjun Patel (Pediatrician, 8+ yrs), Dr. Ananya Rao (Dermatologist, 7+ yrs). Tell me your concern and I’ll suggest who to see.',['gen','car','ped','der',{label:'See all doctors',href:'doctors.html'}]],
[/thank|thanks|bye|ok(ay)?$/,'You’re welcome! Take care and stay healthy 💚']];
const FALL='I’m not sure I have an answer for that. I can help with symptoms, sleep, stress, diet, medicines, children’s health and more. If you’re unsure who to see, our General Physician is a good first step.';
const msgs=$('#msgs'),ci=$('#ci');let noted=false;
let flow=null;
function add(t,c,k){const d=document.createElement('div');d.className='m '+c;d.textContent=t;
if(k&&k.length){const a=document.createElement('div');a.className='acts';k.forEach(x=>{const str=typeof x==='string',b=document.createElement(str?'button':'a');
if(str){b.type='button';b.textContent=D[x][1]?'Book with '+D[x][1]:'Book '+D[x][0];b.onclick=()=>book(x)}else{b.textContent=x.label;b.href=x.href}
a.append(b)});d.append(a)}
msgs.append(d);msgs.scrollTop=msgs.scrollHeight}
function book(x){location.href='appointment.html?dept='+encodeURIComponent(D[x][0])}
function startReport(){flow={step:'email'};add('I can email your health report. 📧 Please type the email address you registered with. (Say “cancel” any time. Demo: demo@medai.com)','bot')}
function flowStep(q){
if(flow.step==='email'){const e=q.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){add('That doesn’t look like an email address. Please type the email you registered with, or say “cancel”.','bot');return}
flow={step:'dob',email:e};add('Thanks. To confirm it’s you, please type your date of birth (for example 15-05-1990).','bot');return}
const dob=normDob(q);if(!dob){add('Please type your date of birth as DD-MM-YYYY, or say “cancel”.','bot');return}
const em=flow.email;flow=null;add('Checking your record…','bot');
deliverReport(em,dob).then(r=>add(r.msg,'bot',r.acts))}
function reply(q){const l=q.toLowerCase();
if(flow&&(KB[0][0].test(l)||KB[1][0].test(l)))flow=null;
if(flow){if(/cancel|stop|never ?mind/.test(l)){flow=null;add('No problem, I’ve cancelled that. Anything else I can help with?','bot');return}flowStep(q);return}
const h=KB.find(([r])=>r.test(l));
if(!h){add(FALL,'bot',['gen']);return}
if(typeof h[1]==='function'){h[1]();return}
let t=h[1];const k=h[2]||[],dk=k.filter(x=>typeof x==='string');
if(dk.length&&dk.length<3)t+='\n\n👩‍⚕️ Suggested: '+dk.map(x=>D[x][1]?D[x][1]+' ('+D[x][0]+')':D[x][0]+' department').join(' or ');
if(dk.length&&!noted){noted=true;t+='\n\nℹ️ General information only, not a diagnosis.'}
add(t,'bot',k)}
function ask(q){add(q,'me');const t=document.createElement('div');t.className='m bot';t.textContent='…';msgs.append(t);msgs.scrollTop=msgs.scrollHeight;
setTimeout(()=>{t.remove();reply(q)},500)}
['Which doctor should I see?','Book appointment','Email my health report','I feel stressed','Health tools','Contact'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>ask(q);$('#qr').append(b)});
let greeted=false;
function toggle(open){$('#chat').classList.toggle('open',open);if(open&&!greeted){greeted=true;add('Hi, I’m the MedAI assistant 👋 Ask me about symptoms, health worries, sleep, stress, diet or medicines, tell me your concern and I’ll suggest a doctor, or ask me to email your health report.','bot')}if(open)ci.focus()}
$('#fab').onclick=()=>toggle(!$('#chat').classList.contains('open'));
$('#x').onclick=()=>toggle(false);
$('#cf').onsubmit=e=>{e.preventDefault();const v=ci.value.trim();if(v){ci.value='';ask(v)}};
