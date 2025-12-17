import themes from './themes';
import { generateTeam } from './generators';
import {
  getPositionsForColumns,
  selectRandomPositions,
  formatCharacterInfo,
} from './utils';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.gameState = new GameState();
  }

  init() {
    // Draw initial board with prairie theme
    this.gamePlay.drawUi(themes.prairie);

    // Generate player and enemy teams
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];

    this.playerTeam = generateTeam(playerTypes, 1, 2);
    this.enemyTeam = generateTeam(enemyTypes, 1, 2);

    // Generate positions for teams
    const playerColumns = [0, 1]; // columns 1-2
    const enemyColumns = [6, 7]; // columns 7-8

    const playerPositions = getPositionsForColumns(this.boardSize, playerColumns);
    const enemyPositions = getPositionsForColumns(this.boardSize, enemyColumns);

    const selectedPlayerPositions = selectRandomPositions(
      playerPositions,
      this.playerTeam.characters.length,
    );
    const selectedEnemyPositions = selectRandomPositions(
      enemyPositions,
      this.enemyTeam.characters.length,
    );

    // Create positioned characters
    this.positions = [];

    this.playerTeam.characters.forEach((character, index) => {
      this.positions.push(
        new PositionedCharacter(character, selectedPlayerPositions[index]),
      );
    });

    this.enemyTeam.characters.forEach((character, index) => {
      this.positions.push(
        new PositionedCharacter(character, selectedEnemyPositions[index]),
      );
    });

    // Render all positioned characters
    this.gamePlay.redrawPositions(this.positions);

    // Add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // Find character at clicked position
    const positionedCharacter = this.positions.find((pos) => pos.position === index);

    // Check if it's player's turn
    if (this.gameState.currentTurn !== 'player') {
      this.gamePlay.showError('Сейчас ход компьютера!');
      return;
    }

    // If clicking on a cell with a character
    if (positionedCharacter) {
      const { character } = positionedCharacter;
      const playerTypes = ['bowman', 'swordsman', 'magician'];

      // Check if it's a player character
      if (playerTypes.includes(character.type)) {
        // Deselect previous character if any
        if (this.gameState.selectedCharacterIndex !== null) {
          this.gamePlay.deselectCell(this.gameState.selectedCharacterIndex);
        }

        // Select new character
        this.gameState.selectedCharacterIndex = index;
        this.gamePlay.selectCell(index);
      } else {
        // Trying to select enemy character
        this.gamePlay.showError('Вы не можете выбрать персонажа противника!');
      }
    } else {
      // Clicking on empty cell
      // TODO: implement movement/attack logic in next phases
      this.gamePlay.showError('Выберите персонажа для действия!');
    }
  }

  onCellEnter(index) {
    // Find character at this position
    const positionedCharacter = this.positions.find((pos) => pos.position === index);

    if (positionedCharacter) {
      // Show tooltip with character info
      const message = formatCharacterInfo(positionedCharacter.character);
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    // Hide tooltip when leaving cell
    this.gamePlay.hideCellTooltip(index);
  }
}
