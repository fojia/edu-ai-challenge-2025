import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CPUPlayer } from '../src/CPUPlayer.js';

describe('CPUPlayer', () => {
  let cpu;

  beforeEach(() => {
    cpu = new CPUPlayer(10);
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      expect(cpu.boardSize).toBe(10);
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.guesses.size).toBe(0);
      expect(cpu.lastHit).toBeNull();
      expect(cpu.hitSequence).toEqual([]);
    });

    test('should accept custom board size', () => {
      const customCpu = new CPUPlayer(8);
      expect(customCpu.boardSize).toBe(8);
    });
  });

  describe('reset()', () => {
    test('should reset all state to initial values', () => {
      // Set up some state
      cpu.mode = 'target';
      cpu.targetQueue = [{ row: 1, col: 1 }];
      cpu.guesses.add('00');
      cpu.lastHit = { row: 0, col: 0 };
      cpu.hitSequence = [{ row: 0, col: 0 }];

      cpu.reset();

      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.guesses.size).toBe(0);
      expect(cpu.lastHit).toBeNull();
      expect(cpu.hitSequence).toEqual([]);
    });
  });

  describe('makeMove()', () => {
    test('should return valid move coordinates', () => {
      const move = cpu.makeMove();
      
      expect(move).toHaveProperty('row');
      expect(move).toHaveProperty('col');
      expect(typeof move.row).toBe('number');
      expect(typeof move.col).toBe('number');
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(10);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(10);
    });

    test('should add move to guesses', () => {
      const move = cpu.makeMove();
      const position = `${move.row}${move.col}`;
      
      expect(cpu.guesses.has(position)).toBe(true);
    });

    test('should not repeat the same move', () => {
      const moves = new Set();
      
      // Make multiple moves and ensure they're unique
      for (let i = 0; i < 10; i++) {
        const move = cpu.makeMove();
        const position = `${move.row}${move.col}`;
        expect(moves.has(position)).toBe(false);
        moves.add(position);
      }
    });

    test('should prioritize target queue when in target mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue = [{ row: 2, col: 3, priority: 1 }];
      
      const move = cpu.makeMove();
      
      expect(move.row).toBe(2);
      expect(move.col).toBe(3);
      expect(cpu.targetQueue).toHaveLength(0);
    });
  });

  describe('processResult()', () => {
    test('should ignore invalid results', () => {
      const initialState = cpu.getState();
      
      cpu.processResult({ valid: false, reason: 'test' });
      
      expect(cpu.getState()).toEqual(initialState);
    });

    test('should switch to target mode on hit', () => {
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '23'
      };
      
      cpu.processResult(result);
      
      expect(cpu.mode).toBe('target');
      expect(cpu.lastHit).toEqual({ row: 2, col: 3 });
      expect(cpu.hitSequence).toContainEqual({ row: 2, col: 3 });
      expect(cpu.targetQueue.length).toBeGreaterThan(0);
    });

    test('should switch to hunt mode when ship is sunk', () => {
      // Set up target mode first
      cpu.mode = 'target';
      cpu.hitSequence = [{ row: 1, col: 1 }];
      cpu.targetQueue = [{ row: 1, col: 2 }];
      
      const result = {
        valid: true,
        hit: true,
        sunk: true,
        position: '12'
      };
      
      cpu.processResult(result);
      
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.hitSequence).toEqual([]);
    });

    test('should add adjacent targets on hit', () => {
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '55' // Middle of board
      };
      
      cpu.processResult(result);
      
      expect(cpu.targetQueue.length).toBe(4); // Up, down, left, right
      
      const targetPositions = cpu.targetQueue.map(t => `${t.row}${t.col}`);
      expect(targetPositions).toContain('45'); // Up
      expect(targetPositions).toContain('65'); // Down
      expect(targetPositions).toContain('54'); // Left
      expect(targetPositions).toContain('56'); // Right
    });

    test('should not add invalid adjacent targets', () => {
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '00' // Corner position
      };
      
      cpu.processResult(result);
      
      expect(cpu.targetQueue.length).toBe(2); // Only right and down
      
      const targetPositions = cpu.targetQueue.map(t => `${t.row}${t.col}`);
      expect(targetPositions).toContain('10'); // Down
      expect(targetPositions).toContain('01'); // Right
    });

    test('should handle miss in target mode', () => {
      // Set up target mode
      cpu.mode = 'target';
      cpu.targetQueue = [{ row: 1, col: 1 }, { row: 1, col: 2 }];
      
      const result = {
        valid: true,
        hit: false,
        sunk: false,
        position: '11'
      };
      
      cpu.processResult(result);
      
      // Should remove the missed target from queue
      expect(cpu.targetQueue.length).toBe(1);
      expect(cpu.targetQueue[0]).toEqual({ row: 1, col: 2 });
    });

    test('should switch to hunt mode when target queue is empty after miss', () => {
      cpu.mode = 'target';
      cpu.targetQueue = [{ row: 1, col: 1 }];
      cpu.hitSequence = [{ row: 0, col: 0 }];
      
      const result = {
        valid: true,
        hit: false,
        sunk: false,
        position: '11'
      };
      
      cpu.processResult(result);
      
      expect(cpu.mode).toBe('hunt');
      expect(cpu.hitSequence).toEqual([]);
    });
  });

  describe('getState()', () => {
    test('should return current state information', () => {
      cpu.mode = 'target';
      cpu.targetQueue = [{ row: 1, col: 1 }];
      cpu.guesses.add('00');
      cpu.hitSequence = [{ row: 0, col: 0 }];
      
      const state = cpu.getState();
      
      expect(state).toEqual({
        mode: 'target',
        targetQueueLength: 1,
        guessesCount: 1,
        hitSequenceLength: 1
      });
    });
  });

  describe('Hunt mode behavior', () => {
    test('should use checkerboard pattern in hunt mode', () => {
      // Mock Math.random to make behavior predictable
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn(() => {
        // Return deterministic values to control ship placement
        const values = [0.1, 0.2, 0.3, 0.4, 0.5];
        return values[callCount++ % values.length];
      });

      const moves = [];
      
      // Make several moves in hunt mode
      for (let i = 0; i < 5; i++) {
        const move = cpu.makeMove();
        moves.push(move);
      }
      
      // Check that at least some moves follow checkerboard pattern
      const checkerboardMoves = moves.filter(move => 
        (move.row + move.col) % 2 === 0
      );
      
      expect(checkerboardMoves.length).toBeGreaterThan(0);
      
      // Restore original Math.random
      Math.random = originalRandom;
    });
  });

  describe('Target mode behavior', () => {
    test('should prioritize directional targets after multiple hits', () => {
      // Simulate hitting a ship horizontally
      cpu.mode = 'target';
      cpu.hitSequence = [
        { row: 3, col: 3 },
        { row: 3, col: 4 }
      ];
      cpu.targetQueue = [{ row: 2, col: 3 }]; // Add a target that will be "missed"
      
      // Process the pattern to add directional targets
      cpu.processResult({
        valid: true,
        hit: false, // Miss to trigger directional logic
        sunk: false,
        position: '23' // Miss the target in queue
      });
      
      // Should have added targets at the ends of the horizontal line
      const hasLeftTarget = cpu.targetQueue.some(t => t.row === 3 && t.col === 2);
      const hasRightTarget = cpu.targetQueue.some(t => t.row === 3 && t.col === 5);
      
      expect(hasLeftTarget || hasRightTarget).toBe(true);
    });

    test('should handle vertical hit patterns', () => {
      cpu.mode = 'target';
      cpu.hitSequence = [
        { row: 2, col: 5 },
        { row: 3, col: 5 }
      ];
      cpu.targetQueue = [{ row: 1, col: 4 }]; // Add a target that will be "missed"
      
      cpu.processResult({
        valid: true,
        hit: false,
        sunk: false,
        position: '14' // Miss the target in queue
      });
      
      // Should have added targets at the ends of the vertical line
      const hasTopTarget = cpu.targetQueue.some(t => t.row === 1 && t.col === 5);
      const hasBottomTarget = cpu.targetQueue.some(t => t.row === 4 && t.col === 5);
      
      expect(hasTopTarget || hasBottomTarget).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle full board gracefully', () => {
      // Fill the guesses set to nearly full
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) { // Leave last column
          cpu.guesses.add(`${row}${col}`);
        }
      }
      
      const move = cpu.makeMove();
      
      // Should still find a valid move
      expect(move.col).toBe(9);
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(10);
    });

    test('should throw error when no moves available', () => {
      // Fill all positions
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          cpu.guesses.add(`${row}${col}`);
        }
      }
      
      expect(() => {
        cpu.makeMove();
      }).toThrow('No available moves left');
    });

    test('should handle board edge positions in target mode', () => {
      // Test corner position
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '99'
      };
      
      cpu.processResult(result);
      
      // Should only add valid adjacent positions
      expect(cpu.targetQueue.length).toBeLessThanOrEqual(2);
      cpu.targetQueue.forEach(target => {
        expect(target.row).toBeGreaterThanOrEqual(0);
        expect(target.row).toBeLessThan(10);
        expect(target.col).toBeGreaterThanOrEqual(0);
        expect(target.col).toBeLessThan(10);
      });
    });
  });

  describe('AI Intelligence', () => {
    test('should not target already guessed positions', () => {
      // Add some guesses
      cpu.guesses.add('54');
      cpu.guesses.add('56');
      
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '55'
      };
      
      cpu.processResult(result);
      
      // Should not include already guessed positions in target queue
      const targetPositions = cpu.targetQueue.map(t => `${t.row}${t.col}`);
      expect(targetPositions).not.toContain('54');
      expect(targetPositions).not.toContain('56');
    });

    test('should maintain target priorities', () => {
      const result = {
        valid: true,
        hit: true,
        sunk: false,
        position: '55'
      };
      
      cpu.processResult(result);
      
      // All targets should have priority values
      cpu.targetQueue.forEach(target => {
        expect(target).toHaveProperty('priority');
        expect(typeof target.priority).toBe('number');
      });
    });
  });
}); 