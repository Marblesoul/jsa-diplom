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
import GamePlay from './GamePlay';
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
    this.isComputerTurnInProgress = false;
  }

  init() {
    // Draw initial board with prairie theme
    this.gamePlay.drawUi(themes.prairie);

    // Add event listeners once
    this.addEventListeners();

    // Try to load saved game first
    if (!this.loadGame()) {
      // Only if load failed - create new game
      this.setupNewGame();
    }
  }

  addEventListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));

    // Auto-save on page unload
    window.addEventListener('beforeunload', () => {
      if (this.gameState.currentTurn !== null) {
        this.saveGame();
      }
    });
  }

  setupNewGame(level = 1) {
    // Reset game state
    this.gameState.level = level;
    this.gameState.score = 0;
    this.gameState.currentTurn = 'player';
    this.gameState.selectedCharacterIndex = null;
    this.isComputerTurnInProgress = false;

    // Set theme based on level
    const themeMap = {
      1: themes.prairie,
      2: themes.desert,
      3: themes.arctic,
      4: themes.mountain,
    };
    this.gamePlay.drawUi(themeMap[level] || themes.prairie);

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
  }

  onSaveGame() {
    this.saveGame();
    GamePlay.showMessage('Игра сохранена!');
  }

  onLoadGame() {
    if (this.loadGame()) {
      GamePlay.showMessage('Игра загружена!');
    }
  }

  saveGame() {
    this.gameState.positions = this.positions;
    this.stateService.save(this.gameState.toJSON());
  }

  loadGame() {
    try {
      const savedState = this.stateService.load();
      if (!savedState) {
        return false;
      }

      const state = GameState.from(savedState);
      this.gameState = state;
      this.positions = state.positions;

      // Reset computer turn flag to prevent blocking
      this.isComputerTurnInProgress = false;

      const themeMap = {
        1: themes.prairie,
        2: themes.desert,
        3: themes.arctic,
        4: themes.mountain,
      };
      this.gamePlay.drawUi(themeMap[this.gameState.level] || themes.prairie);
      this.gamePlay.redrawPositions(this.positions);

      // If it's computer's turn after loading, resume computer turn
      if (this.gameState.currentTurn === 'computer') {
        this.computerTurn();
      }

      return true;
    } catch (e) {
      GamePlay.showError('Не удалось загрузить игру');
      return false;
    }
  }

  onNewGame() {
    this.resetGame();
  }

  resetGame() {
    // Save max score before reset
    if (this.gameState.score > this.gameState.maxScore) {
      this.gameState.maxScore = this.gameState.score;
    }

    // Use common setup method
    this.setupNewGame();
  }

  onCellClick(index) {
    // Check if game is over
    if (this.gameState.currentTurn === null) {
      GamePlay.showError('Игра окончена! Нажмите "New Game" для начала новой игры.');
      return;
    }

    // Find character at clicked position
    const positionedCharacter = this.positions.find((pos) => pos.position === index);

    // Check if it's player's turn
    if (this.gameState.currentTurn !== 'player' || this.isComputerTurnInProgress) {
      GamePlay.showError('Сейчас ход компьютера!');
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
          GamePlay.showError('Вы не можете выбрать персонажа противника!');
        }
      }
    } else if (this.gameState.selectedCharacterIndex !== null) {
      // Clicking on empty cell with character selected - move
      this.moveCharacter(this.gameState.selectedCharacterIndex, index);
    } else {
      // Clicking on empty cell with no character selected
      GamePlay.showError('Выберите персонажа для действия!');
    }
  }

  onCellEnter(index) {
    const positionedCharacter = this.positions.find((pos) => pos.position === index);

    if (positionedCharacter) {
      const message = formatCharacterInfo(positionedCharacter.character);
      this.gamePlay.showCellTooltip(message, index);
    }

    // Check if game is over
    if (this.gameState.currentTurn === null) {
      this.gamePlay.setCursor(cursors.notallowed);
      return;
    }

    if (this.gameState.currentTurn !== 'player' || this.isComputerTurnInProgress) {
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
      GamePlay.showError('Персонаж не может переместиться на эту клетку!');
      return;
    }

    // Check if target cell is occupied
    const isOccupied = this.positions.some((pos) => pos.position === toIndex);
    if (isOccupied) {
      GamePlay.showError('Эта клетка уже занята!');
      return;
    }

    // Move character
    selectedChar.position = toIndex;

    // Deselect and redraw
    this.gamePlay.deselectCell(fromIndex);
    this.gameState.selectedCharacterIndex = null;
    this.gamePlay.redrawPositions(this.positions);

    this.saveGame();

    // Switch turn to computer
    this.gameState.currentTurn = 'computer';
    this.computerTurn();
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
      GamePlay.showError('Цель находится вне радиуса атаки!');
      return;
    }

    // Check if target is enemy
    const enemyTypes = ['vampire', 'undead', 'daemon'];
    if (!enemyTypes.includes(target.character.type)) {
      GamePlay.showError('Вы не можете атаковать своего персонажа!');
      return;
    }

    // Calculate damage
    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    );

    // Apply damage
    target.character.health -= damage;

    this.gameState.score += Math.floor(damage);

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

      this.checkLevelComplete();

      if (this.gameState.currentTurn === null) {
        return;
      }

      this.saveGame();

      // Switch turn to computer
      this.gameState.currentTurn = 'computer';
      this.computerTurn();
    });
  }

  computerTurn() {
    // Prevent multiple simultaneous computer turns
    if (this.isComputerTurnInProgress) {
      return;
    }

    this.isComputerTurnInProgress = true;

    // Use setTimeout to give visual feedback that computer is thinking
    setTimeout(() => {
      // Double-check that it's still computer's turn
      if (this.gameState.currentTurn !== 'computer') {
        this.isComputerTurnInProgress = false;
        return;
      }

      const enemyTypes = ['vampire', 'undead', 'daemon'];
      const playerTypes = ['bowman', 'swordsman', 'magician'];

      // Get all computer characters
      const computerCharacters = this.positions.filter(
        (pos) => enemyTypes.includes(pos.character.type),
      );

      // Get all player characters
      const playerCharacters = this.positions.filter(
        (pos) => playerTypes.includes(pos.character.type),
      );

      if (computerCharacters.length === 0 || playerCharacters.length === 0) {
        this.gameState.currentTurn = 'player';
        this.isComputerTurnInProgress = false;
        return;
      }

      // Try to find an attack opportunity
      let bestAttack = null;
      let lowestHealth = Infinity;

      computerCharacters.forEach((compChar) => {
        const attackCells = getAvailableAttackCells(
          compChar.position,
          compChar.character.attackRange,
          this.boardSize,
        );

        playerCharacters.forEach((playerChar) => {
          if (attackCells.includes(playerChar.position)) {
            // Prefer attacking weakest target
            if (playerChar.character.health < lowestHealth) {
              lowestHealth = playerChar.character.health;
              bestAttack = {
                attackerIndex: compChar.position,
                targetIndex: playerChar.position,
              };
            }
          }
        });
      });

      // If found attack opportunity, attack
      if (bestAttack) {
        this.performComputerAttack(bestAttack.attackerIndex, bestAttack.targetIndex);
        return;
      }

      // If no attack opportunity, try to move closer to nearest player character
      let bestMove = null;
      let shortestDistance = Infinity;

      computerCharacters.forEach((compChar) => {
        const moveCells = getAvailableMoveCells(
          compChar.position,
          compChar.character.moveRange,
          this.boardSize,
        );

        // Find nearest player character
        playerCharacters.forEach((playerChar) => {
          const targetRow = Math.floor(playerChar.position / this.boardSize);
          const targetCol = playerChar.position % this.boardSize;

          // Check each possible move position
          moveCells.forEach((movePos) => {
            const isOccupied = this.positions.some((pos) => pos.position === movePos);
            if (!isOccupied) {
              const moveRow = Math.floor(movePos / this.boardSize);
              const moveCol = movePos % this.boardSize;
              const distance = Math.abs(targetRow - moveRow) + Math.abs(targetCol - moveCol);

              if (distance < shortestDistance) {
                shortestDistance = distance;
                bestMove = {
                  fromIndex: compChar.position,
                  toIndex: movePos,
                };
              }
            }
          });
        });
      });

      // Perform best move if found
      if (bestMove) {
        this.performComputerMove(bestMove.fromIndex, bestMove.toIndex);
      } else {
        // No valid moves, switch turn back to player
        this.gameState.currentTurn = 'player';
        this.isComputerTurnInProgress = false;
      }
    }, 500);
  }

  performComputerMove(fromIndex, toIndex) {
    const selectedChar = this.positions.find((pos) => pos.position === fromIndex);
    if (!selectedChar) {
      this.isComputerTurnInProgress = false;
      return;
    }

    // Move character
    selectedChar.position = toIndex;
    this.gamePlay.redrawPositions(this.positions);

    this.saveGame();

    // Switch turn back to player
    this.gameState.currentTurn = 'player';
    this.isComputerTurnInProgress = false;
  }

  performComputerAttack(attackerIndex, targetIndex) {
    const attacker = this.positions.find((pos) => pos.position === attackerIndex);
    const target = this.positions.find((pos) => pos.position === targetIndex);

    if (!attacker || !target) {
      this.isComputerTurnInProgress = false;
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

      this.gamePlay.redrawPositions(this.positions);

      this.checkGameOver();

      this.saveGame();

      // Switch turn back to player
      this.gameState.currentTurn = 'player';
      this.isComputerTurnInProgress = false;
    });
  }

  checkLevelComplete() {
    const enemyTypes = ['vampire', 'undead', 'daemon'];
    const enemiesLeft = this.positions.filter(
      (pos) => enemyTypes.includes(pos.character.type),
    );

    if (enemiesLeft.length === 0) {
      this.startNextLevel();
    }
  }

  checkGameOver() {
    const playerTypes = ['bowman', 'swordsman', 'magician'];
    const playersLeft = this.positions.filter(
      (pos) => playerTypes.includes(pos.character.type),
    );

    if (playersLeft.length === 0) {
      if (this.gameState.score > this.gameState.maxScore) {
        this.gameState.maxScore = this.gameState.score;
      }
      GamePlay.showMessage(`Game Over! Вы проиграли.\nВаш счет: ${this.gameState.score}\nМаксимальный счет: ${this.gameState.maxScore}`);
      this.gameState.currentTurn = null;
    }
  }

  startNextLevel() {
    if (this.gameState.level >= 4) {
      if (this.gameState.score > this.gameState.maxScore) {
        this.gameState.maxScore = this.gameState.score;
      }
      GamePlay.showMessage(`Поздравляем! Вы прошли все уровни!\nВаш счет: ${this.gameState.score}\nМаксимальный счет: ${this.gameState.maxScore}`);
      this.gameState.currentTurn = null;
      return;
    }

    this.gameState.level += 1;

    const playerTypes = ['bowman', 'swordsman', 'magician'];
    const survivingPlayers = this.positions.filter(
      (pos) => playerTypes.includes(pos.character.type),
    );

    survivingPlayers.forEach((posChar) => {
      posChar.character.levelUp();
    });

    const themeMap = {
      1: themes.prairie,
      2: themes.desert,
      3: themes.arctic,
      4: themes.mountain,
    };
    this.gamePlay.drawUi(themeMap[this.gameState.level]);

    const enemyTypes = [Vampire, Undead, Daemon];
    const enemyCount = survivingPlayers.length + 1;
    this.enemyTeam = generateTeam(enemyTypes, this.gameState.level, enemyCount);

    const playerColumns = [0, 1];
    const enemyColumns = [6, 7];

    const playerPositions = getPositionsForColumns(this.boardSize, playerColumns);
    const enemyPositions = getPositionsForColumns(this.boardSize, enemyColumns);

    const selectedPlayerPositions = selectRandomPositions(
      playerPositions,
      survivingPlayers.length,
    );
    const selectedEnemyPositions = selectRandomPositions(
      enemyPositions,
      this.enemyTeam.characters.length,
    );

    this.positions = [];

    survivingPlayers.forEach((posChar, index) => {
      const updatedPosChar = posChar;
      updatedPosChar.position = selectedPlayerPositions[index];
      this.positions.push(updatedPosChar);
    });

    this.enemyTeam.characters.forEach((character, index) => {
      this.positions.push(
        new PositionedCharacter(character, selectedEnemyPositions[index]),
      );
    });

    this.gamePlay.redrawPositions(this.positions);
    this.gameState.currentTurn = 'player';
    this.gameState.selectedCharacterIndex = null;
  }
}
