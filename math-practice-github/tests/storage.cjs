const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function el(){return {textContent:'',children:[],hidden:false,focus(){},setAttribute(){},append(...c){this.children.push(...c)},replaceChildren(){this.children=[]},addEventListener(e,f){this[e]=f}}}
let raw=null;const storage={getItem(){return raw},setItem(k,v){raw=v}};
function boot(store=storage){
 const els=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],el()]));
 const types=['addition','subtraction','multiplication','division'].map(value=>({...el(),value,checked:false}));
 const levels=['easy','medium','hard'].map(value=>({...el(),value,checked:value==='easy'}));
 const defaultTypes=types.map(i=>({...el(),value:i.value,checked:false}));
 const defaultLevels=levels.map(i=>({...el(),value:i.value,checked:false}));
 let change;
 const window={location:{hash:'#/session'},localStorage:store,crypto:{randomUUID:()=>require('node:crypto').randomUUID()},scrollTo(){},addEventListener(e,f){change=f}};
 const document={getElementById:id=>els[id],createElement:el,querySelector:s=>s.includes('defaultDifficulty')?defaultLevels.find(l=>l.checked):s.includes('difficulty')?levels.find(l=>l.checked):types[0],querySelectorAll:s=>{const list=s.includes('defaultDifficulty')?defaultLevels:s.includes('defaultType')?defaultTypes:s.includes('difficulty')?levels:types;return s.includes(':checked')?list.filter(i=>i.checked):list}};
 const ctx=vm.createContext({window,document});for(const file of ['practice-config.js','questions.js','storage.js','stats.js','mistakes.js','review.js','navigation.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 return {els,types,levels,defaultTypes,defaultLevels,change,go(route){window.location.hash=route;change()},start(){els['practice-form'].submit({preventDefault(){}});window.location.hash='#/session';change()},card(){return els['question-list'].children}};
}
let app=boot();app.types[0].checked=true;app.els['practice-form'].change();app.start();
let card=app.card();card[2].children[1].children[0].change();
app=boot();assert(app.types[0].checked);assert.equal(app.card()[4].disabled,false);assert.match(app.card()[7].textContent,/0 answered/);
app.card()[4].click();for(let i=0;i<10;i++)app.card()[4].click();
app=boot();assert.equal(app.card()[5].hidden,false);assert.match(app.card()[7].textContent,/1 answered/);
assert.equal(JSON.parse(raw).sessions.length,1);
app.card()[6].click();app=boot();assert.match(app.card()[0].textContent,/Question 2 of 5/);assert.equal(app.card()[4].disabled,true);
for(let i=1;i<5;i++){card=app.card();card[2].children[1].children[0].change();card[4].click();card[6].click()}
app=boot();assert.equal(app.card()[0].textContent,'Session complete!');assert.equal(JSON.parse(raw).sessions.length,1);assert.equal(JSON.parse(raw).sessions[0].questions.filter(q=>q.flipped).length,5);
app.start();assert.equal(JSON.parse(raw).sessions.length,2);assert.match(app.card()[7].textContent,/0 answered/);
raw='{broken';app=boot();assert.match(app.els['save-status'].textContent,/could not be loaded/);app.types[0].checked=true;app.start();assert.equal(app.card()[0].textContent,'Question 1 of 5');
const broken={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};app=boot(broken);app.types[0].checked=true;app.start();app.card()[2].children[1].children[0].change();app.card()[4].click();assert.match(app.els['save-status'].textContent,/unavailable/);assert.match(app.card()[7].textContent,/1 answered/);
raw=JSON.stringify({version:1,sessions:[{bad:true}]});app=boot();assert.match(app.els['save-status'].textContent,/could not be loaded/);
console.log('PASS: simulated refresh/reopen restores settings, unflipped selection, locked answer, next card, completed summary; repeated clicks keep one session and five attempts; new session preserves history. Corrupt/blocked/quota storage does not crash practice.');

raw=null;
app=boot();app.types[0].checked=true;app.start();
const initial=JSON.parse(raw).sessions[0];
for(let cycle=0;cycle<5;cycle++){
 app.go('#/');assert.equal(app.els['resume-session'].hidden,false);
 app.go('#/practice');assert.equal(app.els['setup-resume'].hidden,false);
 app.go('#/session');app=boot();
 assert.equal(JSON.parse(raw).sessions[0].id,initial.id);
 assert.equal(app.card()[4].disabled,true);assert.match(app.card()[7].textContent,/0 answered/);
 assert.deepEqual(JSON.parse(raw).sessions[0].questions,initial.questions);
}
app.card()[2].children[1].children[0].change();
const picked=JSON.parse(raw).sessions[0].questions[0].selected;
for(let cycle=0;cycle<5;cycle++){
 app.go('#/');app.go('#/session');app=boot();
 assert.equal(JSON.parse(raw).sessions[0].questions[0].selected,picked);
 assert.match(app.card()[7].textContent,/0 answered/);assert.equal(app.card()[4].disabled,false);
}
app.card()[4].click();const snapshot=raw;
for(let cycle=0;cycle<5;cycle++){
 app.go('#/');app.go('#/stats');app.go('#/session');app=boot();
 for(let repeat=0;repeat<10;repeat++)app.card()[4].click();
 assert.equal(raw,snapshot);assert.equal(app.card()[5].hidden,false);assert.match(app.card()[7].textContent,/1 answered/);
}
app.card()[6].click();app=boot();assert.equal(app.card()[4].disabled,true);assert.match(app.card()[0].textContent,/Question 2 of 5/);
assert.equal(JSON.parse(raw).sessions[0].questions.filter(q=>q.flipped).length,1);
assert.equal(JSON.parse(raw).sessions.length,1);
console.log('PASS: repeated leave/Home/setup/Stats/return and simulated refresh before picking, after picking, after flipping, and after Next preserve question order, answer order, selection, lock state, ID, and exact saved counts.');

raw=null;app=boot();app.types[0].checked=true;app.start();
let question=JSON.parse(raw).sessions[0].questions[0];
let wrongIndex=question.choices.findIndex(n=>n!==question.answer);
app.card()[2].children[wrongIndex+1].children[0].change();
app.go('#/stats');assert.equal(app.els['mistakes-list'].children.length,0);
app.go('#/session');app.card()[4].click();app.go('#/stats');
assert.equal(app.els['mistakes-list'].children.length,1);
const mistakeText=app.els['mistakes-list'].children[0].textContent;
app=boot();app.go('#/stats');assert.equal(app.els['mistakes-list'].children[0].textContent,mistakeText);
console.log('PASS: wrong picks are not saved until flipped; one saved mistake with type/difficulty survives simulated refresh and appears on Stats.');

raw=null;app=boot();app.types[0].checked=true;app.els['practice-form'].change();
assert.equal(app.els['review-start'].disabled,true);app.start();
question=JSON.parse(raw).sessions[0].questions[0];wrongIndex=question.choices.findIndex(n=>n!==question.answer);
app.card()[2].children[wrongIndex+1].children[0].change();app.card()[4].click();
app.go('#/stats');assert.equal(app.els['review-from-stats'].hidden,false);
app.go('#/practice');assert.equal(app.els['review-start'].disabled,false);
app.els['practice-form'].submit({preventDefault(){},submitter:{value:'review'}});app.go('#/session');
let reviewRecord=JSON.parse(raw).sessions.find(s=>s.id===JSON.parse(raw).activeId);
assert.equal(reviewRecord.config.mode,'review');assert(reviewRecord.questions.every(q=>q.sourceMistakeKey));
const reviewId=reviewRecord.id, reviewQuestions=JSON.stringify(reviewRecord.questions);
app=boot();reviewRecord=JSON.parse(raw).sessions.find(s=>s.id===reviewId);
assert.equal(JSON.stringify(reviewRecord.questions),reviewQuestions);
assert.match(app.card().at(-1).textContent,/Similar to your saved mistake/);
assert.equal(JSON.parse(raw).sessions.length,2);
assert.equal(JSON.parse(raw).sessions.flatMap(s=>s.questions).filter(q=>q.flipped).length,1);
app.go('#/practice');app.types[0].checked=false;app.types[3].checked=true;app.els['practice-form'].change();assert.equal(app.els['review-start'].disabled,true);
console.log('PASS full path: wrong addition answer → Stats review link → matching review enabled → linked review session → simulated refresh restores same review with only the original attempt counted. Nonmatching types disable review.');

raw=null;app=boot();app.types[0].checked=true;app.start();const activeBefore=JSON.parse(raw).sessions[0];
app.go('#/settings');app.defaultTypes.forEach(i=>i.checked=i.value==='division');app.defaultLevels.forEach(i=>i.checked=i.value==='hard');app.els['settings-form'].change();
assert.deepEqual(JSON.parse(raw).settings,{types:['division'],difficulty:'hard'});
assert.deepEqual(JSON.parse(raw).sessions[0],activeBefore);
app=boot();app.go('#/settings');assert(app.defaultTypes.find(i=>i.value==='division').checked);assert(app.defaultLevels.find(i=>i.value==='hard').checked);
app.go('#/practice');app.start();assert.match(app.els['session-summary'].textContent,/Division · Hard · 20 questions/);
app.go('#/settings');app.defaultTypes.forEach(i=>i.checked=false);app.els['settings-form'].change();app.go('#/practice');app.start();assert.match(app.els['setup-error'].textContent,/at least one/);
console.log('PASS Settings: Division + Hard survives simulated reopen and starts 20 division questions; active session unchanged; clearing all types blocks starting.');

// Requested acceptance scenario, using only the in-memory test store.
raw=null;app=boot();app.types.forEach(i=>i.checked=true);app.start();
const acceptance=[];
for(let index=0;index<5;index++){
 const data=JSON.parse(raw);const q=data.sessions.find(s=>s.id===data.activeId).questions[index];
 const pick=index===4?q.choices.find(n=>n!==q.answer):q.answer;
 const radio=app.card()[2].children.slice(1).map(label=>label.children[0]).find(input=>Number(input.value)===pick);
 radio.change();app.card()[4].click();app.card()[4].click();
 acceptance.push(`${q.a} ${q.symbol} ${q.b}: picked ${pick}, answer ${q.answer}, ${index===4?'wrong':'right'}`);
 app.card()[6].click();
}
assert.deepEqual(app.card()[2].children.filter((_,i)=>i%2).map(n=>n.textContent),['5','4','1','80%']);
app.go('#/stats');assert.deepEqual(app.els['stats-content'].children[0].children[1].children.filter((_,i)=>i%2).map(n=>n.textContent),['5','4','1','80%']);assert.equal(app.els['mistakes-list'].children.length,1);
app=boot();app.go('#/stats');assert.deepEqual(app.els['stats-content'].children[0].children[1].children.filter((_,i)=>i%2).map(n=>n.textContent),['5','4','1','80%']);assert.equal(app.els['mistakes-list'].children.length,1);
console.log('ACCEPTANCE: '+acceptance.join(' | '));
console.log('PASS requested acceptance: 5 attempted, 4 correct, 1 incorrect, 80%, 1 mistake; summary and Stats agree before and after simulated reopen. Real browser data untouched.');
