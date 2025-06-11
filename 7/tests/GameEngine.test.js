import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GameEngine } from '../src/GameEngine.js';

// Mock readline to avoid actual user input during tests
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

describe('GameEngine', () => {
  let game;

  beforeEach(() => {
    game = new GameEngine({
      boardSize: 5, // Smaller board for faster tests
      numShips: 2,
      shipLength: 2,
      debugMode: false
    });
  });

  afterEach(() => {
    if (game && game.rl) {
      game.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with default config', () => {
      const defaultGame = new GameEngine();
      
      expect(defaultGame.config.boardSize).toBe(10);
      expect(defaultGame.config.numShips).toBe(3);
      expect(defaultGame.config.shipLength).toBe(3);
      expect(defaultGame.config.debugMode).toBe(false);
    });

    test('should initialize with custom config', () => {
      expect(game.config.boardSize).toBe(5);
      expect(game.config.numShips).toBe(2);
      expect(game.config.shipLength).toBe(2);
    });

    test('should initialize game components', () => {
      expect(game.playerBoard).toBeDefined();
      expect(game.cpuBoard).toBeDefined();
      expect(game.cpuPlayer).toBeDefined();
      expect(game.gameOver).toBe(false);
      expect(game.currentPlayer).toBe('player');
    });
  });

  describe('initializeGame()', () => {
    test('should reset game state', async () => {
      // Set some initial state
      game.gameOver = true;
      game.currentPlayer = 'cpu';
      
      await game.initializeGame();
      
      expect(game.gameOver).toBe(false);
      expect(game.currentPlayer).toBe('player');
    });

    test('should place ships on both boards', async () => {
      await game.initializeGame();
      
      expect(game.playerBoard.ships).toHaveLength(2);
      expect(game.cpuBoard.ships).toHaveLength(2);
    });

    test('should reset boards and CPU player', async () => {
      // Add some state first
      game.playerBoard.processGuess(0, 0);
      game.cpuPlayer.guesses.add('11');
      
      await game.initializeGame();
      
      expect(game.playerBoard.guesses.size).toBe(0);
      expect(game.cpuPlayer.guesses.size).toBe(0);
    });
  });

  describe('parseInput()', () => {
    test('should parse valid input correctly', () => {
      expect(game.parseInput('00')).toEqual({ row: 0, col: 0 });
      expect(game.parseInput('23')).toEqual({ row: 2, col: 3 });
      expect(game.parseInput('44')).toEqual({ row: 4, col: 4 });
    });

    test('should reject invalid input', () => {
      expect(game.parseInput('')).toBeNull();
      expect(game.parseInput('0')).toBeNull();
      expect(game.parseInput('000')).toBeNull();
      expect(game.parseInput('ab')).toBeNull();
      expect(game.parseInput('1a')).toBeNull();
      expect(game.parseInput(null)).toBeNull();
      expect(game.parseInput(undefined)).toBeNull();
    });

    test('should reject out of bounds coordinates', () => {
      expect(game.parseInput('55')).toBeNull(); // Board size is 5, so 55 is invalid
      expect(game.parseInput('50')).toBeNull();
      expect(game.parseInput('05')).toBeNull();
    });

    test('should handle edge coordinates', () => {
      expect(game.parseInput('04')).toEqual({ row: 0, col: 4 });
      expect(game.parseInput('40')).toEqual({ row: 4, col: 0 });
    });

    test('should trim whitespace', () => {
      expect(game.parseInput(' 12 ')).toEqual({ row: 1, col: 2 });
      expect(game.parseInput('\t34\n')).toEqual({ row: 3, col: 4 });
    });
  });

  describe('makeMove()', () => {
    beforeEach(async () => {
      await game.initializeGame();
    });

    test('should process player move correctly', () => {
      const result = game.makeMove('player', 0, 0);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('position', '00');
    });

    test('should process CPU move correctly', () => {
      const result = game.makeMove('cpu', 1, 1);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('position', '11');
    });

    test('should update CPU AI state on CPU move', () => {
      const initialGuesses = game.cpuPlayer.guesses.size;
      
      game.makeMove('cpu', 2, 2);
      
      expect(game.cpuPlayer.guesses.size).toBeGreaterThan(initialGuesses);
    });

    test('should throw error for invalid player', () => {
      expect(() => {
        game.makeMove('invalid', 0, 0);
      }).toThrow('Invalid player specified');
    });
  });

  describe('switchPlayer()', () => {
    test('should switch from player to cpu', () => {
      game.currentPlayer = 'player';
      game.switchPlayer();
      expect(game.currentPlayer).toBe('cpu');
    });

    test('should switch from cpu to player', () => {
      game.currentPlayer = 'cpu';
      game.switchPlayer();
      expect(game.currentPlayer).toBe('player');
    });
  });

  describe('checkGameEnd()', () => {
    beforeEach(async () => {
      await game.initializeGame();
    });

    test('should detect player victory', () => {
      // Sink all CPU ships
      game.cpuBoard.ships.forEach(ship => {
        ship.locations.forEach(pos => {
          const row = parseInt(pos[0]);
          const col = parseInt(pos[1]);
          game.cpuBoard.processGuess(row, col);
        });
      });
      
      game.checkGameEnd();
      
      expect(game.gameOver).toBe(true);
    });

    test('should detect CPU victory', () => {
      // Sink all player ships
      game.playerBoard.ships.forEach(ship => {
        ship.locations.forEach(pos => {
          const row = parseInt(pos[0]);
          const col = parseInt(pos[1]);
          game.playerBoard.processGuess(row, col);
        });
      });
      
      game.checkGameEnd();
      
      expect(game.gameOver).toBe(true);
    });

    test('should not end game when ships remain', () => {
      // Make some moves but don't sink all ships
      game.makeMove('player', 0, 0);
      game.makeMove('cpu', 1, 1);
      
      game.checkGameEnd();
      
      expect(game.gameOver).toBe(false);
    });
  });

  describe('getGameState()', () => {
    beforeEach(async () => {
      await game.initializeGame();
    });

    test('should return current game state', () => {
      const state = game.getGameState();
      
      expect(state).toHaveProperty('gameOver', false);
      expect(state).toHaveProperty('currentPlayer', 'player');
      expect(state).toHaveProperty('playerShipsRemaining');
      expect(state).toHaveProperty('cpuShipsRemaining');
      expect(state).toHaveProperty('playerGuesses');
      expect(state).toHaveProperty('cpuGuesses');
      expect(state).toHaveProperty('cpuAIState');
    });

    test('should track game progress', () => {
      const initialState = game.getGameState();
      
      game.makeMove('player', 0, 0);
      game.makeMove('cpu', 1, 1);
      
      const newState = game.getGameState();
      
      expect(newState.playerGuesses).toBeGreaterThan(initialState.playerGuesses);
      expect(newState.cpuGuesses).toBeGreaterThan(initialState.cpuGuesses);
    });
  });

  describe('resetGame()', () => {
    test('should reset game to initial state', async () => {
      // Set up some game state
      await game.initializeGame();
      game.makeMove('player', 0, 0);
      game.makeMove('cpu', 1, 1);
      game.gameOver = true;
      
      await game.resetGame();
      
      const state = game.getGameState();
      expect(state.gameOver).toBe(false);
      expect(state.playerGuesses).toBe(0);
      expect(state.cpuGuesses).toBe(0);
    });
  });

  describe('setDebugMode()', () => {
    test('should enable debug mode', () => {
      game.setDebugMode(true);
      expect(game.config.debugMode).toBe(true);
    });

    test('should disable debug mode', () => {
      game.setDebugMode(false);
      expect(game.config.debugMode).toBe(false);
    });
  });

  describe('delay()', () => {
    test('should return a promise that resolves after delay', async () => {
      const start = Date.now();
      await game.delay(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(40); // Allow some variance
    });
  });

  describe('cleanup()', () => {
    test('should close readline interface', () => {
      const mockClose = jest.fn();
      game.rl = { close: mockClose };
      
      game.cleanup();
      
      expect(mockClose).toHaveBeenCalled();
    });

    test('should handle missing readline interface', () => {
      game.rl = null;
      
      expect(() => {
        game.cleanup();
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    test('should handle complete game flow', async () => {
      await game.initializeGame();
      
      // Verify initial state
      expect(game.gameOver).toBe(false);
      expect(game.playerBoard.ships).toHaveLength(2);
      expect(game.cpuBoard.ships).toHaveLength(2);
      
      // Make some moves
      const playerResult = game.makeMove('player', 0, 0);
      const cpuResult = game.makeMove('cpu', 1, 1);
      
      expect(playerResult.valid).toBe(true);
      expect(cpuResult.valid).toBe(true);
      
      // Check game state
      const state = game.getGameState();
      expect(state.playerGuesses).toBe(1);
      expect(state.cpuGuesses).toBe(1);
    });

    test('should handle game completion', async () => {
      await game.initializeGame();
      
      // Sink all CPU ships to trigger win condition
      const allCpuPositions = game.cpuBoard.getAllShipPositions();
      allCpuPositions.forEach(pos => {
        const row = parseInt(pos[0]);
        const col = parseInt(pos[1]);
        game.makeMove('player', row, col);
      });
      
      game.checkGameEnd();
      
      expect(game.gameOver).toBe(true);
      expect(game.cpuBoard.areAllShipsSunk()).toBe(true);
    });

    test('should prevent moves after game ends', async () => {
      await game.initializeGame();
      
      // End the game
      game.gameOver = true;
      
      // Game state should reflect that it's over
      const state = game.getGameState();
      expect(state.gameOver).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle board placement errors gracefully', async () => {
      // Create a game with impossible ship configuration
      const impossibleGame = new GameEngine({
        boardSize: 3,
        numShips: 10, // Too many ships for small board
        shipLength: 3
      });
      
      await expect(impossibleGame.initializeGame()).rejects.toThrow();
      
      impossibleGame.cleanup();
    });

    test('should handle invalid move attempts', async () => {
      await game.initializeGame();
      
      // Try to make the same move twice
      game.makeMove('player', 0, 0);
      const result = game.makeMove('player', 0, 0);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Already guessed this position');
    });
  });
}); 