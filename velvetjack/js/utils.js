/**
 * Utility functions for VelvetJack
 */

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const generateId = () => Math.random().toString(36).substr(2, 9);
