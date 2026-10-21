const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const MathQuestions=require(path.join(root,'questions.js'));
const config=require(path.join(root,'practice-config.js'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],{hidden:false,textContent:'',children:[],append(...children){this.children.push(...children);},replaceChildren(){this.children=[];},focus(){},addEventListener(event,fn){this[event]=fn;}}]));
let selected=[],difficulty='easy',change;
const document={createElement:()=>({focus(){},replaceChildren(){this.children=[];},setAttribute(){},addEventListener(event,fn){this[event]=fn;},textContent:'',children:[],append(...children){this.children.push(...children);}}),getElementById:id=>{assert(elements[id],id);return elements[id];},querySelector:selector=>selector.includes('difficulty')?(difficulty?{value:difficulty}:null):{focus(){}},querySelectorAll:()=>selected.map(value=>({value}))};
const window={crypto:{randomUUID:()=>require('node:crypto').randomUUID()},location:{hash:'#/practice'},addEventListener:(event,fn)=>{change=fn;},scrollTo(){}};
vm.runInNewContext(fs.readFileSync(path.join(root,'navigation.js'),'utf8'),{PracticeConfig:config,MathQuestions,document,window,PracticeMistakes:require('../dist/mistakes.js'),PracticeStats:require('../dist/stats.js'),BrowserSave:{load:()=>({data:{settings:{types:[],difficulty:'easy'},sessions:[],activeId:null}}),save:()=>''}});
const submit=()=>elements['practice-form'].submit({preventDefault(){}});
submit();assert.equal(window.location.hash,'#/practice');assert.match(elements['setup-error'].textContent,/at least one/);
for(let mask=1;mask<16;mask++)for(const [level,count] of [['easy',5],['medium',10],['hard',20]]){
 selected=Object.keys(config.types).filter((_,i)=>mask&(1<<i));difficulty=level;
 elements['practice-form'].change();assert.match(elements['length-summary'].textContent,new RegExp(`${count} questions`));
 submit();assert.equal(window.location.hash,'/session');window.location.hash='#/session';change();
 assert.equal(elements['session-page'].hidden,false);
 for(let index=0;index<count;index++){
  const [progress,prompt,choices,selection,flip,result,next,score,meter]=elements['question-list'].children;
  assert.equal(progress.textContent,`Question ${index+1} of ${count}`);
  assert.equal(meter.max,count);assert.equal(meter.value,index);
  next.click();assert.equal(elements['question-list'].children[0].textContent,`Question ${index+1} of ${count}`);
  assert.match(prompt.textContent,/ = \?/);
  const inputs=choices.children.slice(1).map(label=>label.children[0]);
  assert.equal(inputs.length,4);assert.equal(new Set(inputs.map(i=>i.value)).size,4);
  assert(inputs.every(i=>!i.checked));assert.equal(flip.disabled,true);
  flip.click();assert.equal(result.textContent,'');
  inputs[0].change();assert.equal(flip.disabled,false);assert.equal(inputs.filter(i=>i.checked).length,1);
  inputs[1].change();assert.equal(inputs[0].checked,false);assert.equal(inputs[1].checked,true);
  assert.equal(selection.textContent,`Selected answer: ${inputs[1].value}`);
  flip.click();assert.equal(flip.disabled,true);assert(inputs.every(i=>i.disabled));
  assert.equal(result.hidden,false);assert.equal(choices.hidden,true);
  assert.equal(result.children[2].textContent,`You picked: ${inputs[1].value}`);
  assert.equal(result.children[3].children.filter(b=>b.className==='outcome selected').length,1);
  assert(result.children[3].children.every(b=>b.disabled));
  const scoreBefore=score.textContent;
  assert.match(scoreBefore,new RegExp(`${index+1} answered`));
  const revealed=JSON.stringify(result.children);
  for(let repeat=0;repeat<10;repeat++){flip.click();inputs[2].change();}
  assert.equal(score.textContent,scoreBefore);assert.equal(JSON.stringify(result.children),revealed);

  assert.equal(next.hidden,false);assert.equal(meter.value,index+1);
  assert.equal(next.textContent,index===count-1?'Finish session':'Next question');
  if(index<count-1){next.click();next.click();assert.equal(elements['question-list'].children[0].textContent,`Question ${index+2} of ${count}`);}
  else {next.click();next.click();assert.equal(elements['question-list'].children[0].textContent,'Session complete!');assert.match(elements['question-list'].children[1].textContent,new RegExp(`${count} of ${count} questions completed`));change();assert.equal(elements['question-list'].children[0].textContent,'Session complete!');}
 }
 assert.equal(elements['session-summary'].textContent,`${selected.map(t=>config.types[t]).join(', ')} · ${config.levels[level].label} · ${count} questions`);
}
selected=[];window.location.hash='#/practice';submit();assert.equal(window.location.hash,'#/practice');
for(const level of ['bogus',undefined,'constructor'])assert.throws(()=>config.create(['addition'],level));
assert.throws(()=>config.create(['bogus'],'easy'));
window.location.hash='#/session';
vm.runInNewContext(fs.readFileSync(path.join(root,'navigation.js'),'utf8'),{PracticeConfig:config,MathQuestions,document,window,PracticeMistakes:require('../dist/mistakes.js'),PracticeStats:require('../dist/stats.js'),BrowserSave:{load:()=>({data:{settings:{types:[],difficulty:'easy'},sessions:[],activeId:null}}),save:()=>''}});
assert.match(elements['session-summary'].textContent,/No session choices/);
window.location.hash='#constructor';change();assert.equal(elements['page-title'].textContent,'Page not found');
console.log('PASS: all 45 math-type/level combinations reach the session with exact types and 5/10/20 counts.');
console.log('PASS: empty selections, invalid settings, refreshed/direct sessions, and unknown routes are handled.');
console.log('Form and route checks use a simulated document; live browser clicking is not verified.');

console.log('PASS: 525 cards tested for disabled Flip, selection changes, single selection, reveal locking, and fresh next-card state.');

console.log('PASS: full 5/10/20-question sessions, progress on every flip, no early Next, repeated Next/Finish, completion view, and clean new-session resets.');
