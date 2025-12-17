import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

describe('Character classes', () => {
  describe('Player characters', () => {
    test('should create Bowman with correct initial stats', () => {
      const bowman = new Bowman(1);
      expect(bowman).toEqual({
        level: 1,
        attack: 25,
        defence: 25,
        health: 50,
        type: 'bowman',
      });
    });

    test('should create Swordsman with correct initial stats', () => {
      const swordsman = new Swordsman(1);
      expect(swordsman).toEqual({
        level: 1,
        attack: 40,
        defence: 10,
        health: 50,
        type: 'swordsman',
      });
    });

    test('should create Magician with correct initial stats', () => {
      const magician = new Magician(1);
      expect(magician).toEqual({
        level: 1,
        attack: 10,
        defence: 40,
        health: 50,
        type: 'magician',
      });
    });
  });

  describe('Enemy characters', () => {
    test('should create Vampire with correct initial stats', () => {
      const vampire = new Vampire(1);
      expect(vampire).toEqual({
        level: 1,
        attack: 25,
        defence: 25,
        health: 50,
        type: 'vampire',
      });
    });

    test('should create Undead with correct initial stats', () => {
      const undead = new Undead(1);
      expect(undead).toEqual({
        level: 1,
        attack: 40,
        defence: 10,
        health: 50,
        type: 'undead',
      });
    });

    test('should create Daemon with correct initial stats', () => {
      const daemon = new Daemon(1);
      expect(daemon).toEqual({
        level: 1,
        attack: 10,
        defence: 10,
        health: 50,
        type: 'daemon',
      });
    });
  });
});
