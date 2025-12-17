import { calcTileType, formatCharacterInfo } from '../utils';

describe('calcTileType', () => {
  describe('8x8 board', () => {
    const boardSize = 8;

    test('should return "top-left" for index 0', () => {
      expect(calcTileType(0, boardSize)).toBe('top-left');
    });

    test('should return "top-right" for index 7', () => {
      expect(calcTileType(7, boardSize)).toBe('top-right');
    });

    test('should return "bottom-left" for index 56', () => {
      expect(calcTileType(56, boardSize)).toBe('bottom-left');
    });

    test('should return "bottom-right" for index 63', () => {
      expect(calcTileType(63, boardSize)).toBe('bottom-right');
    });

    test('should return "top" for top edge cells (not corners)', () => {
      expect(calcTileType(1, boardSize)).toBe('top');
      expect(calcTileType(3, boardSize)).toBe('top');
      expect(calcTileType(6, boardSize)).toBe('top');
    });

    test('should return "bottom" for bottom edge cells (not corners)', () => {
      expect(calcTileType(57, boardSize)).toBe('bottom');
      expect(calcTileType(60, boardSize)).toBe('bottom');
      expect(calcTileType(62, boardSize)).toBe('bottom');
    });

    test('should return "left" for left edge cells (not corners)', () => {
      expect(calcTileType(8, boardSize)).toBe('left');
      expect(calcTileType(16, boardSize)).toBe('left');
      expect(calcTileType(48, boardSize)).toBe('left');
    });

    test('should return "right" for right edge cells (not corners)', () => {
      expect(calcTileType(15, boardSize)).toBe('right');
      expect(calcTileType(23, boardSize)).toBe('right');
      expect(calcTileType(55, boardSize)).toBe('right');
    });

    test('should return "center" for center cells', () => {
      expect(calcTileType(9, boardSize)).toBe('center');
      expect(calcTileType(18, boardSize)).toBe('center');
      expect(calcTileType(27, boardSize)).toBe('center');
      expect(calcTileType(36, boardSize)).toBe('center');
      expect(calcTileType(45, boardSize)).toBe('center');
    });
  });

  describe('different board sizes', () => {
    test('should work correctly for 4x4 board', () => {
      const boardSize = 4;
      expect(calcTileType(0, boardSize)).toBe('top-left');
      expect(calcTileType(3, boardSize)).toBe('top-right');
      expect(calcTileType(12, boardSize)).toBe('bottom-left');
      expect(calcTileType(15, boardSize)).toBe('bottom-right');
      expect(calcTileType(1, boardSize)).toBe('top');
      expect(calcTileType(13, boardSize)).toBe('bottom');
      expect(calcTileType(4, boardSize)).toBe('left');
      expect(calcTileType(7, boardSize)).toBe('right');
      expect(calcTileType(5, boardSize)).toBe('center');
    });

    test('should work correctly for 6x6 board', () => {
      const boardSize = 6;
      expect(calcTileType(0, boardSize)).toBe('top-left');
      expect(calcTileType(5, boardSize)).toBe('top-right');
      expect(calcTileType(30, boardSize)).toBe('bottom-left');
      expect(calcTileType(35, boardSize)).toBe('bottom-right');
      expect(calcTileType(14, boardSize)).toBe('center');
    });
  });
});

describe('formatCharacterInfo', () => {
  test('should format character info with unicode symbols', () => {
    const character = {
      level: 1,
      attack: 25,
      defence: 25,
      health: 50,
    };

    const result = formatCharacterInfo(character);
    expect(result).toBe('🎖1 ⚔25 🛡25 ❤50');
  });

  test('should format character with different stats', () => {
    const character = {
      level: 2,
      attack: 40,
      defence: 10,
      health: 80,
    };

    const result = formatCharacterInfo(character);
    expect(result).toBe('🎖2 ⚔40 🛡10 ❤80');
  });

  test('should format character with maximum stats', () => {
    const character = {
      level: 4,
      attack: 100,
      defence: 100,
      health: 100,
    };

    const result = formatCharacterInfo(character);
    expect(result).toBe('🎖4 ⚔100 🛡100 ❤100');
  });

  test('should format character with low health', () => {
    const character = {
      level: 3,
      attack: 50,
      defence: 30,
      health: 10,
    };

    const result = formatCharacterInfo(character);
    expect(result).toBe('🎖3 ⚔50 🛡30 ❤10');
  });
});
