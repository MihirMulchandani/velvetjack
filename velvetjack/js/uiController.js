/**
 * UI Controller - Handles DOM updates and animations
 */

import { formatCurrency } from './utils.js';

class UIController {
  constructor() {
    this.elements = {};
    this.audioContext = null;
    this.sounds = {};
  }

  init() {
    this.cacheDOM();
    this.initAudio();
    this.bindEvents();
  }

  cacheDOM() {
    this.elements = {
      dealerArea: document.querySelector('.dealer-area'),
      playerArea: document.querySelector('.player-area'),
      bankrollDisplay: document.getElementById('bankroll-display'),
      betDisplay: document.getElementById('bet-display'),
      chipSelector: document.querySelector('.chip-selector'),
      bettingCircle: document.querySelector('.betting-circle-container'),
      actionButtons: document.querySelector('.action-buttons'),
      btnHit: document.getElementById('btn-hit'),
      btnStand: document.getElementById('btn-stand'),
      btnDeal: document.getElementById('btn-deal'),
      btnUndo: document.getElementById('btn-undo'),
      btnClear: document.getElementById('btn-clear'),
      resultOverlay: document.getElementById('result-overlay'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalContent: document.getElementById('modal-content'),
      statsPanel: document.getElementById('stats-panel'),
      soundToggle: document.getElementById('sound-toggle'),
      shuffleModal: document.getElementById('shuffle-modal'),
      deckCounter: document.getElementById('deck-counter')
    };
  }

  initAudio() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.loadSoundFiles();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  async loadSoundFiles() {
    const soundsToLoad = [
      { name: 'chip', ext: '.wav' },
      { name: 'deal', ext: '.wav' },
      { name: 'flip', ext: '.wav' },
      { name: 'shuffle', ext: '.mp3' },
      { name: 'win', ext: '.wav' },
      { name: 'loss', ext: '.wav' },
      { name: 'blackjack', ext: '.wav' }
    ];
    
    for (const sound of soundsToLoad) {
      try {
        const response = await fetch(`assets/sounds/${sound.name}${sound.ext}`);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sounds[sound.name] = audioBuffer;
        } else {
          console.log(`Sound file ${sound.name}${sound.ext} not found (Status: ${response.status}), using synth fallback.`);
        }
      } catch (e) {
        console.log(`Error loading ${sound.name}${sound.ext}, using synth fallback:`, e);
      }
    }
  }

  playSound(type) {
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // If we have a preloaded buffer, play it
    if (this.sounds[type]) {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[type];
      source.connect(this.audioContext.destination);
      source.start(0);
      return;
    }
    
    // Fallback to synth sounds
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    
    if (type === 'chip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'deal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'flip') {
      // Soft flip sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0.0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'shuffle') {
      // White noise-ish for shuffle
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0.0, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'loss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  bindEvents() {
    // Handled in main.js, but UI specific toggles here
    this.elements.soundToggle?.addEventListener('click', () => {
      // Toggle logic
    });
  }

  render(state) {
    this.updateBankroll(state.bankroll);
    this.updateBet(state.currentBet);
    this.renderHands(state);
    this.updateControls(state);
    this.updateStats(state.stats);
  }

  updateBankroll(amount) {
    if (!this.elements.bankrollDisplay) return;
    
    const currentText = this.elements.bankrollDisplay.textContent.replace(/[^0-9.-]+/g, '');
    const start = parseInt(currentText) || 0;
    const end = amount;
    
    if (start === end) return;
    
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.floor(start + (end - start) * ease);
      this.elements.bankrollDisplay.textContent = formatCurrency(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.elements.bankrollDisplay.textContent = formatCurrency(end);
      }
    };
    
    requestAnimationFrame(animate);
  }

  updateBet(amount) {
    if (this.elements.betDisplay) {
      this.elements.betDisplay.textContent = formatCurrency(amount);
    }
  }

  renderHands(state) {
    // Hide dealer's second card during betting, dealing, and player's turn
    const hideDealerCard = ['betting', 'dealing', 'playerTurn'].includes(state.gamePhase);
    
    this.updateHandContainer(document.getElementById('player-hand'), state.playerHand, false);
    this.updateHandContainer(document.getElementById('dealer-hand'), state.dealerHand, hideDealerCard);
    
    // Update totals
    this.updateHandTotal(document.getElementById('player-total'), state.playerHand);
    
    // Dealer total: Show upcard value if hidden card exists, otherwise show full total in appropriate phases
    if (hideDealerCard && state.dealerHand.length >= 1) {
      this.updateHandTotal(document.getElementById('dealer-total'), [state.dealerHand[0]], true);
    } else {
      const showDealerTotal = ['dealerTurn', 'result'].includes(state.gamePhase);
      this.updateHandTotal(document.getElementById('dealer-total'), state.dealerHand, showDealerTotal);
    }

    // Update Deck Counter
    if (this.elements.deckCounter) {
      this.elements.deckCounter.textContent = `Cards: ${state.deck.length}`;
      if (state.deck.length < 52) { // Arbitrary low threshold for visual
        this.elements.deckCounter.classList.add('low');
      } else {
        this.elements.deckCounter.classList.remove('low');
      }
      this.elements.deckCounter.classList.remove('hidden');
    }
  }

