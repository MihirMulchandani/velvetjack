/**
 * Main Application Entry Point
 */

import { stateManager } from './stateManager.js';
import { uiController } from './uiController.js';
import { createDeck, calculateHand, isBust, isBlackjack, shouldDealerHit, determineWinner, shouldShuffle, DECK_CONFIG } from './gameEngine.js';
import { CHIP_VALUES, canBet } from './bettingSystem.js';
import { sleep, randomInt } from './utils.js';

const APP_VERSION = "1.0.0";

class App {
  constructor() {
    this.init();
  }

  init() {
    console.log(`VelvetJack v${APP_VERSION} initialized`);
    uiController.init();
    
    // Subscribe UI to state changes
    stateManager.subscribe((state) => {
      uiController.render(state);
    });

    // Initial Render
    uiController.render(stateManager.getState());

    // Initialize deck if empty
    if (stateManager.getState().deck.length === 0) {
      stateManager.setDeck(createDeck(DECK_CONFIG.decks));
    }

    this.bindEvents();
  }

  // ... (bindEvents, handleBet, handleClearBet remain same)

  bindEvents() {
    // Chips
    const chipSelector = document.querySelector('.chip-selector');
    if (chipSelector) {
      CHIP_VALUES.forEach(value => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.value = value;
        chip.textContent = `$${value}`;
        chip.addEventListener('click', () => this.handleBet(value));
        chipSelector.appendChild(chip);
      });
    }

    // Buttons
    document.getElementById('btn-deal')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-hit')?.addEventListener('click', () => this.handleHit());
    document.getElementById('btn-stand')?.addEventListener('click', () => this.handleStand());
    document.getElementById('btn-undo')?.addEventListener('click', () => this.handleUndoBet());
    document.getElementById('btn-clear')?.addEventListener('click', () => this.handleClearBet());
    
    // Reset
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if(confirm('Reset all progress?')) {
        stateManager.resetGame();
        stateManager.setDeck(createDeck(DECK_CONFIG.decks)); // New deck on reset
      }
    });
  }

  handleBet(amount) {
    const state = stateManager.getState();
    if (state.gamePhase !== 'betting') return;

    if (canBet(state.currentBet, state.bankroll, amount)) {
      stateManager.pushChip(amount);
      uiController.playSound('chip');
    } else {
      // Shake animation for invalid bet
      const bettingCircle = document.querySelector('.betting-circle-container');
      bettingCircle?.classList.add('animate-shake');
      setTimeout(() => bettingCircle?.classList.remove('animate-shake'), 400);
    }
  }

  handleClearBet() {
    const state = stateManager.getState();
    if (state.gamePhase !== 'betting') return;
    stateManager.clearBet();
  }

  handleUndoBet() {
    const state = stateManager.getState();
    if (state.gamePhase !== 'betting') return;
    stateManager.popChip();
    uiController.playSound('chip'); // Reuse chip sound for undo
  }

  async startGame() {
    const state = stateManager.getState();
    if (state.currentBet === 0) return;

    // Check Shuffle
    if (shouldShuffle(state.deck)) {
      uiController.showShuffleModal(true);
      await sleep(1500); // Shuffle duration
      stateManager.setDeck(createDeck(DECK_CONFIG.decks));
      uiController.showShuffleModal(false);
      await sleep(500); // Brief pause after shuffle
    }

    stateManager.setPhase('dealing');
    stateManager.updateBankroll(-state.currentBet); // Deduct bet
    
    // Deal initial cards
    const deck = [...state.deck];
    const playerHand = [];
    const dealerHand = [];

    // Deal 2 cards each
    for (let i = 0; i < 2; i++) {
      playerHand.push(deck.pop());
      stateManager.setPlayerHand([...playerHand]);
      uiController.playSound('deal');
      await sleep(500);

      dealerHand.push(deck.pop());
      stateManager.setDealerHand([...dealerHand]);
      uiController.playSound('deal');
      await sleep(500);
    }

    stateManager.setDeck(deck);

    // Check for Blackjack
    if (isBlackjack(playerHand)) {
      // Even if player has blackjack, we must reveal dealer card first
      await this.handleRoundEnd(playerHand, dealerHand);
    } else {
      stateManager.setPhase('playerTurn');
    }
  }

  async handleHit() {
    const state = stateManager.getState();
    const deck = [...state.deck];
    const playerHand = [...state.playerHand];

    playerHand.push(deck.pop());
    stateManager.setDeck(deck);
    stateManager.setPlayerHand(playerHand);
    uiController.playSound('deal');

    if (isBust(playerHand)) {
      await this.handleRoundEnd(playerHand, state.dealerHand);
    }
  }

  async handleStand() {
    stateManager.setPhase('dealerTurn');
    await this.runDealerTurn();
  }

  async runDealerTurn() {
    const state = stateManager.getState();
    let dealerHand = [...state.dealerHand];
    let deck = [...state.deck];

    // Reveal hidden card
    await uiController.revealDealerCard(dealerHand[1]);

    while (shouldDealerHit(dealerHand)) {
      await sleep(800); // Delay between draws
      dealerHand.push(deck.pop());
      stateManager.setDeck(deck);
      stateManager.setDealerHand([...dealerHand]);
      uiController.playSound('deal');
    }

    await this.handleRoundEnd(state.playerHand, dealerHand);
  }

  async handleRoundEnd(playerHand, dealerHand) {
    // Ensure dealer card is revealed if it wasn't already (e.g. bust or blackjack)
    // Check if dealer's second card is still hidden in UI
    const dealerSecondCard = dealerHand[1];
    if (dealerSecondCard) {
        // We can check phase, if we skipped dealerTurn (e.g. bust), we need to reveal
        const state = stateManager.getState();
        if (state.gamePhase !== 'dealerTurn') {
             await uiController.revealDealerCard(dealerSecondCard);
        }
    }

    stateManager.setPhase('result');
    
    const result = determineWinner(playerHand, dealerHand);
    const state = stateManager.getState();
    let winAmount = 0;

    if (result === 'win') {
      winAmount = state.currentBet * 2;
      stateManager.updateBankroll(winAmount);
    } else if (result === 'blackjack') {
      winAmount = state.currentBet * 2.5; // 3:2 payout + original bet
      stateManager.updateBankroll(winAmount);
    } else if (result === 'push') {
      winAmount = state.currentBet;
      stateManager.updateBankroll(winAmount);
    }

    stateManager.updateStats(result, winAmount);
    uiController.showResult(result, winAmount);

    // Wait before resetting
    await sleep(2500);
    
    // Reset for next round
    stateManager.setPlayerHand([]);
    stateManager.setDealerHand([]);
    stateManager.clearBet(); 
    stateManager.setPhase('betting');

    // Check for Bankruptcy
    const finalState = stateManager.getState();
    if (finalState.bankroll === 0 && finalState.currentBet === 0) {
      uiController.showBustModal(() => {
        stateManager.resetGame();
      });
    }
  }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
