# Sea Battle CLI Game

A modernized command-line interface (CLI) implementation of the classic Sea Battle (Battleship) game, built with modern JavaScript (ES6+) and comprehensive testing.

## 🎮 Gameplay

You play against an intelligent CPU opponent. Both players place their ships on a 10x10 grid. Players take turns guessing coordinates to hit the opponent's ships. The first player to sink all of the opponent's ships wins.

### Legend
- `~` represents water (unknown)
- `S` represents your ships on your board
- `X` represents a hit (on either board)
- `O` represents a miss (on either board)

## 🚀 How to Run

### Prerequisites
Ensure you have Node.js installed. You can download it from https://nodejs.org/.

### Installation
```bash
# Install dependencies
npm install
```

### Running the Game
```bash
# Default game (10x10 board, 3 ships of length 3)
npm start

# Custom configuration
npm start -- --board-size 8 --num-ships 5 --ship-length 4

# Debug mode with detailed logging
npm start -- --debug

# Show help and options
npm start -- --help
```

### Command Line Options
- `-d, --debug`: Enable debug mode for detailed logging
- `-b, --board-size <n>`: Set board size (5-20, default: 10)
- `-n, --num-ships <n>`: Set number of ships per player (1-10, default: 3)
- `-l, --ship-length <n>`: Set length of each ship (2-5, default: 3)
- `-h, --help`: Show help message

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🏗️ Architecture

The game has been modernized with clean architecture and separation of concerns:

- **Ship.js**: Ship entity with placement and hit tracking
- **Board.js**: Game board management and ship coordination
- **CPUPlayer.js**: AI opponent with intelligent targeting
- **GameEngine.js**: Main game orchestration and flow control
- **Display.js**: UI formatting and output management
- **index.js**: Entry point with CLI argument parsing

## ✨ Features

- **Modern JavaScript**: ES6+ classes, modules, async/await
- **Intelligent AI**: Enhanced CPU opponent with hunt and target modes
- **Comprehensive Testing**: 118 unit tests with 74.87% coverage
- **Configurable**: Flexible game parameters via command line
- **Error Handling**: Robust input validation and error management
- **Clean Code**: Well-documented, maintainable codebase

## 🎯 Game Controls

Enter coordinates as two digits (e.g., 00 for top-left corner, 99 for bottom-right).

Enjoy the game!