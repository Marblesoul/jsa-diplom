import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

const expectedPlayerCharacters = {
  bowman: {
    level: 1,
    attack: 25,
    defence: 25,
    health: 100,
    type: 'bowman',
    moveRange: 2,
    attackRange: 2,
  },
  swordsman: {
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'swordsman',
    moveRange: 4,
    attackRange: 1,
  },
  magician: {
    level: 1,
    attack: 10,
    defence: 40,
    health: 100,
    type: 'magician',
    moveRange: 1,
    attackRange: 4,
  },
};

const expectedEnemyCharacters = {
  vampire: {
    level: 1,
    attack: 25,
    defence: 25,
    health: 100,
    type: 'vampire',
    moveRange: 2,
    attackRange: 2,
  },
  undead: {
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'undead',
    moveRange: 4,
    attackRange: 1,
  },
  daemon: {
    level: 1,
    attack: 10,
    defence: 10,
    health: 100,
    type: 'daemon',
    moveRange: 1,
    attackRange: 4,
  },
};

describe('Character classes', () => {
  describe('Player characters', () => {
    test('should create Bowman with correct initial stats', () => {
      const bowman = new Bowman(1);
      expect(bowman).toEqual(expectedPlayerCharacters.bowman);
    });

    test('should create Swordsman with correct initial stats', () => {
      const swordsman = new Swordsman(1);
      expect(swordsman).toEqual(expectedPlayerCharacters.swordsman);
    });

    test('should create Magician with correct initial stats', () => {
      const magician = new Magician(1);
      expect(magician).toEqual(expectedPlayerCharacters.magician);
    });
  });

  describe('Enemy characters', () => {
    test('should create Vampire with correct initial stats', () => {
      const vampire = new Vampire(1);
      expect(vampire).toEqual(expectedEnemyCharacters.vampire);
    });

    test('should create Undead with correct initial stats', () => {
      const undead = new Undead(1);
      expect(undead).toEqual(expectedEnemyCharacters.undead);
    });

    test('should create Daemon with correct initial stats', () => {
      const daemon = new Daemon(1);
      expect(daemon).toEqual(expectedEnemyCharacters.daemon);
    });
  });
});
