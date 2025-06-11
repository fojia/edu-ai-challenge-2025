/**
 * CPU AI player for Sea Battle game
 * Implements hunt and target modes for intelligent gameplay
 */
export class CPUPlayer {
  constructor(boardSize = 10) {
    this.boardSize = boardSize;
    this.mode = 'hunt'; // 'hunt' or 'target'
    this.targetQueue = [];
    this.guesses = new Set();
    this.lastHit = null;
    this.hitSequence = []; // Track consecutive hits for smarter targeting
  }

  /**
   * Reset the CPU player state
   */
  reset() {
    this.mode = 'hunt';
    this.targetQueue = [];
    this.guesses.clear();
    this.lastHit = null;
    this.hitSequence = [];
  }

  /**
   * Make the next move
   * @returns {Object} - Object with row and col properties
   */
  makeMove() {
    let move;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      move = this.#makeTargetedMove();
    } else {
      move = this.#makeHuntMove();
      this.mode = 'hunt';
    }

    const position = `${move.row}${move.col}`;
    this.guesses.add(position);
    
    return move;
  }

  /**
   * Process the result of the last move to update AI state
   * @param {Object} result - Result from Board.processGuess()
   */
  processResult(result) {
    if (!result.valid) {
      return;
    }

    const { row, col } = this.#parsePosition(result.position);

    if (result.hit) {
      this.lastHit = { row, col };
      this.hitSequence.push({ row, col });

      if (result.sunk) {
        // Ship is sunk, return to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
        this.hitSequence = [];
      } else {
        // Ship hit but not sunk, switch to target mode
        this.mode = 'target';
        this.#addAdjacentTargets(row, col);
      }
    } else {
      // Miss - remove from target queue if in target mode
      if (this.mode === 'target') {
        this.#removeFromTargetQueue(row, col);
        
        // If no more targets and we have hits, try to find the ship's orientation
        if (this.targetQueue.length === 0 && this.hitSequence.length > 1) {
          this.#addDirectionalTargets();
        }
        
        // If still no targets, go back to hunt mode
        if (this.targetQueue.length === 0) {
          this.mode = 'hunt';
          this.hitSequence = [];
        }
      }
    }
  }

  /**
   * Make a targeted move (when ship is hit but not sunk)
   * @returns {Object} - Move object with row and col
   * @private
   */
  #makeTargetedMove() {
    // Try targets in priority order
    while (this.targetQueue.length > 0) {
      const target = this.targetQueue.shift();
      const position = `${target.row}${target.col}`;
      
      if (!this.guesses.has(position) && this.#isValidPosition(target.row, target.col)) {
        return target;
      }
    }

    // Fallback to hunt mode if no valid targets
    return this.#makeHuntMove();
  }

  /**
   * Make a hunting move (random with strategy)
   * @returns {Object} - Move object with row and col
   * @private
   */
  #makeHuntMove() {
    // Use checkerboard pattern for more efficient hunting
    const availableMoves = this.#getCheckerboardMoves();
    
    if (availableMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }

    // Fallback to any available move
    return this.#getRandomAvailableMove();
  }

  /**
   * Get moves in a checkerboard pattern (more efficient for ship hunting)
   * @returns {Object[]} - Array of move objects
   * @private
   */
  #getCheckerboardMoves() {
    const moves = [];
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const position = `${row}${col}`;
        
        // Checkerboard pattern: (row + col) % 2 === 0
        if ((row + col) % 2 === 0 && !this.guesses.has(position)) {
          moves.push({ row, col });
        }
      }
    }
    
    return moves;
  }

  /**
   * Get any random available move
   * @returns {Object} - Move object with row and col
   * @private
   */
  #getRandomAvailableMove() {
    const availableMoves = [];
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const position = `${row}${col}`;
        if (!this.guesses.has(position)) {
          availableMoves.push({ row, col });
        }
      }
    }

    if (availableMoves.length === 0) {
      throw new Error('No available moves left');
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  /**
   * Add adjacent positions to target queue
   * @param {number} row - Row of the hit
   * @param {number} col - Column of the hit
   * @private
   */
  #addAdjacentTargets(row, col) {
    const adjacent = [
      { row: row - 1, col, priority: 1 },
      { row: row + 1, col, priority: 1 },
      { row, col: col - 1, priority: 1 },
      { row, col: col + 1, priority: 1 }
    ];

    for (const target of adjacent) {
      const position = `${target.row}${target.col}`;
      
      if (this.#isValidPosition(target.row, target.col) && 
          !this.guesses.has(position) &&
          !this.targetQueue.some(t => t.row === target.row && t.col === target.col)) {
        this.targetQueue.push(target);
      }
    }

    // Sort by priority (can be enhanced with more sophisticated logic)
    this.targetQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Add directional targets based on hit sequence
   * @private
   */
  #addDirectionalTargets() {
    if (this.hitSequence.length < 2) {
      return;
    }

    // Determine if hits are in a line (horizontal or vertical)
    const sortedHits = [...this.hitSequence].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    const isHorizontal = sortedHits.every(hit => hit.row === sortedHits[0].row);
    const isVertical = sortedHits.every(hit => hit.col === sortedHits[0].col);

    if (isHorizontal) {
      // Add targets at the ends of the horizontal line
      const minCol = Math.min(...sortedHits.map(h => h.col));
      const maxCol = Math.max(...sortedHits.map(h => h.col));
      const row = sortedHits[0].row;
      
      this.#addTargetIfValid(row, minCol - 1, 2);
      this.#addTargetIfValid(row, maxCol + 1, 2);
    } else if (isVertical) {
      // Add targets at the ends of the vertical line
      const minRow = Math.min(...sortedHits.map(h => h.row));
      const maxRow = Math.max(...sortedHits.map(h => h.row));
      const col = sortedHits[0].col;
      
      this.#addTargetIfValid(minRow - 1, col, 2);
      this.#addTargetIfValid(maxRow + 1, col, 2);
    }
  }

  /**
   * Add a target to the queue if valid
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @param {number} priority - Priority level
   * @private
   */
  #addTargetIfValid(row, col, priority = 1) {
    const position = `${row}${col}`;
    
    if (this.#isValidPosition(row, col) && 
        !this.guesses.has(position) &&
        !this.targetQueue.some(t => t.row === row && t.col === col)) {
      this.targetQueue.push({ row, col, priority });
    }
  }

  /**
   * Remove a position from the target queue
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @private
   */
  #removeFromTargetQueue(row, col) {
    this.targetQueue = this.targetQueue.filter(
      target => target.row !== row || target.col !== col
    );
  }

  /**
   * Check if position is valid
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} - True if position is valid
   * @private
   */
  #isValidPosition(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  /**
   * Parse position string into row and col
   * @param {string} position - Position string (e.g., '23')
   * @returns {Object} - Object with row and col properties
   * @private
   */
  #parsePosition(position) {
    return {
      row: parseInt(position[0]),
      col: parseInt(position[1])
    };
  }

  /**
   * Get current AI state (for debugging/testing)
   * @returns {Object} - Current state object
   */
  getState() {
    return {
      mode: this.mode,
      targetQueueLength: this.targetQueue.length,
      guessesCount: this.guesses.size,
      hitSequenceLength: this.hitSequence.length
    };
  }
} 