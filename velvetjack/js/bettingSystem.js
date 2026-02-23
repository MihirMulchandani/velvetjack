/**
 * Betting System Logic
 */

export const CHIP_VALUES = [1, 5, 10, 25, 100, 500, 1000, 5000];

export const canBet = (currentBet, bankroll, amount) => {
  return (currentBet + amount) <= bankroll;
};

export const validateBet = (bet) => {
  return bet > 0;
};

export const getChipColor = (value) => {
  if (value >= 5000) return 'orange';
  if (value >= 1000) return 'yellow';
  if (value >= 500) return 'purple';
  if (value >= 100) return 'black';
  if (value >= 25) return 'green';
  if (value >= 10) return 'blue';
  if (value >= 5) return 'red';
  return 'white';
};
