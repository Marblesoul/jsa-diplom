import Character from '../Character';

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

      const char = new TestCharacter(1);
      expect(char).toEqual({
        level: 1,
        attack: 0,
        defence: 0,
        health: 50,
        type: 'test',
      });
    });
  });
});
