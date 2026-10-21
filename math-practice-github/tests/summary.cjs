const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function element(){return {textContent:'',children:[],hidden:false,focus(){},setAttribute(){},append(...c){this.children.push(...c)},replaceChildren(){this.children=[]},addEventListener(e,f){this[e]=f}}}
function run(difficulty,results){
 const els=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],element()]));
 let change;
 const window={crypto:{randomUUID:()=>require('node:crypto').randomUUID()},location:{hash:'#/practice'},scrollTo(){},addEventListener(e,f){change=f}};
 const document={getElementById:id=>els[id],createElement:element,querySelector:s=>s.includes('difficulty')?{value:difficulty}:{focus(){}},querySelectorAll:()=>[{value:'addition'}]};
 const config=require('../dist/practice-config.js');
 const math={generate:s=>Array.from({length:s.questionCount},()=>({type:'addition',a:0,b:0,symbol:'+',answer:0,choices:[0,1,2,3]}))};
 vm.runInNewContext(fs.readFileSync(path.join(root,'navigation.js'),'utf8'),{document,window,PracticeConfig:config,MathQuestions:math,PracticeMistakes:require('../dist/mistakes.js'),PracticeStats:require('../dist/stats.js'),BrowserSave:{load:()=>({data:{settings:{types:[],difficulty:'easy'},sessions:[],activeId:null}}),save:()=>''}});
 els['practice-form'].submit({preventDefault(){}});window.location.hash='#/session';change();
 results.forEach(correct=>{const card=els['question-list'].children;card[2].children[correct?1:2].children[0].change();for(let i=0;i<5;i++)card[4].click();card[6].click();card[6].click()});
 const children=els['question-list'].children;assert.equal(children[0].textContent,'Session complete!');
 const right=results.filter(Boolean).length;
 const values=children[2].children.filter((_,i)=>i%2===1).map(e=>e.textContent);
 assert.deepEqual(values,[String(results.length),String(right),String(results.length-right),`${Math.round(right/results.length*100)}%`]);
 assert.match(children[3].textContent,new RegExp(`you picked ${results.at(-1)?0:1}`));
 assert.equal(children[5].href,'#/practice');assert.equal(children[6].href,'#/stats');
 window.location.hash='#/stats';change();assert.equal(els['stats-page'].hidden,false);
 window.location.hash='#/session';change();assert.deepEqual(els['question-list'].children[2].children.filter((_,i)=>i%2).map(e=>e.textContent),values);
 window.location.hash='#/practice';change();els['practice-form'].submit({preventDefault(){}});window.location.hash='#/session';change();assert.match(els['question-list'].children[7].textContent,/0 answered/);
 console.log(`PASS ${difficulty}: attempted ${results.length}, correct ${right}, incorrect ${results.length-right}, accuracy ${values[3]}, last answer included; repeated clicks and return visits leave totals unchanged.`);
}
run('easy',[true,false,true,false,true]);run('easy',[true,true,true,true,false]);run('easy',Array(5).fill(true));run('easy',Array(5).fill(false));run('medium',Array.from({length:10},(_,i)=>i<7));run('hard',Array.from({length:20},(_,i)=>i<13));
