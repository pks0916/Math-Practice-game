const PracticeConfig = (() => {
  const types = Object.freeze({ addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' });
  const levels = Object.freeze({
    easy: Object.freeze({ label: 'Easy', count: 5, addMax: 10, factMax: 5 }),
    medium: Object.freeze({ label: 'Medium', count: 10, addMax: 20, factMax: 10 }),
    hard: Object.freeze({ label: 'Hard', count: 20, addMax: 100, factMax: 12 })
  });
  function create(selectedTypes, difficulty) {
    if (!Array.isArray(selectedTypes) || !selectedTypes.length) throw new Error('Choose at least one math type before starting.');
    if (selectedTypes.some(type => !Object.hasOwn(types, type))) throw new Error('Choose only the math types listed above.');
    if (!Object.hasOwn(levels, difficulty)) throw new Error('Choose Easy, Medium, or Hard before starting.');
    return Object.freeze({ types: Object.freeze([...new Set(selectedTypes)]), difficulty, questionCount: levels[difficulty].count });
  }
  return Object.freeze({ types, levels, create });
})();
if (typeof module !== 'undefined') module.exports = PracticeConfig;
