const assert=require('node:assert/strict');
const {makeChoices,generate}=require('../dist/questions.js');
let seed=43;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
function verify(answer,choices){assert.equal(choices.length,4);assert.equal(new Set(choices).size,4);assert.equal(choices.filter(v=>v===answer).length,1);for(const value of choices){assert(Number.isInteger(value)&&value>=0);assert(Math.abs(value-answer)<=3);}}
const positions=new Set();
for(let answer=0;answer<=200;answer++)for(let i=0;i<100;i++){const choices=makeChoices(answer,random);verify(answer,choices);positions.add(choices.indexOf(answer));}
assert.equal(positions.size,4);
for(const answer of [0,1,2,5,12,100,144,200])for(const sample of [0,0.5,0.999999])verify(answer,makeChoices(answer,()=>sample));
for(const invalid of [-1,0.5,201,NaN,Infinity])assert.throws(()=>makeChoices(invalid));
for(const level of ['easy','medium','hard'])for(const type of ['addition','subtraction','multiplication','division']){
 for(const q of generate({types:[type],difficulty:level,questionCount:20},random))verify(q.answer,q.choices);
}
console.log('PASS: 20,100 answer-choice sets, every answer 0–200, all four correct-answer positions, constant random sources, invalid inputs, and generated-question integration.');
for(const answer of [0,1,2,144,200])console.log(`Example correct answer ${answer}: ${makeChoices(answer,random).join(', ')}`);