  updateHandContainer(container, hand, hideSecondCard) {
    if (!container) return;

    // Remove cards that are no longer in hand (e.g. new game)
    const currentIds = hand.map(c => c.id);
    Array.from(container.children).forEach(child => {
      if (!currentIds.includes(child.dataset.id)) {
        child.remove();
      }
    });

    // Add new cards
    hand.forEach((card, index) => {
      const existingCard = container.querySelector(`[data-id="${card.id}"]`);
      if (!existingCard) {
        const isHidden = hideSecondCard && index === 1;
        const cardEl = this.createCardElement(card, isHidden);
        cardEl.dataset.id = card.id;
        cardEl.style.animationDelay = '0s'; // Immediate for new cards, or use small delay
        cardEl.classList.add('animate-slide-in');
        container.appendChild(cardEl);
      } else {
        // If card exists, check if we need to reveal it (handled by revealDealerCard usually, but good for state sync)
        const isHidden = hideSecondCard && index === 1;
        // If state says hidden but card is flipped (revealed), we might need to hide it (reset)
        // If state says visible but card is hidden, we reveal
        
        const isCurrentlyHidden = existingCard.classList.contains('secure-hidden');
        
        if (isHidden && !isCurrentlyHidden) {
          // Should be hidden
          const newCard = this.createCardElement(card, true);
          newCard.dataset.id = card.id;
          container.replaceChild(newCard, existingCard);
        } else if (!isHidden && isCurrentlyHidden) {
          // Should be visible - normally revealDealerCard handles animation, but this catches state syncs
          // We replace with visible card
          const newCard = this.createCardElement(card, false);
          newCard.dataset.id = card.id;
          container.replaceChild(newCard, existingCard);
        }
      }
    });
  }

  updateHandTotal(element, hand, visible = true) {
    if (!element) return;
    if (!visible || hand.length === 0) {
      element.classList.add('hidden');
      return;
    }
    
    // Calculate value (importing logic or duplicating simple logic)
    // Since UI shouldn't have game logic, ideally state passes this.
    // But for display, we can do a quick calc or ask state.
    // We'll do a quick calc here for display purposes only, or better, update state to include totals.
    // For now, let's just use a simple helper or assume state has it.
    // Actually, let's just calculate it here for display.
    
    let value = 0;
    let aces = 0;
    hand.forEach(card => {
      if (['J','Q','K'].includes(card.value)) value += 10;
      else if (card.value === 'A') { value += 11; aces++; }
      else value += parseInt(card.value);
    });
    while (value > 21 && aces > 0) { value -= 10; aces--; }

    element.textContent = value;
    element.classList.remove('hidden');
  }

