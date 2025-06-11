import { describe, test, expect, beforeEach } from '@jest/globals';
import { Board } from '../src/Board.js';
import { Ship } from '../src/Ship.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board(10);
  });

  describe('Constructor', () => {
    test('should create board with default size 10', () => {
      const defaultBoard = new Board();
      expect(defaultBoard.size).toBe(10);
    });

    test('should create board with specified size', () => {
      const customBoard = new Board(8);
      expect(customBoard.size).toBe(8);
    });

    test('should initialize with empty grid and collections', () => {
      expect(board.grid).toHaveLength(10);
      expect(board.grid[0]).toHaveLength(10);
      expect(board.ships).toEqual([]);
      expect(board.guesses.size).toBe(0);
      expect(board.hits.size).toBe(0);
      expect(board.misses.size).toBe(0);
    });

    test('should fill grid with water symbols', () => {
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          expect(board.grid[row][col]).toBe('~');
        }
      }
    });
  });

  describe('isValidPosition()', () => {
    test('should return true for valid positions', () => {
      expect(board.isValidPosition(0, 0)).toBe(true);
      expect(board.isValidPosition(5, 5)).toBe(true);
      expect(board.isValidPosition(9, 9)).toBe(true);
    });

    test('should return false for invalid positions', () => {
      expect(board.isValidPosition(-1, 0)).toBe(false);
      expect(board.isValidPosition(0, -1)).toBe(false);
      expect(board.isValidPosition(10, 0)).toBe(false);
      expect(board.isValidPosition(0, 10)).toBe(false);
      expect(board.isValidPosition(10, 10)).toBe(false);
    });
  });

  describe('canPlaceShip()', () => {
    test('should allow placement in empty area', () => {
      expect(board.canPlaceShip(0, 0, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(true);
    });

    test('should prevent placement outside boundaries', () => {
      expect(board.canPlaceShip(0, 8, 3, 'horizontal')).toBe(false);
      expect(board.canPlaceShip(8, 0, 3, 'vertical')).toBe(false);
    });

    test('should prevent placement over existing ships', () => {
      const ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', true);
      
      expect(board.canPlaceShip(0, 1, 3, 'horizontal')).toBe(false);
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(false);
    });

    test('should allow placement in non-overlapping areas', () => {
      const ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', true);
      
      expect(board.canPlaceShip(2, 0, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(0, 4, 3, 'horizontal')).toBe(true);
    });
  });

  describe('placeShip()', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(3);
    });

    test('should place ship successfully', () => {
      const result = board.placeShip(ship, 0, 0, 'horizontal', true);
      
      expect(result).toBe(true);
      expect(board.ships).toContain(ship);
      expect(ship.locations).toEqual(['00', '01', '02']);
    });

    test('should show ship on grid when showOnGrid is true', () => {
      board.placeShip(ship, 1, 1, 'horizontal', true);
      
      expect(board.grid[1][1]).toBe('S');
      expect(board.grid[1][2]).toBe('S');
      expect(board.grid[1][3]).toBe('S');
    });

    test('should not show ship on grid when showOnGrid is false', () => {
      board.placeShip(ship, 1, 1, 'horizontal', false);
      
      expect(board.grid[1][1]).toBe('~');
      expect(board.grid[1][2]).toBe('~');
      expect(board.grid[1][3]).toBe('~');
    });

    test('should fail for invalid placement', () => {
      const result = board.placeShip(ship, 8, 8, 'horizontal', true);
      
      expect(result).toBe(false);
      expect(board.ships).not.toContain(ship);
    });

    test('should place ship vertically', () => {
      const result = board.placeShip(ship, 2, 2, 'vertical', true);
      
      expect(result).toBe(true);
      expect(board.grid[2][2]).toBe('S');
      expect(board.grid[3][2]).toBe('S');
      expect(board.grid[4][2]).toBe('S');
    });
  });

  describe('placeShipsRandomly()', () => {
    test('should place specified number of ships', () => {
      const ships = board.placeShipsRandomly(3, 3, false);
      
      expect(ships).toHaveLength(3);
      expect(board.ships).toHaveLength(3);
    });

    test('should place ships with correct length', () => {
      const ships = board.placeShipsRandomly(2, 4, false);
      
      ships.forEach(ship => {
        expect(ship.length).toBe(4);
        expect(ship.locations).toHaveLength(4);
      });
    });

    test('should show ships on grid when requested', () => {
      board.placeShipsRandomly(1, 3, true);
      
      let shipCells = 0;
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (board.grid[row][col] === 'S') {
            shipCells++;
          }
        }
      }
      expect(shipCells).toBe(3);
    });

    test('should throw error if unable to place ships', () => {
      // Try to place too many ships on a small board
      const smallBoard = new Board(2); // Even smaller board
      
      expect(() => {
        smallBoard.placeShipsRandomly(5, 3, false); // 5 ships of length 3 on 2x2 board
      }).toThrow();
    });
  });

  describe('processGuess()', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', false);
    });

    test('should return invalid for out of bounds guess', () => {
      const result = board.processGuess(-1, 0);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid coordinates');
    });

    test('should return invalid for duplicate guess', () => {
      board.processGuess(0, 0);
      const result = board.processGuess(0, 0);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Already guessed this position');
    });

    test('should process hit correctly', () => {
      const result = board.processGuess(0, 1);
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.position).toBe('01');
      expect(board.hits.has('01')).toBe(true);
      expect(board.grid[0][1]).toBe('X');
    });

    test('should process miss correctly', () => {
      const result = board.processGuess(5, 5);
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.position).toBe('55');
      expect(board.misses.has('55')).toBe(true);
      expect(board.grid[5][5]).toBe('O');
    });

    test('should detect ship sinking', () => {
      board.processGuess(0, 0); // Hit
      board.processGuess(0, 1); // Hit
      const result = board.processGuess(0, 2); // Final hit
      
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(ship.isSunk()).toBe(true);
    });

    test('should track guesses', () => {
      board.processGuess(0, 0);
      board.processGuess(5, 5);
      
      expect(board.guesses.size).toBe(2);
      expect(board.guesses.has('00')).toBe(true);
      expect(board.guesses.has('55')).toBe(true);
    });
  });

  describe('getCellDisplay()', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', true);
    });

    test('should return water symbol for empty cells', () => {
      expect(board.getCellDisplay(5, 5)).toBe('~');
    });

    test('should return ship symbol when not hiding ships', () => {
      expect(board.getCellDisplay(0, 0, false)).toBe('S');
    });

    test('should return water symbol when hiding ships', () => {
      expect(board.getCellDisplay(0, 0, true)).toBe('~');
    });

    test('should return hit symbol for hit positions', () => {
      board.processGuess(0, 0);
      expect(board.getCellDisplay(0, 0, true)).toBe('X');
      expect(board.getCellDisplay(0, 0, false)).toBe('X');
    });

    test('should return miss symbol for miss positions', () => {
      board.processGuess(5, 5);
      expect(board.getCellDisplay(5, 5, true)).toBe('O');
      expect(board.getCellDisplay(5, 5, false)).toBe('O');
    });

    test('should return water for invalid positions', () => {
      expect(board.getCellDisplay(-1, 0)).toBe('~');
      expect(board.getCellDisplay(10, 10)).toBe('~');
    });
  });

  describe('areAllShipsSunk()', () => {
    test('should return true when no ships', () => {
      expect(board.areAllShipsSunk()).toBe(true);
    });

    test('should return false when ships are not sunk', () => {
      const ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', false);
      
      expect(board.areAllShipsSunk()).toBe(false);
    });

    test('should return false when some ships are sunk', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(2);
      board.placeShip(ship1, 0, 0, 'horizontal', false);
      board.placeShip(ship2, 2, 0, 'horizontal', false);
      
      // Sink first ship
      board.processGuess(0, 0);
      board.processGuess(0, 1);
      
      expect(board.areAllShipsSunk()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(2);
      board.placeShip(ship1, 0, 0, 'horizontal', false);
      board.placeShip(ship2, 2, 0, 'horizontal', false);
      
      // Sink both ships
      board.processGuess(0, 0);
      board.processGuess(0, 1);
      board.processGuess(2, 0);
      board.processGuess(2, 1);
      
      expect(board.areAllShipsSunk()).toBe(true);
    });
  });

  describe('getRemainingShipsCount()', () => {
    test('should return 0 when no ships', () => {
      expect(board.getRemainingShipsCount()).toBe(0);
    });

    test('should return correct count of unsunk ships', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(2);
      const ship3 = new Ship(2);
      board.placeShip(ship1, 0, 0, 'horizontal', false);
      board.placeShip(ship2, 2, 0, 'horizontal', false);
      board.placeShip(ship3, 4, 0, 'horizontal', false);
      
      expect(board.getRemainingShipsCount()).toBe(3);
      
      // Sink one ship
      board.processGuess(0, 0);
      board.processGuess(0, 1);
      
      expect(board.getRemainingShipsCount()).toBe(2);
    });
  });

  describe('reset()', () => {
    test('should reset board to initial state', () => {
      const ship = new Ship(3);
      board.placeShip(ship, 0, 0, 'horizontal', true);
      board.processGuess(0, 0);
      board.processGuess(5, 5);
      
      board.reset();
      
      expect(board.ships).toEqual([]);
      expect(board.guesses.size).toBe(0);
      expect(board.hits.size).toBe(0);
      expect(board.misses.size).toBe(0);
      
      // Check grid is reset
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          expect(board.grid[row][col]).toBe('~');
        }
      }
    });
  });

  describe('getAllShipPositions()', () => {
    test('should return all ship positions', () => {
      const ship1 = new Ship(2);
      const ship2 = new Ship(3);
      board.placeShip(ship1, 0, 0, 'horizontal', false);
      board.placeShip(ship2, 2, 0, 'vertical', false);
      
      const positions = board.getAllShipPositions();
      
      expect(positions).toHaveLength(5);
      expect(positions).toContain('00');
      expect(positions).toContain('01');
      expect(positions).toContain('20');
      expect(positions).toContain('30');
      expect(positions).toContain('40');
    });

    test('should return empty array when no ships', () => {
      expect(board.getAllShipPositions()).toEqual([]);
    });
  });
}); 