export default class GameState {
  constructor() {
    // Track whose turn it is: 'player' or 'computer'
    // Player always starts first in new game
    this.currentTurn = 'player';

    // Track selected character position (null if none selected)
    this.selectedCharacterIndex = null;

    // Current level (1-4)
    this.level = 1;

    // Maximum score achieved
    this.maxScore = 0;

    // Current score
    this.score = 0;
  }

  static from(object) {
    const state = new GameState();

    if (!object) {
      return state;
    }

    // Restore state from saved object
    state.currentTurn = object.currentTurn || 'player';
    state.selectedCharacterIndex = object.selectedCharacterIndex ?? null;
    state.level = object.level || 1;
    state.maxScore = object.maxScore || 0;
    state.score = object.score || 0;

    return state;
  }
}
