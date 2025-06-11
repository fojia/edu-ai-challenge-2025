import { Board } from './Board.js';
import { CPUPlayer } from './CPUPlayer.js';
import { Display } from './Display.js';
import readline from 'readline';

/**
 * Main game engine that orchestrates the Sea Battle game
 */
export class GameEngine {
  constructor(config = {}) {
    this.config = {
      boardSize: config.boardSize || 10,
      numShips: config.numShips || 3,
      shipLength: config.shipLength || 3,
      debugMode: config.debugMode || false,
      ...config
    };

    this.playerBoard = new Board(this.config.boardSize);
    this.cpuBoard = new Board(this.config.boardSize);
    this.cpuPlayer = new CPUPlayer(this.config.boardSize);
    
    this.gameOver = false;
    this.currentPlayer = 'player'; // 'player' or 'cpu'
    
    // Initialize readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Start a new game
   */
  async startGame() {
    try {
      Display.printWelcome();
      await this.initializeGame();
      await this.gameLoop();
    } catch (error) {
      Display.printError(`Game error: ${error.message}`);
      if (this.config.debugMode) {
        console.error(error);
      }
    } finally {
      this.cleanup();
    }
  }

  /**
   * Initialize the game by setting up boards and placing ships
   */
  async initializeGame() {
    Display.printInfo('Setting up the game...');
    
    // Reset game state
    this.playerBoard.reset();
    this.cpuBoard.reset();
    this.cpuPlayer.reset();
    this.gameOver = false;
    this.currentPlayer = 'player';

    // Place ships randomly
    try {
      this.playerBoard.placeShipsRandomly(
        this.config.numShips, 
        this.config.shipLength, 
        true // Show ships on player's board
      );
      Display.printShipPlacement(this.config.numShips, 'Player');

      this.cpuBoard.placeShipsRandomly(
        this.config.numShips, 
        this.config.shipLength, 
        false // Hide ships on CPU's board
      );
      Display.printShipPlacement(this.config.numShips, 'CPU');

      Display.printSuccess('Game setup complete!');
      
    } catch (error) {
      throw new Error(`Failed to place ships: ${error.message}`);
    }
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (!this.gameOver) {
      try {
        Display.printBoards(this.cpuBoard, this.playerBoard);
        
        if (this.currentPlayer === 'player') {
          await this.handlePlayerTurn();
        } else {
          await this.handleCPUTurn();
        }

        this.checkGameEnd();
        
        if (!this.gameOver) {
          this.switchPlayer();
        }

      } catch (error) {
        Display.printError(`Turn error: ${error.message}`);
        if (this.config.debugMode) {
          console.error(error);
        }
      }
    }
  }

  /**
   * Handle player's turn
   */
  async handlePlayerTurn() {
    Display.printTurn('Player');
    
    let validMove = false;
    while (!validMove && !this.gameOver) {
      try {
        const input = await this.getPlayerInput('Enter your guess (e.g., 00): ');
        const move = this.parseInput(input);
        
        if (!move) {
          Display.printError('Invalid input. Please enter two digits (e.g., 00, 23, 99)');
          continue;
        }

        const result = this.cpuBoard.processGuess(move.row, move.col);
        Display.printMoveResult('Player', move, result);

        if (result.valid) {
          validMove = true;
          Display.printDebug({ playerMove: move, result }, this.config.debugMode);
        } else {
          Display.printError(result.reason);
        }

      } catch (error) {
        Display.printError(`Input error: ${error.message}`);
      }
    }
  }

  /**
   * Handle CPU's turn
   */
  async handleCPUTurn() {
    Display.printTurn('CPU');
    
    // Add a small delay for better UX
    await this.delay(1000);
    
    try {
      const move = this.cpuPlayer.makeMove();
      const result = this.playerBoard.processGuess(move.row, move.col);
      
      Display.printMoveResult('CPU', move, result);
      this.cpuPlayer.processResult(result);
      
      Display.printDebug({ 
        cpuMove: move, 
        result, 
        cpuState: this.cpuPlayer.getState() 
      }, this.config.debugMode);

    } catch (error) {
      throw new Error(`CPU move failed: ${error.message}`);
    }
  }

  /**
   * Parse user input into row and column
   * @param {string} input - User input string
   * @returns {Object|null} - Move object or null if invalid
   */
  parseInput(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();
    
    // Must be exactly 2 characters
    if (trimmed.length !== 2) {
      return null;
    }

    const row = parseInt(trimmed[0]);
    const col = parseInt(trimmed[1]);

    // Check if both are valid numbers
    if (isNaN(row) || isNaN(col)) {
      return null;
    }

    // Check if coordinates are within bounds
    if (row < 0 || row >= this.config.boardSize || 
        col < 0 || col >= this.config.boardSize) {
      return null;
    }

    return { row, col };
  }

  /**
   * Get input from player
   * @param {string} prompt - Prompt message
   * @returns {Promise<string>} - Promise resolving to user input
   */
  getPlayerInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Switch current player
   */
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'player' ? 'cpu' : 'player';
  }

  /**
   * Check if the game has ended
   */
  checkGameEnd() {
    const playerWon = this.cpuBoard.areAllShipsSunk();
    const cpuWon = this.playerBoard.areAllShipsSunk();

    if (playerWon || cpuWon) {
      this.gameOver = true;
      Display.printBoards(this.cpuBoard, this.playerBoard);
      Display.printGameOver(playerWon);
      
      if (this.config.debugMode) {
        Display.printStats(this.playerBoard, this.cpuBoard);
      }
    }
  }

  /**
   * Add delay for better user experience
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Reset the game to initial state
   */
  async resetGame() {
    await this.initializeGame();
  }

  /**
   * Get current game state (for testing)
   * @returns {Object} - Current game state
   */
  getGameState() {
    return {
      gameOver: this.gameOver,
      currentPlayer: this.currentPlayer,
      playerShipsRemaining: this.playerBoard.getRemainingShipsCount(),
      cpuShipsRemaining: this.cpuBoard.getRemainingShipsCount(),
      playerGuesses: this.playerBoard.guesses.size,
      cpuGuesses: this.cpuBoard.guesses.size,
      cpuAIState: this.cpuPlayer.getState()
    };
  }

  /**
   * Make a move programmatically (for testing)
   * @param {string} player - 'player' or 'cpu'
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {Object} - Move result
   */
  makeMove(player, row, col) {
    if (player === 'player') {
      return this.cpuBoard.processGuess(row, col);
    } else if (player === 'cpu') {
      // Add the move to CPU's guess tracking
      const position = `${row}${col}`;
      this.cpuPlayer.guesses.add(position);
      
      const result = this.playerBoard.processGuess(row, col);
      this.cpuPlayer.processResult(result);
      return result;
    } else {
      throw new Error('Invalid player specified');
    }
  }

  /**
   * Set debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled;
  }
} 