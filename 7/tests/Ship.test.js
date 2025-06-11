import { describe, test, expect, beforeEach } from '@jest/globals';
import { Ship } from '../src/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('Constructor', () => {
    test('should create ship with default length of 3', () => {
      const defaultShip = new Ship();
      expect(defaultShip.length).toBe(3);
    });

    test('should create ship with specified length', () => {
      const customShip = new Ship(5);
      expect(customShip.length).toBe(5);
    });

    test('should initialize with empty locations and hits', () => {
      expect(ship.locations).toEqual([]);
      expect(ship.hits.size).toBe(0);
      expect(ship.orientation).toBeNull();
      expect(ship.startPosition).toBeNull();
    });
  });

  describe('place()', () => {
    test('should place ship horizontally', () => {
      ship.place(2, 3, 'horizontal');
      
      expect(ship.startPosition).toEqual({ row: 2, col: 3 });
      expect(ship.orientation).toBe('horizontal');
      expect(ship.locations).toEqual(['23', '24', '25']);
    });

    test('should place ship vertically', () => {
      ship.place(1, 4, 'vertical');
      
      expect(ship.startPosition).toEqual({ row: 1, col: 4 });
      expect(ship.orientation).toBe('vertical');
      expect(ship.locations).toEqual(['14', '24', '34']);
    });

    test('should handle single-length ship', () => {
      const singleShip = new Ship(1);
      singleShip.place(5, 6, 'horizontal');
      
      expect(singleShip.locations).toEqual(['56']);
    });
  });

  describe('hit()', () => {
    beforeEach(() => {
      ship.place(0, 0, 'horizontal'); // positions: ['00', '01', '02']
    });

    test('should record hit on valid position', () => {
      const result = ship.hit('01');
      
      expect(result).toBe(true);
      expect(ship.hits.has('01')).toBe(true);
    });

    test('should return false for position not on ship', () => {
      const result = ship.hit('99');
      
      expect(result).toBe(false);
      expect(ship.hits.has('99')).toBe(false);
    });

    test('should return false for already hit position', () => {
      ship.hit('01');
      const result = ship.hit('01');
      
      expect(result).toBe(false);
      expect(ship.hits.size).toBe(1);
    });

    test('should track multiple hits', () => {
      ship.hit('00');
      ship.hit('02');
      
      expect(ship.hits.size).toBe(2);
      expect(ship.hits.has('00')).toBe(true);
      expect(ship.hits.has('02')).toBe(true);
    });
  });

  describe('isSunk()', () => {
    beforeEach(() => {
      ship.place(0, 0, 'horizontal'); // positions: ['00', '01', '02']
    });

    test('should return false when no hits', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when partially hit', () => {
      ship.hit('00');
      ship.hit('01');
      
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all positions hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should work with single-length ship', () => {
      const singleShip = new Ship(1);
      singleShip.place(0, 0, 'horizontal');
      
      expect(singleShip.isSunk()).toBe(false);
      singleShip.hit('00');
      expect(singleShip.isSunk()).toBe(true);
    });
  });

  describe('hasPosition()', () => {
    beforeEach(() => {
      ship.place(1, 1, 'vertical'); // positions: ['11', '21', '31']
    });

    test('should return true for positions on ship', () => {
      expect(ship.hasPosition('11')).toBe(true);
      expect(ship.hasPosition('21')).toBe(true);
      expect(ship.hasPosition('31')).toBe(true);
    });

    test('should return false for positions not on ship', () => {
      expect(ship.hasPosition('00')).toBe(false);
      expect(ship.hasPosition('99')).toBe(false);
      expect(ship.hasPosition('12')).toBe(false);
    });
  });

  describe('getPositions()', () => {
    test('should return copy of positions array', () => {
      ship.place(0, 0, 'horizontal');
      const positions = ship.getPositions();
      
      expect(positions).toEqual(['00', '01', '02']);
      
      // Should return a copy, not reference
      positions.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']);
    });

    test('should return empty array for unplaced ship', () => {
      expect(ship.getPositions()).toEqual([]);
    });
  });

  describe('getHitPositions()', () => {
    beforeEach(() => {
      ship.place(0, 0, 'horizontal');
    });

    test('should return array of hit positions', () => {
      ship.hit('00');
      ship.hit('02');
      
      const hitPositions = ship.getHitPositions();
      expect(hitPositions).toHaveLength(2);
      expect(hitPositions).toContain('00');
      expect(hitPositions).toContain('02');
    });

    test('should return empty array when no hits', () => {
      expect(ship.getHitPositions()).toEqual([]);
    });
  });

  describe('reset()', () => {
    test('should reset ship to initial state', () => {
      ship.place(1, 1, 'vertical');
      ship.hit('11');
      ship.hit('21');
      
      ship.reset();
      
      expect(ship.locations).toEqual([]);
      expect(ship.hits.size).toBe(0);
      expect(ship.orientation).toBeNull();
      expect(ship.startPosition).toBeNull();
    });

    test('should allow re-placement after reset', () => {
      ship.place(0, 0, 'horizontal');
      ship.reset();
      ship.place(5, 5, 'vertical');
      
      expect(ship.locations).toEqual(['55', '65', '75']);
      expect(ship.orientation).toBe('vertical');
    });
  });
}); 