import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  constructor() {
    this.currentTurn = 'player';
    this.selectedCharacterIndex = null;
    this.level = 1;
    this.maxScore = 0;
    this.score = 0;
    this.positions = [];
  }

  toJSON() {
    return {
      currentTurn: this.currentTurn,
      selectedCharacterIndex: this.selectedCharacterIndex,
      level: this.level,
      maxScore: this.maxScore,
      score: this.score,
      positions: this.positions.map((pos) => ({
        position: pos.position,
        character: {
          type: pos.character.type,
          level: pos.character.level,
          attack: pos.character.attack,
          defence: pos.character.defence,
          health: pos.character.health,
        },
      })),
    };
  }

  static from(object) {
    const state = new GameState();

    if (!object) {
      return state;
    }

    state.currentTurn = object.currentTurn || 'player';
    state.selectedCharacterIndex = object.selectedCharacterIndex ?? null;
    state.level = object.level || 1;
    state.maxScore = object.maxScore || 0;
    state.score = object.score || 0;

    if (object.positions && Array.isArray(object.positions)) {
      const characterClassMap = {
        bowman: Bowman,
        swordsman: Swordsman,
        magician: Magician,
        vampire: Vampire,
        undead: Undead,
        daemon: Daemon,
      };

      state.positions = object.positions.map((posData) => {
        const CharClass = characterClassMap[posData.character.type];
        if (!CharClass) {
          throw new Error(`Unknown character type: ${posData.character.type}`);
        }

        // Create character with correct level (applies levelUp logic automatically)
        const character = new CharClass(posData.character.level);

        // Only correct health (may differ from 100 after battle)
        character.health = posData.character.health;

        return new PositionedCharacter(character, posData.position);
      });
    }

    return state;
  }
}
