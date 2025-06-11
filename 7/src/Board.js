import { Ship } from './Ship.js';

/**
 * Represents a game board in Sea Battle
 */
export class Board {
  constructor(size = 10) {
    this.size = size;
    this.grid = this.#createGrid();
    this.ships = [];
    this.guesses = new Set();
    this.hits = new Set();
    this.misses = new Set();
  }

  /**
   * Create an empty grid
   * @returns {string[][]} - 2D array filled with water symbols
   * @private
   */
  #createGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill('~')
    );
  }

  /**
   * Reset the board to initial state
   */
  reset() {
    this.grid = this.#createGrid();
    this.ships = [];
    this.guesses.clear();
    this.hits.clear();
    this.misses.clear();
  }

  /**
   * Check if coordinates are valid
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} - True if coordinates are within bounds
   */
  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * Check if a ship can be placed at the given position
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} length - Ship length
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @returns {boolean} - True if placement is valid
   */
  canPlaceShip(startRow, startCol, length, orientation) {
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (!this.isValidPosition(row, col) || this.grid[row][col] !== '~') {
        return false;
      }
    }
    return true;
  }

  /**
   * Place a ship on the board
   * @param {Ship} ship - Ship to place
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @param {boolean} showOnGrid - Whether to show ship on grid (for player's own board)
   * @returns {boolean} - True if placement was successful
   */
  placeShip(ship, startRow, startCol, orientation, showOnGrid = false) {
    if (!this.canPlaceShip(startRow, startCol, ship.length, orientation)) {
      return false;
    }

    ship.place(startRow, startCol, orientation);
    this.ships.push(ship);

    if (showOnGrid) {
      for (let i = 0; i < ship.length; i++) {
        const row = orientation === 'horizontal' ? startRow : startRow + i;
        const col = orientation === 'horizontal' ? startCol + i : startCol;
        this.grid[row][col] = 'S';
      }
    }

    return true;
  }

  /**
   * Place ships randomly on the board
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @param {boolean} showOnGrid - Whether to show ships on grid
   * @returns {Ship[]} - Array of placed ships
   */
  placeShipsRandomly(numShips, shipLength = 3, showOnGrid = false) {
    const placedShips = [];
    
    for (let i = 0; i < numShips; i++) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const ship = new Ship(shipLength);
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        
        const maxRow = orientation === 'horizontal' ? this.size : this.size - shipLength;
        const maxCol = orientation === 'horizontal' ? this.size - shipLength : this.size;
        
        const startRow = Math.floor(Math.random() * maxRow);
        const startCol = Math.floor(Math.random() * maxCol);

        if (this.placeShip(ship, startRow, startCol, orientation, showOnGrid)) {
          placedShips.push(ship);
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        throw new Error(`Could not place ship ${i + 1} after ${maxAttempts} attempts`);
      }
    }

    return placedShips;
  }

  /**
   * Process a guess at the given coordinates
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {Object} - Result object with hit status and additional info
   */
  processGuess(row, col) {
    const position = `${row}${col}`;
    
    if (!this.isValidPosition(row, col)) {
      return { valid: false, reason: 'Invalid coordinates' };
    }

    if (this.guesses.has(position)) {
      return { valid: false, reason: 'Already guessed this position' };
    }

    this.guesses.add(position);
    let hitShip = null;
    let hit = false;

    // Check if any ship is hit
    for (const ship of this.ships) {
      if (ship.hasPosition(position)) {
        ship.hit(position);
        hit = true;
        hitShip = ship;
        this.hits.add(position);
        this.grid[row][col] = 'X';
        break;
      }
    }

    if (!hit) {
      this.misses.add(position);
      this.grid[row][col] = 'O';
    }

    return {
      valid: true,
      hit,
      sunk: hitShip?.isSunk() || false,
      position,
      ship: hitShip
    };
  }

  /**
   * Get the current state of a grid cell for display
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @param {boolean} hideShips - Whether to hide ships (for opponent view)
   * @returns {string} - Cell display character
   */
  getCellDisplay(row, col, hideShips = false) {
    if (!this.isValidPosition(row, col)) {
      return '~';
    }

    const position = `${row}${col}`;
    
    if (this.hits.has(position)) {
      return 'X';
    }
    
    if (this.misses.has(position)) {
      return 'O';
    }

    if (!hideShips && this.grid[row][col] === 'S') {
      return 'S';
    }

    return '~';
  }

  /**
   * Check if all ships are sunk
   * @returns {boolean} - True if all ships are sunk
   */
  areAllShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  /**
   * Get number of remaining ships
   * @returns {number} - Number of unsunk ships
   */
  getRemainingShipsCount() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Get all ship positions (for testing)
   * @returns {string[]} - Array of all ship positions
   */
  getAllShipPositions() {
    return this.ships.flatMap(ship => ship.getPositions());
  }
} 