const PracticeStats = (() => {
  function summarize(sessions) {
    const blank = () => ({attempted:0,correct:0,incorrect:0,accuracy:0});
    const total=blank();
    const byType=Object.fromEntries(['addition','subtraction','multiplication','division'].map(t=>[t,blank()]));
    const byDifficulty=Object.fromEntries(['easy','medium','hard'].map(t=>[t,blank()]));
    const seen=new Set();
    for(const session of sessions){
      if(seen.has(session.id))continue;
      seen.add(session.id);
      for(const question of session.questions){
        if(!question.flipped)continue;
        for(const group of [total,byType[question.type],byDifficulty[session.config.difficulty]]){
          group.attempted++;
          if(question.selected===question.answer)group.correct++;else group.incorrect++;
        }
      }
    }
    for(const group of [total,...Object.values(byType),...Object.values(byDifficulty)])group.accuracy=group.attempted?Math.round(group.correct/group.attempted*100):null;
    return {total,byType,byDifficulty};
  }
  return {summarize};
})();
if(typeof module!=='undefined')module.exports=PracticeStats;
