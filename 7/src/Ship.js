/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Set();
    this.orientation = null;
    this.startPosition = null;
  }

  /**
   * Place the ship on the board at the specified position
   * @param {number} startRow - Starting row position
   * @param {number} startCol - Starting column position
   * @param {string} orientation - 'horizontal' or 'vertical'
   */
  place(startRow, startCol, orientation) {
    this.startPosition = { row: startRow, col: startCol };
    this.orientation = orientation;
    this.locations = [];

    for (let i = 0; i < this.length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      this.locations.push(`${row}${col}`);
    }
  }

  /**
   * Record a hit on the ship
   * @param {string} position - Position string (e.g., '23')
   * @returns {boolean} - True if hit was successful, false if already hit
   */
  hit(position) {
    if (!this.locations.includes(position)) {
      return false;
    }
    
    if (this.hits.has(position)) {
      return false; // Already hit
    }
    
    this.hits.add(position);
    return true;
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} - True if all positions are hit
   */
  isSunk() {
    return this.hits.size === this.length;
  }

  /**
   * Check if a position is part of this ship
   * @param {string} position - Position string (e.g., '23')
   * @returns {boolean} - True if position is part of ship
   */
  hasPosition(position) {
    return this.locations.includes(position);
  }

  /**
   * Get all positions occupied by this ship
   * @returns {string[]} - Array of position strings
   */
  getPositions() {
    return [...this.locations];
  }

  /**
   * Get all hit positions on this ship
   * @returns {string[]} - Array of hit position strings
   */
  getHitPositions() {
    return Array.from(this.hits);
  }

  /**
   * Reset the ship (clear hits and placement)
   */
  reset() {
    this.hits.clear();
    this.locations = [];
    this.orientation = null;
    this.startPosition = null;
  }
} 