/**
 * Game Engine - Pure Logic
 */

import { shuffleArray } from './utils.js';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const DECK_CONFIG = {
  decks: 1, // Standard 1-deck shoe
  shuffleThreshold: 0.25 // Shuffle when 25% cards remain
};

export const createDeck = (decks = DECK_CONFIG.decks) => {
  let deck = [];
  for (let i = 0; i < decks; i++) {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push({ suit, value, id: Math.random().toString(36).substr(2, 9) });
      }
    }
  }
  return shuffleArray(deck);
};

export const shouldShuffle = (deck, totalDecks = DECK_CONFIG.decks) => {
  const totalCards = totalDecks * 52;
  const remainingRatio = deck.length / totalCards;
  return remainingRatio <= DECK_CONFIG.shuffleThreshold || deck.length === 0;
};

export const getCardValue = (card) => {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
};

export const calculateHand = (hand) => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    value += getCardValue(card);
    if (card.value === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export const isBlackjack = (hand) => {
  return hand.length === 2 && calculateHand(hand) === 21;
};

export const isBust = (hand) => {
  return calculateHand(hand) > 21;
};

export const shouldDealerHit = (hand) => {
  const value = calculateHand(hand);
  return value < 17;
};

export const determineWinner = (playerHand, dealerHand) => {
  const playerValue = calculateHand(playerHand);
  const dealerValue = calculateHand(dealerHand);

  if (playerValue > 21) return 'bust';
  if (dealerValue > 21) return 'win';
  
  if (isBlackjack(playerHand) && isBlackjack(dealerHand)) return 'push';
  if (isBlackjack(playerHand)) return 'blackjack';
  if (isBlackjack(dealerHand)) return 'loss';

  if (playerValue > dealerValue) return 'win';
  if (playerValue < dealerValue) return 'loss';
  return 'push';
};
