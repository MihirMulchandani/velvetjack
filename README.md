<div align="center"> <h1>VelvetJack</h1> 
<img width="1594" height="956" alt="Screenshot from 2026-02-24 05-23-26" src="https://github.com/user-attachments/assets/1763ff2f-cbd5-4315-84c3-fb68550766bd" />
</div>

VelvetJack is a blackjack simulator built around a simple principle:

what if a digital card table felt intentional instead of noisy?

No flashing banners.
No artificial chaos.
No inflated theatrics.

Just a clean table, a finite deck, and decisions.

Everything runs in the browser.
Nothing leaves the client.

What it explores

VelvetJack is not about gambling.

It explores trust in systems.

A real deck.
Real depletion.
Real reshuffling.
No hidden randomness between rounds.

Cards persist until the shoe is exhausted.
The probabilities shift naturally.
Card counting is possible because the math is real.

The system does not “rebalance.”
It does not interfere.
It deals what exists.

If the deck runs low, it shuffles.
If the hand is over, the state resets.
Nothing happens invisibly.

Interaction model

VelvetJack treats the table as a physical space.

You don’t type bets.
You place chips.

Select a chip denomination

Stack it into the betting circle

Undo if you change your mind

Discard before confirming

Lock the bet and play

Dealer cards follow authentic visibility rules.

The second card remains hidden.
It flips only when the round demands it.

No early reveals.
No UI shortcuts.
No silent exposure in the DOM.

The deck

The game uses a finite 52-card deck.

Fisher–Yates shuffle

No card duplication

No per-round regeneration

Configurable shuffle threshold

Visible reshuffle moment

When the deck runs low, the table pauses.

A subtle overlay appears:

Shuffling Cards…

Then the shoe resets.

Deliberately.
Visibly.
Predictably.

How it works (high level)

A centralized state manager controls all transitions

A pure game engine handles blackjack logic

A betting module validates bankroll integrity

A UI controller renders state without mutating it

LocalStorage persists bankroll and statistics

Animations are governed by timing configuration

The entire system runs as a static site

There is no backend.
There are no APIs.
There are no external dependencies.

Design principles

State must be explicit

Transitions must be controlled

Animation must serve intent

The deck must be honest

No UI element should feel loud

Feedback should be restrained

Elegance > spectacle

If the reveal feels abrupt, it’s wrong.
If the shuffle feels instant, it’s wrong.
If the system feels random, it’s wrong.

Technical structure

HTML5

CSS (Flexbox + Grid)

Vanilla JavaScript (ES6 modules)

No frameworks

No build step

Modular architecture:

stateManager.js

gameEngine.js

bettingSystem.js

uiController.js

storageManager.js

statsTracker.js

Each layer has one responsibility.

Game logic never touches the DOM.
UI never mutates state directly.

Persistence

VelvetJack stores locally:

Bankroll

Session statistics

Win streaks

Lifetime metrics

Audio preference

Reloading the page does not erase progress.
Clearing data is explicit.

What it is not

VelvetJack is not:

A gambling platform

A money system

A casino clone

A gamified ad funnel

It is a controlled blackjack simulation.

No deposits.
No withdrawals.
No real money.

Version

1.0.0

Future direction

Multi-deck shoe configuration

Double down

Split hands

Tournament mode

3D table upgrade

Advanced analytics

The architecture allows expansion without rewrite.

<p align="center">

  <a href="https://velvetjack.vercel.app">
<img width="236" height="61" alt="Screenshot from 2026-02-24 05-25-32" src="https://github.com/user-attachments/assets/ddd466bf-45c8-4b9e-a46b-f7440a6de54c" />



  </a>

</p>

© Mihir Mulchandani
