# Sparkle Tables 🦄🧜‍♀️🧚

A browser game to help a 7-year-old build fluent recall of the **2, 5 and 10 times tables**,
built around a Year 2 school report target: *"to develop fluency in recalling and applying
the 2, 5 and 10 times tables."*

No installs, no accounts, no internet needed (a Google font loads if online; otherwise a system font is used).

## Run it

Double-click `start.command`, or from a terminal:

```
cd sparkle-tables
python3 -m http.server 8765
```

then open http://localhost:8765/ . Works on a laptop or an iPad on the same Wi-Fi
(use the laptop's IP address instead of localhost). Progress is saved in the browser,
so keep using the same browser/device.

## How it works (and why it isn't Times Tables Rock Stars)

| Sparkle Tables | TT Rock Stars |
|---|---|
| Mastery garden: each fact is a seed that grows through 5 stages. A fairy/mermaid/unicorn comes to live on it once fluent. | Speed and coins; a rockstar status based on answers per minute |
| No visible timer. Speed is tracked quietly (6 s = Year 4 Multiplication Tables Check standard) and only unlocks "Sparkle Sprint" once most facts are secure. | Timed from the start |
| Concrete → pictorial → abstract: new facts are shown as groups (3 fairies with 2 stars each) with skip counting; the picture fades to a hint, then disappears. | Abstract number facts only |
| Applying, not just recalling: secure facts return as division, missing number and 2p / 5p / 10p money problems. | Multiplication and division only |
| Wrong answer → see the model, one more go, then the fact comes back later in the same quest. Feedback praises effort and strategy (growth mindset). | Wrong answer → move on |
| Dress-up doll (fairy, mermaid, unicorn, princess outfits, hair, tiaras, wands, backgrounds) bought with gems. | Rockstar avatar |

Educational psychology under the hood:

- **Spaced retrieval (Leitner boxes).** Each fact has a box 0–4. Correct → up a box and scheduled further away (0, 1, 2, 4, 7 sessions). Wrong → down a box and due again next session.
- **Interleaving.** Rainbow Castle mixes all three tables once every realm has 5 growing facts.
- **Anchor facts first.** New facts are introduced in the order ×1, ×2, ×5, ×10, ×3, ×4, ×6 … ×12, at most 3 new per session.
- **Commutativity.** From box 2 onwards facts sometimes appear flipped (2 × 7 as well as 7 × 2), as in the MTC.
- **Low reading load.** Big buttons, a number pad, and a 🔊 button that reads any question aloud (word problems are read automatically).

## Grown-ups' corner

Bottom of the home screen, behind a 4-digit code (**1964**, set as `PARENT_PIN` near the top of `game.js`). This keeps little fingers out of the reset button; it is not real security, since the code is in the page source. Shows a colour grid of all 36 facts, session history,
sound/read-aloud toggles, name change, progress export and reset.

Suggested use: one 10-question quest a day (about 3–5 minutes) beats a long weekly session.

## Files

- `index.html` – screens
- `style.css` – look and feel
- `doll.js` – SVG dress-up doll and wardrobe items
- `game.js` – content, scheduling, questions, feedback, shop
