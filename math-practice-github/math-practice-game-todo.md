# Math Practice Game — Phased To-Do List

Based on [our draft specification](math-practice-game-spec.md). All tasks start unchecked. Mark a task `[x]` only after its check passes. This list adds no new features; undecided rules remain decisions.

## Phase 1 — Settle the missing rules

These choices prevent us from building something different from what you or your professor expects.

- [ ] Confirm the required app format and tools, and review the professor’s example/reference files when available. **Check:** Record the actual assignment requirements and compare them with the draft; do not claim the unavailable material has been reviewed.
- [ ] Confirm the draft’s assumptions: easy/medium/hard sessions have 5/10/20 questions; only flipped answers count; those lengths apply to regular sessions. **Check:** Record your choices in the specification.
- [ ] Decide what makes two questions duplicates, including whether 3 + 4 and 4 + 3 are different. **Check:** Write examples of a duplicate and a different question.
- [ ] Decide whether mistakes and stats survive closing or refreshing, and where progress is saved. **Check:** Write exactly what a returning child should see; do not assume accounts or cross-device saving.
- [ ] Choose when a saved mistake leaves the practice pile. **Check:** Write the chosen rule and an example sequence of wrong and correct retries.
- [ ] Choose mistake-practice length, handling of a small or empty pile, and whether it mixes types and levels. **Check:** Write what happens with zero, one, and several saved questions.
- [ ] Choose whether stats cover the current session, all practice, or both. **Check:** Define the period shown for each stat.
- [ ] Choose whether leaving a session early allows resuming or requires restarting. **Check:** Describe what happens on return, keeping already revealed answers counted.

## Phase 2 — Build the basic choices and one card

Start with the visible pieces so we can check the basic flow before adding question generation and saved progress.

- [ ] Set up the app in the format chosen in Phase 1. **Check:** It opens successfully in its intended environment.
- [ ] Add addition, subtraction, multiplication, division, and mixed-practice choices. **Check:** Each option can be selected.
- [ ] Add easy, medium, and hard choices and show their 5, 10, and 20 question lengths before starting. **Check:** Selecting each level shows the matching length; the level stays fixed once a session starts.
- [ ] Show one question card with four answer choices. **Check:** A child can read the question and select one choice.
- [ ] Allow changing a pick before flipping, and require a pick before revealing. **Check:** Try flipping without choosing, then choose and change an answer before flipping.
- [ ] Reveal the correct answer and whether the picked answer was correct. Lock the answer after flipping. **Check:** For 6 + 7, picking 12 shows incorrect and 13; picking 13 shows correct. Neither result can be overridden by a self-marking button or a changed pick.
- [ ] Add the move to the next card. **Check:** The next card starts unrevealed with no answer selected.

## Phase 3 — Generate valid questions and complete sessions

Once one card works, make the app supply the right questions and stop at the right time.

- [ ] Generate addition using both numbers in 0–10 for easy, 0–20 for medium, and 0–100 for hard, including the endpoints. **Check:** Inspect generated questions and boundary examples, including 0 + 0 and 100 + 100 = 200. The ranges limit the inputs, not the answer.
- [ ] Generate subtraction with both numbers in the same level ranges as addition, putting the larger first. Allow equal numbers, zero answers, and borrowing on medium/hard. **Check:** Verify no negative answers and check examples such as 5 − 5 = 0 and 32 − 17 = 15.
- [ ] Generate multiplication with each number in 1–5, 1–10, or 1–12 according to level. **Check:** Inspect each level and verify boundary facts such as 1 × 1 and 12 × 12.
- [ ] Generate division from multiplication, with divisor and answer each in 1–5, 1–10, or 1–12. **Check:** All answers are whole numbers; no divisor is zero. Check dividing by 1, answers of 1, and 144 ÷ 12 = 12. No fractions, decimals, or remainders appear.
- [ ] Generate four unique nonnegative whole-number choices with exactly one correct answer, in random order. **Check:** Inspect cards with answers of zero and larger answers; verify no repeated choices, no extra correct choices, and that the correct choice can appear in different positions.
- [ ] Build regular sessions of exactly 5, 10, and 20 questions for easy, medium, and hard. **Check:** Complete each level and count the cards; there is no extra card after the last one.
- [ ] Keep single-type sessions within their chosen math type. **Check:** Complete a session for each type and inspect every question.
- [ ] Build shuffled mixed sessions: easy has one of each type plus one random extra; medium has two of each plus extras from two different types; hard has five of each. **Check:** Count each type in completed sessions and verify the distribution and shuffled order.
- [ ] Prevent duplicate questions within a regular session using the Phase 1 rule. **Check:** Inspect a full session at each level for duplicates, including a hard single-type session.
- [ ] Show encouraging feedback at the end. **Check:** Finish a session with both correct and incorrect answers and confirm the ending appears.

## Phase 4 — Record answers and save mistakes

Add tracking after the card and session behavior works, so every recorded result has a clear meaning.

- [ ] Count each revealed card as one attempt, using the picked answer to decide correctness. **Check:** Repeatedly pressing flip or next does not count one card twice; a pick without a flip adds nothing.
- [ ] Add wrong answers to “Practice again” without duplicate saved questions. **Check:** Answer the same question incorrectly more than once; attempts increase, but the pile contains one copy. A correct answer to a new question does not add a mistake.
- [ ] Show questions answered, answers correct, and saved questions still needing practice for the period chosen in Phase 1. **Check:** Use a known sequence of answers and compare the displayed numbers with a hand count.
- [ ] Handle leaving early according to the chosen rule. **Check:** Reveal two answers, pick another without flipping, then leave. Only the two revealed answers count; unattempted cards are not mistakes. Returning follows the agreed resume/restart behavior.

## Phase 5 — Practice saved mistakes and handle returning

This comes later because it depends on questions, answer checking, and tracking already working together.

- [ ] Let children practice saved questions using the session, type, and level rules chosen in Phase 1. **Check:** Open a known saved pile and verify the retry questions and session length match those rules.
- [ ] Handle small and empty mistake piles according to the chosen rules. **Check:** Try zero saved questions, one question, and fewer questions than a full retry session.
- [ ] Count each revealed retry as a new attempt without erasing earlier results. **Check:** One wrong attempt followed by one correct retry records two attempts and one correct answer within the applicable stats period.
- [ ] Remove learned mistakes only when the chosen learning rule is satisfied. **Check:** Follow the example sequence from Phase 1 and verify both pile contents and the remaining-mistakes stat after each retry.
- [ ] Implement the agreed saving behavior for mistakes and stats. **Check:** Make known progress, refresh or close and reopen, and verify exactly what should persist or reset.

## Phase 6 — Check the complete assignment

Finish by checking the whole experience together, not just its separate parts.

- [ ] Run complete sessions across all math types and levels, including mixed practice. **Check:** Verify ranges, card counts, choices, flip behavior, and session endings against the specification.
- [ ] Run a complete wrong-answer → saved-mistake → retry flow. **Check:** Verify saved questions, attempt totals, correct totals, and removal behavior at each step.
- [ ] Check unfinished sessions and reopening. **Check:** Follow the agreed leaving and saving rules without double-counting answers or creating mistakes from unanswered cards.
- [ ] Compare the finished app with every completion item in the specification and the professor’s actual requirements. **Check:** Every required item has evidence that it works, and no open rule is silently filled in.

## Optional extras — outside this to-do list

Timers, leaderboards, a separate session-length setting, and a “Show explanation” button remain optional. They are not required tasks and are not included in the phases above.
