const MistakeReview = (() => {
  function generate(config, mistakes, random = Math.random) {
    const sources=mistakes.filter(m=>m.difficulty===config.difficulty&&config.types.includes(m.type));
    if(!sources.length)throw new Error('No saved mistakes match these math types and difficulty. Try different choices or regular practice.');
    const candidates=new Map();
    for(const source of sources){
      const pool=[];
      const level=PracticeConfig.levels[source.difficulty];
      const max=['addition','subtraction'].includes(source.type)?level.addMax:level.factMax;
      const min=['addition','subtraction'].includes(source.type)?0:1;
      for(let n=min;n<=max;n++){
        const pairs=source.type==='division'?[[source.b*n,source.b],[source.answer*n,n]]:[[source.a,n],[n,source.b]];
        for(const [a,b] of pairs){
          // Do not normalize reversed subtraction into another question.
          if(source.type==='subtraction'&&a<b)continue;
          const q=MathQuestions.calculate(source.type,a,b,source.difficulty);
          if(q.a===source.a&&q.b===source.b)continue;
          pool.push({...q,sourceMistakeKey:source.key,sourceDifficulty:source.difficulty});
        }
      }
      candidates.set(source.key,pool);
    }
    const used=new Set(),result=[];
    // Each pass consumes at most one new candidate per source. No retry loop.
    for(let pass=0;pass<config.questionCount;pass++)for(const source of sources){
      if(result.length===config.questionCount)break;
      const available=candidates.get(source.key).filter(q=>!used.has(JSON.stringify([q.type,q.a,q.b])));
      if(!available.length)continue;
      const question=available[Math.floor(random()*available.length)];
      used.add(JSON.stringify([question.type,question.a,question.b]));
      result.push({...question,choices:MathQuestions.makeChoices(question.answer,random)});
    }
    if(!result.length)throw new Error('No similar questions are available for these mistakes.');
    return result;
  }
  return {generate};
})();
if(typeof module!=='undefined')module.exports=MistakeReview;
