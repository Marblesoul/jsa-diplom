import themes from './themes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // Draw initial board with prairie theme
    this.gamePlay.drawUi(themes.prairie);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onCellClick(_index) {
    // TODO: react to click
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onCellEnter(_index) {
    // TODO: react to mouse enter
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onCellLeave(_index) {
    // TODO: react to mouse leave
  }
}
