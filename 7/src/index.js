#!/usr/bin/env node

import { GameEngine } from './GameEngine.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const config = parseArgs(args);

  // Create and start the game
  const game = new GameEngine(config);
  
  try {
    await game.startGame();
  } catch (error) {
    console.error('Fatal error:', error.message);
    if (config.debugMode) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} - Configuration object
 */
function parseArgs(args) {
  const config = {
    boardSize: 10,
    numShips: 3,
    shipLength: 3,
    debugMode: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--debug':
      case '-d':
        config.debugMode = true;
        break;
        
      case '--board-size':
      case '-b':
        if (i + 1 < args.length) {
          const size = parseInt(args[++i]);
          if (size >= 5 && size <= 20) {
            config.boardSize = size;
          } else {
            console.warn('Board size must be between 5 and 20. Using default: 10');
          }
        }
        break;
        
      case '--num-ships':
      case '-n':
        if (i + 1 < args.length) {
          const ships = parseInt(args[++i]);
          if (ships >= 1 && ships <= 10) {
            config.numShips = ships;
          } else {
            console.warn('Number of ships must be between 1 and 10. Using default: 3');
          }
        }
        break;
        
      case '--ship-length':
      case '-l':
        if (i + 1 < args.length) {
          const length = parseInt(args[++i]);
          if (length >= 2 && length <= 5) {
            config.shipLength = length;
          } else {
            console.warn('Ship length must be between 2 and 5. Using default: 3');
          }
        }
        break;
        
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.warn(`Unknown option: ${arg}`);
        }
        break;
    }
  }

  return config;
}

/**
 * Print help information
 */
function printHelp() {
  console.log(`
Sea Battle Game - A modernized command-line Battleship game

Usage: node src/index.js [options]

Options:
  -d, --debug            Enable debug mode for detailed logging
  -b, --board-size <n>   Set board size (5-20, default: 10)
  -n, --num-ships <n>    Set number of ships per player (1-10, default: 3)
  -l, --ship-length <n>  Set length of each ship (2-5, default: 3)
  -h, --help            Show this help message

Examples:
  node src/index.js                    # Start game with default settings
  node src/index.js --debug            # Start with debug mode enabled
  node src/index.js -b 8 -n 5          # 8x8 board with 5 ships each
  node src/index.js -l 4               # Ships of length 4

Game Controls:
  Enter coordinates as two digits (e.g., 00 for top-left, 99 for bottom-right)
  
Legend:
  ~ = Water (unknown)
  S = Your ships
  X = Hit
  O = Miss
`);
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`\n\nReceived ${signal}. Shutting down gracefully...`);
      process.exit(0);
    });
  });
}

// Set up graceful shutdown
setupGracefulShutdown();

// Start the game
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 