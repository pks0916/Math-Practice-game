const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({});for(const f of ['practice-config','questions','mistakes','review','storage'])vm.runInContext(fs.readFileSync(`${__dirname}/../dist/${f}.js`,'utf8'),ctx);
vm.runInContext(`globalThis.api={PracticeConfig,MathQuestions,PracticeMistakes,MistakeReview,BrowserSave}`,ctx);
const {PracticeConfig:C,MathQuestions:Q,PracticeMistakes:M,MistakeReview:R,BrowserSave:S}=ctx.api;
for(const difficulty of ['easy','medium','hard'])for(const type of Object.keys(C.types)){
 const q=Q.calculate(type,type==='division'?4:2,type==='division'?2:1,difficulty);
 const source=M.collect([{id:'source',config:{difficulty},questions:[{...q,flipped:true,selected:99}]}])[0];
 const config=C.create([type],difficulty);const review=R.generate(config,[source]);
 assert(review.length>0&&review.length<=config.questionCount);
 for(const r of review){assert.equal(r.sourceMistakeKey,source.key);assert.equal(r.type,type);assert.equal(r.sourceDifficulty,difficulty);assert(r.a!==q.a||r.b!==q.b);assert.equal(Q.calculate(type,r.a,r.b,difficulty).answer,r.answer);}
 assert.equal(new Set(review.map(r=>`${r.type}:${r.a}:${r.b}`)).size,review.length);
 const record={id:'review',config:{...config,mode:'review',questionCount:review.length},questions:review,index:0,finished:false};
 assert(S.validSession(JSON.parse(JSON.stringify(record))));
}
assert.throws(()=>R.generate(C.create(['addition'],'easy'),[]));
const history=[{id:'a',config:{difficulty:'easy'},questions:[{type:'division',a:4,b:2,answer:2,selected:1,flipped:true},{type:'division',a:2,b:4,answer:.5,selected:1,flipped:true}]}];assert.equal(M.collect(history).length,2);
console.log('PASS: all 12 type/level review combinations; valid similar questions, source links survive serialization, no repeats, matching filters, empty pool error, ordered mistake identity.');
