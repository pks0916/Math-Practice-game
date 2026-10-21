const MathQuestions = (() => {
  const limits = { easy: 10, medium: 20, hard: 100 };
  const factLimits = { easy: 5, medium: 10, hard: 12 };
  const symbols = { addition: '+', subtraction: '−', multiplication: '×', division: '÷' };
  function shuffle(items, random = Math.random) {
    for (let i = items.length - 1; i > 0; i--) {
      const sample = random();
      if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('Invalid random value.');
      const j = Math.floor(sample * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
  function makeChoices(answer, random = Math.random) {
    if (!Number.isInteger(answer) || answer < 0 || answer > 200) throw new Error('Answer is outside the supported range.');
    // Six nearby candidates, filtered once; even zero has three valid alternatives.
    const wrong = [-3, -2, -1, 1, 2, 3].map(offset => answer + offset).filter(value => value >= 0);
    return shuffle([answer, ...shuffle(wrong, random).slice(0, 3)], random);
  }
  function calculate(type, a, b, difficulty) {
    if (!Object.hasOwn(limits, difficulty)) throw new Error('Invalid difficulty.');
    if (!Object.hasOwn(symbols, type)) throw new Error('Invalid math type.');
    if (![a, b].every(Number.isInteger)) throw new Error('Numbers must be whole numbers.');
    let answer;
    if (type === 'division') {
      const max = factLimits[difficulty];
      if (b < 1 || b > max || a < 1 || a % b !== 0 || a / b < 1 || a / b > max) throw new Error('Division must have a valid nonzero divisor and a whole-number answer in range.');
      answer = a / b;
    } else {
      const min = type === 'multiplication' ? 1 : 0;
      const max = type === 'multiplication' ? factLimits[difficulty] : limits[difficulty];
      if (![a, b].every(n => n >= min && n <= max)) throw new Error('Numbers are outside this level’s range.');
      if (type === 'subtraction') [a, b] = [Math.max(a, b), Math.min(a, b)];
      answer = type === 'addition' ? a + b : type === 'subtraction' ? a - b : a * b;
    }
    return { type, a, b, symbol: symbols[type], answer };
  }
  function generate(session, random = Math.random) {
    if (!Object.hasOwn(limits, session.difficulty) || !Number.isInteger(session.questionCount) || session.questionCount < 1) throw new Error('Invalid session.');
    if (!Array.isArray(session.types) || !session.types.length || session.types.some(t => !Object.hasOwn(symbols, t))) throw new Error('Choose valid math types.');
    const types = [...new Set(session.types)];
    const max = limits[session.difficulty];
    // Shuffle finite pools to avoid duplicates without retry loops.
    const pools = Object.fromEntries(types.map(type => {
      const pool = [];
      if (type === 'multiplication' || type === 'division') {
        for (let factor = 1; factor <= factLimits[session.difficulty]; factor++) {
          for (let other = 1; other <= factLimits[session.difficulty]; other++) {
            pool.push(type === 'division'
              ? calculate(type, factor * other, factor, session.difficulty)
              : calculate(type, factor, other, session.difficulty));
          }
        }
      } else {
        for (let a = 0; a <= max; a++) for (let b = 0; b <= max; b++) {
          if (a < b) continue;
          pool.push(calculate(type, a, b, session.difficulty));
        }
      }
      return [type, shuffle(pool, random)];
    }));
    const order = shuffle([...types], random);
    const questions = [];
    for (let i = 0; i < session.questionCount; i++) {
      const question = pools[order[i % order.length]].pop();
      if (!question) throw new Error('Not enough different questions.');
      questions.push(question);
    }
    return shuffle(questions, random).map(question => ({ ...question, choices: makeChoices(question.answer, random) }));
  }
  return { calculate, generate, makeChoices };
})();
if (typeof module !== 'undefined') module.exports = MathQuestions;
