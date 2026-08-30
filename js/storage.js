/**
 * Storage Manager
 * Handles local persistence of scores, match history, sound settings, and game config.
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'tictactoe_light_state_v1';
  }

  getDefaultState() {
    return {
      scores: { x: 0, o: 0, ties: 0 },
      streak: 0,
      soundMuted: false,
      gameMode: 'pvp', // 'pvp' or 'pve'
      difficulty: 'medium', // 'easy', 'medium', 'impossible'
      gridSize: 3, // 3, 4, or 5
      history: []
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return this.getDefaultState();
      return { ...this.getDefaultState(), ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return this.getDefaultState();
    }
  }

  saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  clearHistory() {
    const state = this.loadState();
    state.history = [];
    this.saveState(state);
  }

  resetScores() {
    const state = this.loadState();
    state.scores = { x: 0, o: 0, ties: 0 };
    state.streak = 0;
    this.saveState(state);
  }
}

window.storageManager = new StorageManager();
