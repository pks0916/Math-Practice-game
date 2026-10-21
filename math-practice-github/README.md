# Math Practice Game

A browser game for ages 7–12 with four math types, three difficulty levels, answer cards, session summaries, saved stats, and similar-question mistake review.

## Run locally

From this repository, run:

```sh
python3 -m http.server 5174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5174/. Python is only needed to serve the local preview; visitors to the hosted website need only a browser.

## Host

Publish the **contents of `dist/`** with any static website host. There is no build command, dependency installation, backend, or account requirement. Use HTTPS. GitHub stores the source; a hosting service must serve the site publicly.

Pages use hash routes (`#/practice`, `#/session`, `#/stats`, `#/settings`). Keep these links intact: refresh loads `index.html`, so no special server rewrite is needed. Unknown hash routes show a page-not-found message. A URL such as `/stats` is not an app route.

## Saving

Progress and preferences use this browser's localStorage under `math-practice-v1`. They survive refresh at the same site address. Different domains or ports have separate saves; changing from local preview to hosting will not transfer progress. Clearing browser data removes saves. Storage errors show a warning while practice remains usable.

Only flipped answers count. Repeated flips do not add attempts. A saved mistake is learned after two consecutive correct linked review answers; historical attempts remain in Stats.

## Checks

With Node.js installed:

```sh
for testfile in tests/*.cjs; do node "$testfile" || exit 1; done
for sourcefile in dist/*.js; do node --check "$sourcefile" || exit 1; done
```

Tests use separate in-memory data, never real browser progress. They cover generation, choices, sessions, summaries, stats, review, learning, settings, and simulated refresh/storage failures.

## Remaining checks

Reset controls are not implemented. Automated UI checks use a simulated document; real browser visual, keyboard, and device testing remains necessary. The professor's original example has not been verified. Public hosting and GitHub upload are not complete.
