import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';

describe('Character', () => {
  describe('instantiation restrictions', () => {
    test('should throw error when instantiating Character directly', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new Character(1);
      }).toThrow('Cannot instantiate Character directly');
    });

    test('should allow instantiation of Character subclass', () => {
      class TestCharacter extends Character {
        constructor(level) {
          super(level, 'test');
        }
      }

      const expectedTestCharacter = {
        level: 1,
        attack: 0,
        defence: 0,
        health: 100,
        type: 'test',
      };

      const char = new TestCharacter(1);
      expect(char).toEqual(expectedTestCharacter);
    });
  });

  describe('levelUp mechanics', () => {
    test('should increase level by 1', () => {
      const bowman = new Bowman(1);
      bowman.levelUp();
      expect(bowman.level).toBe(2);
    });

    test('should restore health by 80 (max 100)', () => {
      const bowman = new Bowman(1);
      bowman.health = 50;
      bowman.levelUp();
      expect(bowman.health).toBe(100);
    });

    test('should cap health at 100', () => {
      const bowman = new Bowman(1);
      bowman.health = 30;
      bowman.levelUp();
      expect(bowman.health).toBe(100);
    });

    test('should increase attack based on remaining health', () => {
      const bowman = new Bowman(1);
      bowman.health = 50;
      const expectedAttack = Math.floor((bowman.attack * (80 + 50)) / 100);
      bowman.levelUp();
      expect(bowman.attack).toBe(expectedAttack);
    });

    test('should increase defence based on remaining health', () => {
      const bowman = new Bowman(1);
      bowman.health = 50;
      const expectedDefence = Math.floor((bowman.defence * (80 + 50)) / 100);
      bowman.levelUp();
      expect(bowman.defence).toBe(expectedDefence);
    });

    test('should not decrease stats when health is very low', () => {
      const bowman = new Bowman(1);
      const initialAttack = bowman.attack;
      const initialDefence = bowman.defence;
      bowman.health = 1;
      bowman.levelUp();
      expect(bowman.attack).toBe(initialAttack);
      expect(bowman.defence).toBe(initialDefence);
    });
  });

  describe('multi-level character creation', () => {
    test('should create level 2 character with increased stats', () => {
      const bowman2 = new Bowman(2);
      expect(bowman2.level).toBe(2);
      expect(bowman2.attack).toBeGreaterThan(25);
      expect(bowman2.defence).toBeGreaterThan(25);
      expect(bowman2.health).toBe(100);
    });

    test('should create level 3 character with further increased stats', () => {
      const swordsman3 = new Swordsman(3);
      const swordsman1 = new Swordsman(1);
      expect(swordsman3.level).toBe(3);
      expect(swordsman3.attack).toBeGreaterThan(swordsman1.attack);
      expect(swordsman3.defence).toBeGreaterThan(swordsman1.defence);
    });

    test('should create level 4 character at maximum level', () => {
      const bowman4 = new Bowman(4);
      expect(bowman4.level).toBe(4);
      expect(bowman4.health).toBe(100);
    });
  });
});