  createCardElement(card, isHidden = false) {
    const el = document.createElement('div');
    el.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`;
    
    if (isHidden) {
      el.classList.add('secure-hidden'); // Use secure hidden class
      // Render ONLY back
      el.innerHTML = `
        <div class="card-inner">
          <div class="card-back"></div>
          <div class="card-face"></div> <!-- Empty face for secure hidden -->
        </div>
      `;
    } else {
      const value = card.value;
      const suitSymbol = this.getSuitSymbol(card.suit);

      el.innerHTML = `
        <div class="card-inner">
          <div class="card-back"></div>
          <div class="card-face">
            <div class="card-value-top">${value}</div>
            <div class="card-suit-center">${suitSymbol}</div>
            <div class="card-value-bottom">${value}</div>
          </div>
        </div>
      `;
    }

    return el;
  }

  async revealDealerCard(card) {
    const container = document.getElementById('dealer-hand');
    if (!container) return;
    
    // Find the hidden card (usually index 1)
    const cardEl = container.querySelector(`[data-id="${card.id}"]`);
    if (!cardEl || !cardEl.classList.contains('secure-hidden')) return;

    // 1. Swap content to include face value (securely injected now)
    const value = card.value;
    const suitSymbol = this.getSuitSymbol(card.suit);
    
    // We keep the card-inner rotated at 180deg (which shows back)
    // Then we inject the face content into .card-face
    const faceEl = cardEl.querySelector('.card-face');
    faceEl.innerHTML = `
      <div class="card-value-top">${value}</div>
      <div class="card-suit-center">${suitSymbol}</div>
      <div class="card-value-bottom">${value}</div>
    `;
    
    // Remove secure-hidden class so it behaves like a normal card
    cardEl.classList.remove('secure-hidden');
    // Ensure it's still showing back (flipped)
    cardEl.classList.add('flipped');

    // 2. Animate Flip
    // Wait for suspense
    await new Promise(r => setTimeout(r, 300));
    
    this.playSound('flip');
    cardEl.classList.remove('flipped'); // Removes rotateY(180deg), goes to 0deg (Face)
    
    // Wait for animation
    await new Promise(r => setTimeout(r, 250));
  }

  showShuffleModal(visible) {
    if (this.elements.shuffleModal) {
      if (visible) {
        this.elements.shuffleModal.classList.add('visible');
        this.playSound('shuffle');
      } else {
        this.elements.shuffleModal.classList.remove('visible');
      }
    }
  }

  showBustModal(onReset) {
    if (!this.elements.modalOverlay || !this.elements.modalContent) return;
    
    this.elements.modalContent.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Bankrupt!</h2>
      </div>
      <div class="modal-body" style="text-align: center;">
        <p>You've run out of credits. Would you like to reset your bankroll to $10,000?</p>
      </div>
      <div class="modal-footer">
        <button id="btn-modal-reset" class="btn btn-primary">Reset Bankroll</button>
      </div>
    `;
    
    this.elements.modalOverlay.classList.add('visible');
    
    const resetBtn = document.getElementById('btn-modal-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.elements.modalOverlay.classList.remove('visible');
        onReset();
      };
    }
  }

  getSuitSymbol(suit) {
    switch(suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  }

  updateControls(state) {
    const { gamePhase, currentBet, bankroll } = state;

    // Betting Phase
    if (gamePhase === 'betting') {
      this.elements.chipSelector.classList.remove('hidden');
      this.elements.btnDeal.classList.remove('hidden');
      this.elements.btnUndo.classList.remove('hidden');
      this.elements.btnClear.classList.remove('hidden');
      this.elements.btnHit.classList.add('hidden');
      this.elements.btnStand.classList.add('hidden');

      this.elements.btnDeal.disabled = currentBet === 0;
      this.elements.btnUndo.disabled = currentBet === 0;
      this.elements.btnClear.disabled = currentBet === 0;
    } 
    // Playing Phase
    else if (gamePhase === 'playerTurn') {
      this.elements.chipSelector.classList.add('hidden');
      this.elements.btnDeal.classList.add('hidden');
      this.elements.btnUndo.classList.add('hidden');
      this.elements.btnClear.classList.add('hidden');
      this.elements.btnHit.classList.remove('hidden');
      this.elements.btnStand.classList.remove('hidden');
      
      this.elements.btnHit.disabled = false;
      this.elements.btnStand.disabled = false;
    }
    // Dealer Turn or Result
    else {
      this.elements.chipSelector.classList.add('hidden');
      this.elements.btnDeal.classList.add('hidden');
      this.elements.btnClear.classList.add('hidden');
      this.elements.btnHit.disabled = true;
      this.elements.btnStand.disabled = true;
    }
  }

  updateStats(stats) {
    if (!this.elements.statsPanel) return;
    
    // Create stats HTML if not exists or update values
    // For simplicity, we'll just rebuild the inner HTML of the stats panel
    // In a real app, we'd target specific elements
    
    this.elements.statsPanel.innerHTML = `
      <div class="stat-group">
        <span class="stat-label">Games</span>
        <span class="stat-value">${stats.totalGames}</span>
      </div>
      <div class="stat-group">
        <span class="stat-label">Wins</span>
        <span class="stat-value">${stats.wins}</span>
      </div>
      <div class="stat-group">
        <span class="stat-label">Streak</span>
        <span class="stat-value">${stats.winStreak}</span>
      </div>
      <div class="stat-group">
        <span class="stat-label">Profit</span>
        <span class="stat-value ${stats.sessionProfit >= 0 ? 'text-success' : 'text-error'}">
          ${formatCurrency(stats.sessionProfit)}
        </span>
      </div>
    `;
  }

  showResult(result, amount) {
    const overlay = this.elements.resultOverlay;
    if (!overlay) return;

    let text = '';
    let className = '';

    switch(result) {
      case 'win':
        text = `YOU WIN ${formatCurrency(amount)}`;
        className = 'result-win';
        this.playSound('win');
        break;
      case 'loss':
        text = 'DEALER WINS';
        className = 'result-loss';
        this.playSound('loss');
        break;
      case 'bust':
        text = 'BUST';
        className = 'result-loss';
        this.playSound('loss');
        break;
      case 'push':
        text = 'PUSH';
        className = 'result-push';
        break;
      case 'blackjack':
        text = 'BLACKJACK!';
        className = 'result-blackjack';
        this.playSound('win');
        break;
    }

    overlay.textContent = text;
    overlay.className = `result-overlay visible ${className}`;

    setTimeout(() => {
      overlay.classList.remove('visible');
    }, 2000);
  }
}

export const uiController = new UIController();
