/**
 * Storage Manager for VelvetJack
 * Handles local storage persistence
 */

const STORAGE_KEY = 'velvetjack_save_v1';

export const saveGame = (state) => {
  try {
    const dataToSave = {
      bankroll: state.bankroll,
      stats: state.stats,
      settings: state.settings,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
};

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Basic validation
    if (typeof parsed.bankroll !== 'number' || isNaN(parsed.bankroll)) {
      console.warn('Corrupted save data found (bankroll). Resetting.');
      return null;
    }
    
    return parsed;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
};

export const clearSave = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear save:', e);
  }
};
