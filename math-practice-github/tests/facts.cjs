const assert=require('node:assert/strict');
const {calculate,generate}=require('../dist/questions.js');
let facts=0,sessions=0;
const types=['addition','subtraction','multiplication','division'];
for(const [level,max,count] of [['easy',5,5],['medium',10,10],['hard',12,20]]){
 for(let a=1;a<=max;a++)for(let b=1;b<=max;b++){
  const m=calculate('multiplication',a,b,level);assert.equal(m.answer,a*b);
  const d=calculate('division',a*b,a,level);assert.equal(d.answer,b);assert.equal(d.a/d.b,d.answer);facts+=2;
 }
 for(const [a,b] of [[1,0],[0,1],[3,2],[max*(max+1),max],[max+1,max+1]])assert.throws(()=>calculate('division',a,b,level));
 for(const [a,b] of [[0,1],[1,0],[max+1,1],[1,max+1]])assert.throws(()=>calculate('multiplication',a,b,level));
 for(let mask=1;mask<16;mask++)for(let run=0;run<20;run++){
  const selected=types.filter((_,i)=>mask&(1<<i));
  const qs=generate({types:selected,difficulty:level,questionCount:count});sessions++;
  assert.equal(qs.length,count);assert.equal(new Set(qs.map(q=>`${q.type}:${q.a}:${q.b}`)).size,count);
  const counts=selected.map(t=>qs.filter(q=>q.type===t).length);assert(Math.max(...counts)-Math.min(...counts)<=1);
  for(const q of qs){assert(selected.includes(q.type));
   if(q.type==='multiplication'){assert(q.a>=1&&q.a<=max&&q.b>=1&&q.b<=max);assert.equal(q.answer,q.a*q.b);}
   if(q.type==='division'){assert(q.b>=1&&q.b<=max);assert(Number.isInteger(q.answer)&&q.answer>=1&&q.answer<=max);assert.equal(q.a/q.b,q.answer);}
  }
 }
 console.log(`PASS ${level}: 1 × 1 = 1; ${max} × ${max} = ${max*max}; 1 ÷ 1 = 1; ${max*max} ÷ ${max} = ${max}; ${max} ÷ 1 = ${max}; ${max} ÷ ${max} = 1.`);
}
console.log(`PASS ${facts} multiplication/division facts, ${sessions} generated sessions, zero-divisor and non-whole-answer rejection, unique questions, and balanced mixed sessions.`);
