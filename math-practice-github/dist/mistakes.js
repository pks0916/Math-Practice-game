const PracticeMistakes = (() => {
  // Match the question's displayed order and difficulty, not its chosen answer.
  function collect(sessions) {
    const mistakes = new Map();
    const seenSessions = new Set();
    for (const session of sessions) {
      if (seenSessions.has(session.id)) continue;
      seenSessions.add(session.id);
      for (const question of session.questions) {
        if (!question.flipped) continue;
        const correct = question.selected === question.answer;
        const source = mistakes.get(question.sourceMistakeKey);
        if (source) source.correctStreak = correct ? source.correctStreak + 1 : 0;
        if (correct) continue;
        const key = JSON.stringify([question.type, session.config.difficulty, question.a, question.b]);
        if (!mistakes.has(key)) mistakes.set(key, {
          key, type: question.type, difficulty: session.config.difficulty,
          a: question.a, b: question.b, symbol: question.symbol, answer: question.answer, correctStreak: 0
        });
        mistakes.get(key).correctStreak = 0;
      }
    }
    return [...mistakes.values()].filter(mistake => mistake.correctStreak < 2);
  }
  return { collect };
})();
if (typeof module !== 'undefined') module.exports = PracticeMistakes;
