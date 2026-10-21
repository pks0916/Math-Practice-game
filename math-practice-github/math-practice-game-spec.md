# Math Practice Game — Draft Specification

Status: Review before coding.

This document records our conversation. The professor’s shared example could not be read, and no reference files were available, so this draft does not claim to include the professor’s requirements.

## Purpose

Build a manageable math practice game for children ages 7–12. Children answer questions, flip cards to see results, practice saved mistakes, and see simple progress stats.

## Agreed features

### Math types and levels

Children can choose addition, subtraction, multiplication, division, or a mix. They choose a difficulty level before a session; it stays the same during that session.

| Level | Addition | Subtraction | Multiplication | Division | Questions |
| --- | --- | --- | --- | --- | --- |
| Easy | Each number 0–10 | Both numbers 0–10 | Each number 1–5 | Divisor and answer each 1–5 | 5 |
| Medium | Each number 0–20 | Both numbers 0–20 | Each number 1–10 | Divisor and answer each 1–10 | 10 |
| Hard | Each number 0–100 | Both numbers 0–100 | Each number 1–12 | Divisor and answer each 1–12 | 20 |

Ranges include both ends. Addition ranges describe the numbers being added, not the answer: hard can include 100 + 100 = 200.

Subtraction puts the larger number first. There are no negative answers; equal numbers and an answer of zero are allowed. Medium and hard can include borrowing, such as 32 − 17.

Division uses whole-number answers only, with no remainders, fractions, or decimals. Generate it from multiplication: 7 × 8 = 56 gives 56 ÷ 7 = 8. Never divide by zero. Dividing by 1 and an answer of 1 are allowed. On hard, the number being divided can reach 144.

Hard sessions are both more difficult and longer. Show the session length before starting.

### Mixed sessions

Shuffle the order of the math types:

- Easy: one question of each type, plus one randomly chosen extra type.
- Medium: two questions of each type, plus one extra question from each of two different randomly chosen types.
- Hard: five questions of each type.

Avoid the exact same question within a regular session.

### Answering and flipping cards

1. Show one question with four different answer choices.
2. Exactly one choice is correct. All choices are nonnegative whole numbers, and their order is random.
3. The child picks an answer and may change it before flipping.
4. The child must pick an answer before revealing the result.
5. Flipping reveals the correct answer and whether the picked answer was right or wrong.
6. After flipping, the answer is locked and counted once. The child moves to the next card.

The app decides correctness from the picked answer. A child does not override the result with a right/wrong button.

Example: for 6 + 7, picking 12 and flipping records one incorrect attempt and saves the question for practice. The correct answer shown is 13.

### Saved mistakes

- Wrong answers add the question to a “Practice again” pile.
- Children can return to practice saved questions.
- Repeating the same mistake keeps one saved question instead of creating duplicate entries.
- A retry is a new attempt in stats. A correct retry does not erase an earlier incorrect attempt.
- The rule for removing a learned question from this pile is still undecided; see open decisions below.

### Stats and session ending

Show these simple stats:

- Questions answered.
- Answers correct.
- Number of saved questions still needing practice.

Count an answer when the child flips to reveal the result. Count each card only once. If a session ends early, keep revealed answers in stats; unanswered cards do not count as mistakes.

A regular session ends after its assigned number of questions. Show encouraging end-of-session feedback.

## Assumptions to check

These interpretations make the draft concrete, but they are not additional confirmed features:

- Your “ok next” is treated as accepting 5 questions for easy, 10 for medium, and 20 for hard.
- “Answered” means picked AND flipped. Picking a choice and leaving before flipping does not count.
- The session lengths above apply to regular practice. We have not chosen how long a saved-mistakes session should be.
- “Exact same question” means the same math type and numbers in the same order. Whether 3 + 4 and 4 + 3 should count as duplicates is still open.

## Open decisions before implementation

These are missing rules, not requirements we have silently chosen:

1. **Where will it run?** Confirm whether the assignment expects a website, another kind of app, or particular tools. The professor’s instructions still need review.
2. **What survives closing the app?** Decide whether mistakes and stats stay saved after closing or refreshing. Saving on the same device is different from having an account that works across devices. Neither approach is confirmed.
3. **When is a saved mistake learned?** We discussed removing it after one correct retry or two correct retries in a row, but did not choose.
4. **How does mistake practice work?** Decide its session length, what to do when there are fewer saved questions than that length, and whether it mixes levels/types. If there are no saved mistakes, the screen should explain that there is nothing to retry; confirm this behavior.
5. **What period do stats cover?** Decide whether stats show the current session, all practice, or both. Regular answers and retries should follow the same counting rule, as agreed above.
6. **What happens when leaving early?** We agreed to keep completed answers in stats, but have not decided whether a partly finished session can be resumed or must be restarted.

## What counts as finished

The app is ready for assignment review when the open decisions above are resolved, any professor requirements are checked, and these checks pass:

- [ ] A child can choose all four math types or mixed practice and one of three levels.
- [ ] Regular sessions contain 5, 10, or 20 questions for easy, medium, or hard respectively.
- [ ] Questions follow the agreed number ranges and subtraction/division rules.
- [ ] Mixed sessions use the agreed distribution of math types.
- [ ] No exact question repeats within a regular session.
- [ ] Each card offers four unique choices with exactly one correct answer.
- [ ] A child can change a pick before flipping but cannot flip without a pick.
- [ ] Flipping shows the correct answer and result, locks the answer, and records it once.
- [ ] Incorrect answers appear in saved mistakes without duplicate saved entries.
- [ ] Saved mistakes can be practiced, using the removal and session rules we still need to choose.
- [ ] Stats correctly count revealed attempts, correct answers, and saved questions needing practice.
- [ ] Retries add new attempts without deleting earlier results.
- [ ] Leaving early does not turn unanswered cards into mistakes.
- [ ] A completed session shows encouraging feedback.
- [ ] Saving and reopening behave according to the persistence rule we still need to choose.
- [ ] The complete flow is manually checked with correct answers, incorrect answers, retries, and an unfinished session.

This is a completion checklist for our draft, not a confirmed grading rubric.

## Optional extras — not required for this version

These were mentioned during planning but are separate from the core assignment:

- Timers.
- Leaderboards.
- A separate setting to choose session length.
- A “Show explanation” button after flipping.

No optional extra should delay finishing the agreed core game.
