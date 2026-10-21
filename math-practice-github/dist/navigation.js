(() => {
  const get = id => document.getElementById(id);
  const pages = {
    '/stats': ['Stats', 'Stats aren’t built yet. Session totals are shown on the practice card. Saved sessions are stored in this browser; this Stats page is still unfinished.'],
    '/settings': ['Settings', 'Settings aren’t built yet. Practice choices are available on the Practice page.']
  };
  let session = null;
  let questions = [];
  let cardIndex = 0;
  let sessionFinished = false;
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const loaded = BrowserSave.load(storage);
  let saved = loaded.data;
  let activeId = saved.activeId;
  get('save-status').textContent = loaded.message || 'Progress saves on this browser only.';
  const restored = saved.sessions.find(s => s.id === activeId);
  if (restored) {
    session = restored.config; questions = restored.questions;
    cardIndex = restored.index; sessionFinished = restored.finished;
  }
  document.querySelectorAll('input[name="mathType"]').forEach(input => { input.checked = saved.settings.types.includes(input.value); });
  document.querySelectorAll('input[name="difficulty"]').forEach(input => { input.checked = input.value === saved.settings.difficulty; });
  function updateResume() {
    get('resume-session').hidden = !session;
    get('setup-resume').hidden = !session || sessionFinished;
    get('active-session-note').hidden = !session || sessionFinished;
    get('resume-session').textContent = sessionFinished ? 'View last session results' : 'Continue saved session';
  }
  updateResume();
  function persist() {
    updateResume();
    if (session && activeId) {
      const record = { id: activeId, config: session, questions, index: cardIndex, finished: sessionFinished };
      const index = saved.sessions.findIndex(s => s.id === activeId);
      if (index < 0) saved.sessions.push(record); else saved.sessions[index] = record;
      saved.activeId = activeId;
    }
    const message = BrowserSave.save(storage, saved);
    get('save-status').textContent = message || 'Progress saved in this browser.';
  }
  const selectedLevel = () => document.querySelector('input[name="difficulty"]:checked')?.value;
  function updateReviewAvailability() {
    const types = [...document.querySelectorAll('input[name="mathType"]:checked')].map(input => input.value);
    const matches = PracticeMistakes.collect(saved.sessions).filter(m => types.includes(m.type) && m.difficulty === selectedLevel());
    get('review-start').disabled = matches.length === 0;
    get('review-availability').textContent = matches.length
      ? `${matches.length} saved mistake${matches.length === 1 ? '' : 's'} match your choices. Review similar mistakes is ready.`
      : 'No saved mistakes match these choices. Select the math types and difficulty of a saved mistake, or try regular practice first.';
  }
  function updateSetup() {
    const level = PracticeConfig.levels[selectedLevel()];
    get('length-summary').textContent = level ? `${level.label}: ${level.count} questions per session.` : 'Choose a difficulty.';
    get('range-help').textContent = level ? `Addition and subtraction: numbers from 0 to ${level.addMax}. Multiplication: numbers from 1 to ${level.factMax}. Division: divisor and answer from 1 to ${level.factMax}. No negative subtraction answers or division remainders.` : '';
    get('setup-error').textContent = '';
    updateReviewAvailability();
  }
  get('practice-form').addEventListener('change', () => {
    updateSetup();
    saved.settings = {types:[...document.querySelectorAll('input[name="mathType"]:checked')].map(i=>i.value), difficulty:selectedLevel()};
    persist();
  });
  get('practice-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      session = PracticeConfig.create([...document.querySelectorAll('input[name="mathType"]:checked')].map(input => input.value), selectedLevel());
      if (event.submitter?.value === 'review') {
        questions = MistakeReview.generate(session, PracticeMistakes.collect(saved.sessions));
        session = {...session, mode:'review', questionCount:questions.length};
      } else questions = MathQuestions.generate(session);
      cardIndex = 0;
      sessionFinished = false;
      activeId = window.crypto.randomUUID();
      saved.settings = {types: [...session.types], difficulty: session.difficulty};
      persist();
      window.location.hash = '/session';
    } catch (error) {
      get('setup-error').textContent = error.message;
      document.querySelector('input[name="mathType"]').focus();
    }
  });
  function renderCard() {
    const host = get('question-list');
    host.replaceChildren();
    if (sessionFinished) {
      const title = document.createElement('h2');
      title.textContent = 'Session complete!';
      const answered = questions.filter(q => q.flipped);
      const right = answered.filter(q => q.selected === q.answer).length;
      const wrong = answered.length - right;
      const accuracy = answered.length ? Math.round(right / answered.length * 100) : 0;
      const summary = document.createElement('p');
      summary.textContent = `${answered.length} of ${questions.length} questions completed`;
      const totals = document.createElement('dl');
      totals.className = 'summary-totals';
      for (const [label, value] of [['Attempted', answered.length], ['Correct', right], ['Incorrect', wrong], ['Accuracy', `${accuracy}%`]]) {
        const term = document.createElement('dt');
        term.textContent = label;
        const number = document.createElement('dd');
        number.textContent = String(value);
        totals.append(term, number);
      }
      const last = answered[answered.length - 1];
      const lastAnswer = document.createElement('p');
      lastAnswer.textContent = last
        ? `Last answer: you picked ${last.selected}. ${last.a} ${last.symbol} ${last.b} = ${last.answer}. ${last.selected === last.answer ? 'Correct' : 'Incorrect'} — included in your totals.`
        : 'No answers recorded.';
      const encouragement = document.createElement('p');
      encouragement.textContent = 'Nice practice! Every question helps you learn.';
      const restart = document.createElement('a');
      restart.href = '#/practice';
      restart.className = 'back-link';
      restart.textContent = 'Practice again';
      const stats = document.createElement('a');
      stats.href = '#/stats';
      stats.className = 'plain-link';
      stats.textContent = 'View stats';
      const note = document.createElement('p');
      note.textContent = 'Accuracy is rounded to the nearest whole percent. These totals are for this session only. Progress saves in this browser; see View stats for all recorded answers.';
      host.append(title, summary, totals, lastAnswer, encouragement, restart, stats, note);
      return;
    }
    const renderedIndex = cardIndex;
    const question = questions[cardIndex];
    if (!question) return;
    const progress = document.createElement('p');
    progress.textContent = `Question ${cardIndex + 1} of ${questions.length}`;
    const prompt = document.createElement('h2');
    prompt.className = 'question-prompt';
    prompt.textContent = `${question.a} ${question.symbol} ${question.b} = ?`;
    const choices = document.createElement('fieldset');
    choices.className = 'answer-choices';
    const legend = document.createElement('legend');
    legend.textContent = 'Choose one answer';
    choices.append(legend);
    const flip = document.createElement('button');
    flip.type = 'button';
    flip.className = 'back-link';
    flip.textContent = 'Flip card';
    flip.disabled = question.selected === undefined || Boolean(question.flipped);
    const inputs = [];
    const selection = document.createElement('p');
    selection.setAttribute('aria-live', 'polite');
    selection.textContent = question.selected === undefined ? 'Pick an answer to enable Flip card.' : `Selected answer: ${question.selected}`;
    for (const value of question.choices) {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'card-answer';
      input.value = String(value);
      input.checked = question.selected === value;
      input.disabled = Boolean(question.flipped);
      inputs.push(input);
      input.addEventListener('change', () => {
        if (question.flipped) return;
        question.selected = value;
        inputs.forEach(radio => { radio.checked = Number(radio.value) === value; });
        selection.textContent = `Selected answer: ${value}`;
        flip.disabled = false;
        persist();
      });
      const text = document.createElement('span');
      text.textContent = String(value);
      label.append(input, text);
      choices.append(label);
    }
    const result = document.createElement('section');
    result.className = 'card-back';
    result.hidden = true;
    result.tabIndex = -1;
    result.setAttribute('role', 'status');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'back-link';
    next.textContent = cardIndex === questions.length - 1 ? 'Finish session' : 'Next question';
    next.hidden = true;
    const meter = document.createElement('progress');
    meter.max = questions.length;
    meter.setAttribute('aria-label', 'Questions answered');
    const score = document.createElement('p');
    score.className = 'session-score';
    const updateScore = () => {
      const attempts = questions.filter(q => q.flipped);
      meter.value = attempts.length;
      score.textContent = `This session: ${attempts.length} answered · ${attempts.filter(q => q.selected === q.answer).length} right · ${attempts.filter(q => q.selected !== q.answer).length} wrong`;
    };
    const showResult = () => {
      prompt.hidden = choices.hidden = selection.hidden = flip.hidden = true;
      result.hidden = false;
      result.replaceChildren();
      const title = document.createElement('h2');
      title.textContent = question.selected === question.answer ? 'Correct!' : 'Keep practicing!';
      const correct = document.createElement('p');
      correct.textContent = `Correct answer: ${question.a} ${question.symbol} ${question.b} = ${question.answer}`;
      const picked = document.createElement('p');
      picked.textContent = `You picked: ${question.selected}`;
      const outcomes = document.createElement('div');
      outcomes.className = 'outcomes';
      for (const [label, matches] of [['Right', question.selected === question.answer], ['Wrong', question.selected !== question.answer]]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = matches ? `${label} ✓` : label;
        button.className = matches ? 'outcome selected' : 'outcome';
        button.disabled = true;
        button.setAttribute('aria-pressed', String(matches));
        outcomes.append(button);
      }
      const explanation = document.createElement('p');
      explanation.textContent = 'The app marks your picked answer. This result is locked.';
      result.append(title, correct, picked, outcomes, explanation);
      flip.disabled = true;
      inputs.forEach(input => { input.disabled = true; });
      next.hidden = false;
      updateScore();
    };
    flip.addEventListener('click', () => {
      if (question.selected === undefined || question.flipped) return;
      question.flipped = true;
      persist();
      showResult();
      result.focus();
    });
    next.addEventListener('click', () => {
      if (sessionFinished || cardIndex !== renderedIndex || !question.flipped) return;
      if (cardIndex === questions.length - 1) sessionFinished = true;
      else cardIndex++;
      persist();
      renderCard();
      get('question-list').focus();
    });
    updateScore();
    if (question.flipped) showResult();
    host.append(progress, prompt, choices, selection, flip, result, next, score, meter);
    if(question.sourceMistakeKey){
      const source = PracticeMistakes.collect(saved.sessions).find(m=>m.key===question.sourceMistakeKey);
      const note=document.createElement('p');
      note.textContent=source ? `Similar to your saved mistake: ${source.a} ${source.symbol} ${source.b} (${PracticeConfig.levels[source.difficulty].label}).` : 'Review question linked to a saved mistake.';
      host.append(note);
    }
  }
  function renderSettings() {
    document.querySelectorAll('input[name="defaultType"]').forEach(input => { input.checked = saved.settings.types.includes(input.value); });
    document.querySelectorAll('input[name="defaultDifficulty"]').forEach(input => { input.checked = input.value === saved.settings.difficulty; });
    get('settings-feedback').textContent = saved.settings.types.length
      ? `${PracticeConfig.levels[saved.settings.difficulty].count} questions in your next regular session.`
      : 'Choose at least one math type before starting practice.';
  }
  get('settings-form').addEventListener('submit', event => event.preventDefault());
  get('settings-form').addEventListener('change', () => {
    const types = [...document.querySelectorAll('input[name="defaultType"]:checked')].map(input => input.value);
    const difficulty = document.querySelector('input[name="defaultDifficulty"]:checked')?.value;
    if (!Object.hasOwn(PracticeConfig.levels, difficulty)) return;
    saved.settings = {types, difficulty};
    document.querySelectorAll('input[name="mathType"]').forEach(input => { input.checked = types.includes(input.value); });
    document.querySelectorAll('input[name="difficulty"]').forEach(input => { input.checked = input.value === difficulty; });
    updateSetup();
    persist();
    renderSettings();
  });
  function renderStats() {
    const stats = PracticeStats.summarize(saved.sessions);
    const mistakes = PracticeMistakes.collect(saved.sessions);
    get('review-from-stats').hidden = mistakes.length === 0;
    get('mistakes-count').textContent = mistakes.length ? `${mistakes.length} different questions saved for practice.` : 'No saved mistakes yet.';
    get('mistakes-list').replaceChildren();
    for (const mistake of mistakes) {
      const item = document.createElement('li');
      item.textContent = `${mistake.a} ${mistake.symbol} ${mistake.b} = ${mistake.answer} · ${PracticeConfig.types[mistake.type]} · ${PracticeConfig.levels[mistake.difficulty].label} · ${mistake.correctStreak}/2 correct reviews in a row`;
      get('mistakes-list').append(item);
    }
    get('stats-empty').hidden = stats.total.attempted !== 0;
    const content = get('stats-content');
    content.replaceChildren();
    function row(title, values) {
      const box = document.createElement('section');
      box.className = 'stats-row';
      const heading = document.createElement('h3'); heading.textContent = title;
      const list = document.createElement('dl');
      for (const [label, value] of [['Attempted',values.attempted],['Correct',values.correct],['Incorrect',values.incorrect],['Accuracy',values.accuracy === null ? '—' : `${values.accuracy}%`]]) {
        const term = document.createElement('dt'); term.textContent = label;
        const number = document.createElement('dd'); number.textContent = String(value);
        list.append(term,number);
      }
      box.append(heading,list);content.append(box);
    }
    row('All practice',stats.total);
    for (const [label, groups, names] of [['By math type',stats.byType,PracticeConfig.types],['By difficulty',stats.byDifficulty,{easy:'Easy',medium:'Medium',hard:'Hard'}]]) {
      const heading = document.createElement('h2'); heading.textContent = label;content.append(heading);
      for(const [key, values] of Object.entries(groups)) row(names[key],values);
    }
  }
  function renderPage() {
    const route = window.location.hash.slice(1) || '/';
    const routes = { '/': 'home', '/practice': 'practice', '/session': 'session', '/stats': 'stats', '/settings': 'settings' };
    const section = Object.hasOwn(routes, route) ? routes[route] : 'other';
    for (const name of ['home', 'practice', 'session', 'stats', 'settings', 'other']) get(`${name}-page`).hidden = name !== section;
    let heading;
    if (section === 'home') heading = get('home-title');
    else if (section === 'practice') { heading = get('practice-title'); updateReviewAvailability(); }
    else if (section === 'settings') { heading = get('settings-title'); renderSettings(); }
    else if (section === 'stats') { heading = get('stats-title'); renderStats(); }
    else if (section === 'session') {
      heading = get('session-title');
      get('session-summary').textContent = session
        ? `${session.types.map(type => PracticeConfig.types[type]).join(', ')} · ${PracticeConfig.levels[session.difficulty].label} · ${session.questionCount} questions`
        : 'No session choices yet. Please choose your math types and difficulty first.';
      get('session-status').textContent = session
        ? 'Choose an answer, then flip to check it. Session totals count each flipped card once. Progress saves in this browser. Similar-mistake review is available from practice setup.'
        : 'Choose your practice settings to start a session.';
      renderCard();
    } else {
      const page = Object.hasOwn(pages, route) ? pages[route] : ['Page not found', 'We couldn’t find that page. Use the button below to return home.'];
      heading = get('page-title');
      heading.textContent = page[0];
      get('page-message').textContent = page[1];
    }
    document.title = section === 'home' ? 'Math Practice' : `${heading.textContent} · Math Practice`;
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  updateSetup();
  window.addEventListener('hashchange', renderPage);
  renderPage();
})();
