const BrowserSave = (() => {
  const key = 'math-practice-v1';
  function validSession(s) {
    if (!s || typeof s.id !== 'string' || !s.config || !Array.isArray(s.questions)) return false;
    const counts={easy:5,medium:10,hard:20};
    if (!Object.hasOwn(counts,s.config.difficulty) || (s.config.mode==='review' ? (!Number.isInteger(s.config.questionCount)||s.config.questionCount<1||s.config.questionCount>counts[s.config.difficulty]) : s.config.questionCount!==counts[s.config.difficulty]) || s.questions.length!==s.config.questionCount) return false;
    if (!Array.isArray(s.config.types) || !s.config.types.length || s.config.types.some(t=>!['addition','subtraction','multiplication','division'].includes(t))) return false;
    if (!Number.isInteger(s.index) || s.index<0 || s.index>=s.questions.length || typeof s.finished!=='boolean') return false;
    try {
      for(const q of s.questions){
        const expected=MathQuestions.calculate(q.type,q.a,q.b,s.config.difficulty);
        if(!s.config.types.includes(q.type)||expected.answer!==q.answer||expected.symbol!==q.symbol||!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.every(n=>Number.isInteger(n)&&n>=0)||q.choices.filter(n=>n===q.answer).length!==1)return false;
        if(s.config.mode==='review'&&(typeof q.sourceMistakeKey!=='string'||q.sourceDifficulty!==s.config.difficulty))return false;
        if(q.selected!==undefined&&!q.choices.includes(q.selected))return false;
        if(q.flipped!==undefined&&typeof q.flipped!=='boolean')return false;
        if(q.flipped&&q.selected===undefined)return false;
      }
      if(s.questions.some((q,i)=>i<s.index&&!q.flipped))return false;
      if(s.finished&&s.questions.some(q=>!q.flipped))return false;
    }catch{return false;}
    return true;
  }
  function empty(){return {version:1,settings:{types:[],difficulty:'easy'},sessions:[],activeId:null};}
  function load(storage){
    try{
      const raw=storage.getItem(key);if(raw===null)return {data:empty(),message:''};
      const data=JSON.parse(raw);
      if(!data||data.version!==1||!Array.isArray(data.sessions)||!data.sessions.every(validSession)||new Set(data.sessions.map(s=>s.id)).size!==data.sessions.length)throw Error();
      PracticeConfig.create(data.settings.types.length?data.settings.types:['addition'],data.settings.difficulty);
      if(!Array.isArray(data.settings.types)||data.settings.types.some(t=>!Object.hasOwn(PracticeConfig.types,t)))throw Error();
      if(data.activeId!==null&&!data.sessions.some(s=>s.id===data.activeId))throw Error();
      return {data,message:''};
    }catch{return {data:empty(),message:'Saved progress could not be loaded. You can still practice; a new save will replace the unreadable data.'};}
  }
  function save(storage,data){try{storage.setItem(key,JSON.stringify(data));return '';}catch{return 'Browser saving is unavailable. You can keep practicing, but new progress may be lost when you close or refresh.';}}
  return {load,save,empty,validSession,key};
})();
if(typeof module!=='undefined')module.exports=BrowserSave;
