import GameStateService from '../GameStateService';

describe('GameStateService', () => {
  let storage;
  let service;

  beforeEach(() => {
    storage = {
      data: {},
      setItem(key, value) {
        this.data[key] = value;
      },
      getItem(key) {
        return this.data[key];
      },
    };
    service = new GameStateService(storage);
  });

  describe('save', () => {
    test('should save state to storage', () => {
      const state = {
        level: 2,
        score: 100,
        maxScore: 150,
      };

      service.save(state);

      expect(storage.data.state).toBeDefined();
      expect(JSON.parse(storage.data.state)).toEqual(state);
    });
  });

  describe('load', () => {
    test('should load valid state from storage', () => {
      const state = {
        level: 2,
        score: 100,
        maxScore: 150,
        currentTurn: 'player',
        positions: [],
      };

      storage.setItem('state', JSON.stringify(state));

      const loadedState = service.load();
      expect(loadedState).toEqual(state);
    });

    test('should throw error when state is invalid JSON', () => {
      storage.setItem('state', 'invalid json{');

      expect(() => {
        service.load();
      }).toThrow('Invalid state');
    });

    test('should return null when state is null', () => {
      storage.setItem('state', null);

      const loadedState = service.load();
      expect(loadedState).toBeNull();
    });

    test('should return null when state is empty string', () => {
      storage.setItem('state', '');

      const loadedState = service.load();
      expect(loadedState).toBeNull();
    });

    test('should return null when no state exists', () => {
      const loadedState = service.load();
      expect(loadedState).toBeNull();
    });
  });
});
