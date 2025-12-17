import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

describe('generators', () => {
  describe('characterGenerator', () => {
    test('should generate multiple characters infinitely', () => {
      const allowedTypes = [Bowman, Swordsman];
      const generator = characterGenerator(allowedTypes, 2);

      const char1 = generator.next().value;
      const char2 = generator.next().value;
      const char3 = generator.next().value;

      expect(char1).toBeDefined();
      expect(char2).toBeDefined();
      expect(char3).toBeDefined();
    });

    test('should generate characters only from allowedTypes', () => {
      const allowedTypes = [Bowman];
      const generator = characterGenerator(allowedTypes, 1);

      const characters = [];
      for (let i = 0; i < 10; i += 1) {
        characters.push(generator.next().value);
      }

      characters.forEach((char) => {
        expect(char.type).toBe('bowman');
      });
    });

    test('should respect maxLevel parameter', () => {
      const allowedTypes = [Swordsman];
      const maxLevel = 3;
      const generator = characterGenerator(allowedTypes, maxLevel);

      const characters = [];
      for (let i = 0; i < 20; i += 1) {
        characters.push(generator.next().value);
      }

      characters.forEach((char) => {
        expect(char.level).toBeGreaterThanOrEqual(1);
        expect(char.level).toBeLessThanOrEqual(maxLevel);
      });
    });
  });

  describe('generateTeam', () => {
    test('should create team with correct number of characters', () => {
      const allowedTypes = [Bowman, Swordsman, Magician];
      const team = generateTeam(allowedTypes, 2, 5);

      expect(team.characters.length).toBe(5);
    });

    test('should create team with characters from allowedTypes', () => {
      const allowedTypes = [Magician];
      const team = generateTeam(allowedTypes, 1, 3);

      expect(team.characters).toHaveLength(3);
      team.characters.forEach((char) => {
        expect(char.type).toBe('magician');
      });
    });

    test('should respect maxLevel parameter in team generation', () => {
      const allowedTypes = [Bowman, Swordsman];
      const maxLevel = 4;
      const team = generateTeam(allowedTypes, maxLevel, 10);

      team.characters.forEach((char) => {
        expect(char.level).toBeGreaterThanOrEqual(1);
        expect(char.level).toBeLessThanOrEqual(maxLevel);
      });
    });
  });
});
