/**
 * Handles display and formatting for the Sea Battle game
 */
export class Display {
  /**
   * Print the game boards side by side
   * @param {Board} opponentBoard - The opponent's board (hidden ships)
   * @param {Board} playerBoard - The player's board (showing ships)
   */
  static printBoards(opponentBoard, playerBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Print column headers
    const header = '  ' + Array.from({ length: opponentBoard.size }, (_, i) => i).join(' ');
    console.log(header + '     ' + header);

    // Print rows
    for (let row = 0; row < opponentBoard.size; row++) {
      let rowStr = row + ' ';

      // Opponent board (hide ships)
      for (let col = 0; col < opponentBoard.size; col++) {
        rowStr += opponentBoard.getCellDisplay(row, col, true) + ' ';
      }

      rowStr += '    ' + row + ' ';

      // Player board (show ships)
      for (let col = 0; col < playerBoard.size; col++) {
        rowStr += playerBoard.getCellDisplay(row, col, false) + ' ';
      }

      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Print a single board
   * @param {Board} board - The board to display
   * @param {string} title - Title for the board
   * @param {boolean} hideShips - Whether to hide ships
   */
  static printBoard(board, title = 'BOARD', hideShips = false) {
    console.log(`\n   --- ${title} ---`);
    
    // Print column headers
    const header = '  ' + Array.from({ length: board.size }, (_, i) => i).join(' ');
    console.log(header);

    // Print rows
    for (let row = 0; row < board.size; row++) {
      let rowStr = row + ' ';
      for (let col = 0; col < board.size; col++) {
        rowStr += board.getCellDisplay(row, col, hideShips) + ' ';
      }
      console.log(rowStr);
    }
    console.log('');
  }

  /**
   * Print game statistics
   * @param {Board} playerBoard - Player's board
   * @param {Board} opponentBoard - Opponent's board
   */
  static printStats(playerBoard, opponentBoard) {
    const playerShips = playerBoard.getRemainingShipsCount();
    const opponentShips = opponentBoard.getRemainingShipsCount();
    
    console.log('='.repeat(50));
    console.log(`Your remaining ships: ${playerShips}`);
    console.log(`Opponent remaining ships: ${opponentShips}`);
    console.log(`Your guesses: ${playerBoard.guesses.size}`);
    console.log(`Opponent guesses: ${opponentBoard.guesses.size}`);
    console.log('='.repeat(50));
  }

  /**
   * Print welcome message
   */
  static printWelcome() {
    console.log('\n' + '='.repeat(50));
    console.log('🚢  Welcome to Sea Battle! 🚢');
    console.log('='.repeat(50));
    console.log('Try to sink all enemy ships before they sink yours!');
    console.log('\nLegend:');
    console.log('~ = Water (unknown)');
    console.log('S = Your ships');
    console.log('X = Hit');
    console.log('O = Miss');
    console.log('\nEnter coordinates as two digits (e.g., 00, 23, 99)');
    console.log('='.repeat(50));
  }

  /**
   * Print game over message
   * @param {boolean} playerWon - Whether the player won
   */
  static printGameOver(playerWon) {
    console.log('\n' + '='.repeat(50));
    if (playerWon) {
      console.log('🎉 CONGRATULATIONS! You sunk all enemy ships! 🎉');
      console.log('Victory is yours, Admiral!');
    } else {
      console.log('💀 GAME OVER! The enemy sunk all your ships! 💀');
      console.log('Better luck next time, sailor!');
    }
    console.log('='.repeat(50) + '\n');
  }

  /**
   * Print ship placement message
   * @param {number} numShips - Number of ships placed
   * @param {string} player - Player name ('Player' or 'CPU')
   */
  static printShipPlacement(numShips, player) {
    console.log(`✅ ${numShips} ships placed for ${player}`);
  }

  /**
   * Print move result
   * @param {string} player - Player making the move
   * @param {Object} move - Move object with row and col
   * @param {Object} result - Result object from processGuess
   */
  static printMoveResult(player, move, result) {
    const position = `${move.row}${move.col}`;
    
    if (!result.valid) {
      console.log(`❌ Invalid move by ${player}: ${result.reason}`);
      return;
    }

    if (result.hit) {
      if (result.sunk) {
        console.log(`💥 ${player} HIT and SUNK a ship at ${position}! 🚢`);
      } else {
        console.log(`🎯 ${player} HIT at ${position}!`);
      }
    } else {
      console.log(`🌊 ${player} MISS at ${position}`);
    }
  }

  /**
   * Print turn indicator
   * @param {string} player - Current player
   */
  static printTurn(player) {
    console.log(`\n--- ${player}'s Turn ---`);
  }

  /**
   * Print input prompt
   * @param {string} prompt - The prompt message
   */
  static printPrompt(prompt) {
    process.stdout.write(prompt);
  }

  /**
   * Print error message
   * @param {string} message - Error message
   */
  static printError(message) {
    console.log(`❌ ${message}`);
  }

  /**
   * Print info message
   * @param {string} message - Info message
   */
  static printInfo(message) {
    console.log(`ℹ️  ${message}`);
  }

  /**
   * Print success message
   * @param {string} message - Success message
   */
  static printSuccess(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Clear the console (if supported)
   */
  static clearScreen() {
    if (process.stdout.isTTY) {
      console.clear();
    }
  }

  /**
   * Print a separator line
   * @param {string} char - Character to use for separator
   * @param {number} length - Length of separator
   */
  static printSeparator(char = '-', length = 50) {
    console.log(char.repeat(length));
  }

  /**
   * Print debug information (only in debug mode)
   * @param {any} data - Data to debug
   * @param {boolean} debugMode - Whether debug mode is enabled
   */
  static printDebug(data, debugMode = false) {
    if (debugMode) {
      console.log('🐛 DEBUG:', JSON.stringify(data, null, 2));
    }
  }
} 