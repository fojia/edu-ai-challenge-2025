const { Enigma } = require('./enigma.js');

console.log('=== Demonstrating Enigma Bug Fix ===\n');

// Test configuration
const message = 'HELLO WORLD';
const rotorPositions = [0, 0, 0];
const ringSettings = [0, 0, 0];
const plugboardPairs = [['A', 'B'], ['C', 'D']];

// Create two Enigma machines with identical settings
const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);

// Encrypt with first machine
const encrypted = enigma1.process(message);
console.log(`Original message: ${message}`);
console.log(`Encrypted:        ${encrypted}`);

// Decrypt with second machine (same settings)
const decrypted = enigma2.process(encrypted);
console.log(`Decrypted:        ${decrypted}`);

// Verify they match
console.log(`\nSelf-reciprocal test: ${message === decrypted ? '✅ PASSED' : '❌ FAILED'}`);

console.log('\n=== Bug Explanation ===');
console.log('The original bug was missing the final plugboard swap in encryptChar().');
console.log('Enigma machines apply plugboard transformation twice:');
console.log('1. At input (before rotors)');
console.log('2. At output (after rotors)');
console.log('Without both applications, encrypt(encrypt(message)) ≠ original message.'); 