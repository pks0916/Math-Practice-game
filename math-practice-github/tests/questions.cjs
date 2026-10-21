const assert=require('node:assert/strict');
const {calculate,generate}=require('../dist/questions.js');
let checked=0;
for(const [level,max,count] of [['easy',10,5],['medium',20,10],['hard',100,20]]){
 for(let a=0;a<=max;a++)for(let b=0;b<=max;b++){
  const add=calculate('addition',a,b,level),sub=calculate('subtraction',a,b,level);
  assert.equal(add.answer,a+b);assert.equal(sub.answer,Math.abs(a-b));assert(sub.a>=sub.b);checked+=2;
 }
 for(const type of ['addition','subtraction'])for(const n of [-1,max+1,0.5])assert.throws(()=>calculate(type,n,0,level));
 for(const types of [['addition'],['subtraction'],['addition','subtraction']])for(let run=0;run<20;run++){
  const qs=generate({types,difficulty:level,questionCount:count});assert.equal(qs.length,count);
  assert.equal(new Set(qs.map(q=>`${q.type}:${q.a}:${q.b}`)).size,count);
  for(const q of qs){assert(types.includes(q.type));assert(q.a>=0&&q.a<=max&&q.b>=0&&q.b<=max);assert.equal(q.answer,q.type==='addition'?q.a+q.b:q.a-q.b);assert(q.answer>=0);}
 }
 console.log(`PASS ${level}: 0 + 0 = 0; ${max} + ${max} = ${2*max}; ${max} − ${max} = 0; 0 and ${max} reordered to ${max} − 0 = ${max}; ${count} questions.`);
}
assert.throws(()=>generate({types:['unknown'],difficulty:'easy',questionCount:5}));
console.log(`PASS: ${checked} exhaustive calculations and 180 generated sessions; out-of-range inputs and invalid types rejected.`);
