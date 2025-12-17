import themes from './themes';
import { generateTeam } from './generators';
import {
  getPositionsForColumns,
  selectRandomPositions,
  formatCharacterInfo,
  getAvailableMoveCells,
  getAvailableAttackCells,
} from './utils';
import cursors from './cursors';
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
    const positionedCharacter = this.positions.find((pos) => pos.position === index);

    if (positionedCharacter) {
      const message = formatCharacterInfo(positionedCharacter.character);
      this.gamePlay.showCellTooltip(message, index);
    }

    if (this.gameState.currentTurn !== 'player') {
      this.gamePlay.setCursor(cursors.auto);
      return;
    }

    const selectedPosition = this.gameState.selectedCharacterIndex;
    if (selectedPosition === null) {
      if (positionedCharacter) {
        const playerTypes = ['bowman', 'swordsman', 'magician'];
        if (playerTypes.includes(positionedCharacter.character.type)) {
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.auto);
        }
      }
      return;
    }

    const selectedChar = this.positions.find((pos) => pos.position === selectedPosition);
    if (!selectedChar) return;

    const { character } = selectedChar;
    const moveCells = getAvailableMoveCells(selectedPosition, character.moveRange, this.boardSize);
    const attackCells = getAvailableAttackCells(
      selectedPosition,
      character.attackRange,
      this.boardSize,
    );

    const isOccupied = this.positions.some((pos) => pos.position === index);
    const canMove = moveCells.includes(index) && !isOccupied;
    const canAttack = attackCells.includes(index) && positionedCharacter;

    const playerTypes = ['bowman', 'swordsman', 'magician'];
    const isPlayerCharacter = positionedCharacter
      && playerTypes.includes(positionedCharacter.character.type);

    if (isPlayerCharacter) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (canMove) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } else if (canAttack) {
      const enemyTypes = ['vampire', 'undead', 'daemon'];
      if (positionedCharacter && enemyTypes.includes(positionedCharacter.character.type)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);

    const selectedPosition = this.gameState.selectedCharacterIndex;
    if (selectedPosition !== null && index !== selectedPosition) {
      this.gamePlay.deselectCell(index);
    }
  }
}
