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
      const enemyTypes = ['vampire', 'undead', 'daemon'];

      // Check if it's a player character
      if (playerTypes.includes(character.type)) {
        // Deselect previous character if any
        if (this.gameState.selectedCharacterIndex !== null) {
          this.gamePlay.deselectCell(this.gameState.selectedCharacterIndex);
        }

        // Select new character
        this.gameState.selectedCharacterIndex = index;
        this.gamePlay.selectCell(index);
      } else if (enemyTypes.includes(character.type)) {
        // Trying to attack enemy character
        if (this.gameState.selectedCharacterIndex !== null) {
          this.attackCharacter(this.gameState.selectedCharacterIndex, index);
        } else {
          this.gamePlay.showError('Вы не можете выбрать персонажа противника!');
        }
      }
    } else if (this.gameState.selectedCharacterIndex !== null) {
      // Clicking on empty cell with character selected - move
      this.moveCharacter(this.gameState.selectedCharacterIndex, index);
    } else {
      // Clicking on empty cell with no character selected
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

  moveCharacter(fromIndex, toIndex) {
    const selectedChar = this.positions.find((pos) => pos.position === fromIndex);
    if (!selectedChar) return;

    const { character } = selectedChar;
    const moveCells = getAvailableMoveCells(fromIndex, character.moveRange, this.boardSize);

    // Check if target cell is in available move cells
    if (!moveCells.includes(toIndex)) {
      this.gamePlay.showError('Персонаж не может переместиться на эту клетку!');
      return;
    }

    // Check if target cell is occupied
    const isOccupied = this.positions.some((pos) => pos.position === toIndex);
    if (isOccupied) {
      this.gamePlay.showError('Эта клетка уже занята!');
      return;
    }

    // Move character
    selectedChar.position = toIndex;

    // Deselect and redraw
    this.gamePlay.deselectCell(fromIndex);
    this.gameState.selectedCharacterIndex = null;
    this.gamePlay.redrawPositions(this.positions);

    // Switch turn to computer
    this.gameState.currentTurn = 'computer';
    // TODO: implement computer AI turn in next phase
  }

  attackCharacter(attackerIndex, targetIndex) {
    const attacker = this.positions.find((pos) => pos.position === attackerIndex);
    const target = this.positions.find((pos) => pos.position === targetIndex);

    if (!attacker || !target) return;

    const attackCells = getAvailableAttackCells(
      attackerIndex,
      attacker.character.attackRange,
      this.boardSize,
    );

    // Check if target is in attack range
    if (!attackCells.includes(targetIndex)) {
      this.gamePlay.showError('Цель находится вне радиуса атаки!');
      return;
    }

    // Check if target is enemy
    const enemyTypes = ['vampire', 'undead', 'daemon'];
    if (!enemyTypes.includes(target.character.type)) {
      this.gamePlay.showError('Вы не можете атаковать своего персонажа!');
      return;
    }

    // Calculate damage
    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    );

    // Apply damage
    target.character.health -= damage;

    // Show damage animation
    this.gamePlay.showDamage(targetIndex, damage).then(() => {
      // Remove dead characters
      if (target.character.health <= 0) {
        this.positions = this.positions.filter((pos) => pos.position !== targetIndex);
      }

      // Deselect and redraw
      this.gamePlay.deselectCell(attackerIndex);
      this.gameState.selectedCharacterIndex = null;
      this.gamePlay.redrawPositions(this.positions);

      // Switch turn to computer
      this.gameState.currentTurn = 'computer';
      // TODO: implement computer AI turn in next phase
    });
  }
}
