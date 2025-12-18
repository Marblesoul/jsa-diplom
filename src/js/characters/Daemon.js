import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(1, 'daemon');
    this.attack = 10;
    this.defence = 10;
    this.moveRange = 1;
    this.attackRange = 4;

    for (let i = 1; i < level; i += 1) {
      this.levelUp();
    }
  }
}
