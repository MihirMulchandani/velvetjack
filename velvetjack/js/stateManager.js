import { loadGame, saveGame } from './storageManager.js';

/**
 * State Manager - Single Source of Truth
 */

const DEFAULT_STATE = {
  bankroll: 10000,
  currentBet: 0,
  betStack: [], // Array of chip values
  deck: [],
  playerHand: [],
  dealerHand: [],
  gamePhase: 'betting', // betting, dealing, playerTurn, dealerTurn, result
  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    winStreak: 0,
    biggestWin: 0,
    biggestLoss: 0,
    sessionStartBankroll: 10000,
    sessionProfit: 0
  },
  settings: {
    soundEnabled: true,
    theme: 'default'
  }
};

class StateManager {
  constructor() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.listeners = [];
    this.init();
  }

  init() {
    const saved = loadGame();
    if (saved) {
      this.state.bankroll = saved.bankroll;
      this.state.stats = { ...this.state.stats, ...saved.stats };
      this.state.settings = { ...this.state.settings, ...saved.settings };
      // Reset session specific stats on load
      this.state.stats.sessionStartBankroll = this.state.bankroll;
      this.state.stats.sessionProfit = 0;
    }
  }

  getState() {
    return this.state; // In a real app, return deep copy to prevent mutation
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    saveGame(this.state); // Auto-save on state change
  }

  // Actions
  updateBankroll(amount) {
    this.state.bankroll += amount;
    this.state.stats.sessionProfit = this.state.bankroll - this.state.stats.sessionStartBankroll;
    this.notify();
  }

  setBet(amount) {
    this.state.currentBet = amount;
    this.notify();
  }

  pushChip(value) {
    this.state.betStack.push(value);
    this.state.currentBet += value;
    this.notify();
  }

  popChip() {
    const value = this.state.betStack.pop();
    if (value) {
      this.state.currentBet -= value;
      this.notify();
    }
  }

  clearBet() {
    this.state.betStack = [];
    this.state.currentBet = 0;
    this.notify();
  }

  setPhase(phase) {
    this.state.gamePhase = phase;
    this.notify();
  }

  setDeck(deck) {
    this.state.deck = deck;
    // Don't notify for deck changes to avoid re-renders, unless debugging
  }

  setPlayerHand(hand) {
    this.state.playerHand = hand;
    this.notify();
  }

  setDealerHand(hand) {
    this.state.dealerHand = hand;
    this.notify();
  }

  updateStats(result, winAmount) {
    this.state.stats.totalGames++;
    
    if (result === 'win' || result === 'blackjack') {
      this.state.stats.wins++;
      this.state.stats.winStreak++;
      if (winAmount > this.state.stats.biggestWin) {
        this.state.stats.biggestWin = winAmount;
      }
    } else if (result === 'loss' || result === 'bust') {
      this.state.stats.losses++;
      this.state.stats.winStreak = 0;
      if (this.state.currentBet > this.state.stats.biggestLoss) {
        this.state.stats.biggestLoss = this.state.currentBet;
      }
    } else if (result === 'push') {
      this.state.stats.pushes++;
      // Streak typically doesn't reset on push, or stays same
    }
    
    this.notify();
  }

  toggleSound() {
    this.state.settings.soundEnabled = !this.state.settings.soundEnabled;
    this.notify();
  }

  resetStats() {
    this.state.stats = JSON.parse(JSON.stringify(DEFAULT_STATE.stats));
    this.state.stats.sessionStartBankroll = this.state.bankroll;
    this.notify();
  }
  
  resetGame() {
    this.state.bankroll = DEFAULT_STATE.bankroll;
    this.resetStats();
    this.notify();
  }
}

export const stateManager = new StateManager();
