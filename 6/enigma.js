const readline = require('readline');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function mod(n, m) {
  return ((n % m) + m) % m;
}

const ROTORS = [
  { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // Rotor I
  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // Rotor II
  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // Rotor III
];
const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

function plugboardSwap(c, pairs) {
  for (const [a, b] of pairs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
    this.wiring = wiring;
    this.notch = notch;
    this.ringSetting = ringSetting;
    this.position = position;
  }
  step() {
    this.position = mod(this.position + 1, 26);
  }
  atNotch() {
    return alphabet[this.position] === this.notch;
  }
  forward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    return this.wiring[idx];
  }
  backward(c) {
    const idx = this.wiring.indexOf(c);
    return alphabet[mod(idx - this.position + this.ringSetting, 26)];
  }
}

class Enigma {
  constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
    this.rotors = rotorIDs.map(
      (id, i) =>
        new Rotor(
          ROTORS[id].wiring,
          ROTORS[id].notch,
          ringSettings[i],
          rotorPositions[i],
        ),
    );
    this.plugboardPairs = plugboardPairs;
  }
  stepRotors() {
    if (this.rotors[2].atNotch()) this.rotors[1].step();
    if (this.rotors[1].atNotch()) this.rotors[0].step();
    this.rotors[2].step();
  }
  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();
    
    // BUG FIX: Apply plugboard at input
    c = plugboardSwap(c, this.plugboardPairs);
    
    // Forward pass through rotors (right to left)
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    // Reflector
    c = REFLECTOR[alphabet.indexOf(c)];

    // Backward pass through rotors (left to right)
    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    // BUG FIX: Apply plugboard at output (was missing!)
    c = plugboardSwap(c, this.plugboardPairs);

    return c;
  }
  process(text) {
    return text
      .toUpperCase()
      .split('')
      .map((c) => this.encryptChar(c))
      .join('');
  }
}

function promptEnigma() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter message: ', (message) => {
    rl.question('Rotor positions (e.g. 0 0 0): ', (posStr) => {
      const rotorPositions = posStr.split(' ').map(Number);
      rl.question('Ring settings (e.g. 0 0 0): ', (ringStr) => {
        const ringSettings = ringStr.split(' ').map(Number);
        rl.question('Plugboard pairs (e.g. AB CD): ', (plugStr) => {
          const plugPairs =
            plugStr
              .toUpperCase()
              .match(/([A-Z]{2})/g)
              ?.map((pair) => [pair[0], pair[1]]) || [];

          const enigma = new Enigma(
            [0, 1, 2],
            rotorPositions,
            ringSettings,
            plugPairs,
          );
          const result = enigma.process(message);
          console.log('Output:', result);
          rl.close();
        });
      });
    });
  });
}

// =============================================================================
// UNIT TESTS
// =============================================================================

/**
 * BUG EXPLANATION:
 * The original code was missing the final plugboard swap after the backward
 * pass through the rotors. The Enigma machine applies the plugboard 
 * transformation twice: once at input and once at output. This is critical
 * for the machine's self-reciprocal property - encrypting and decrypting
 * use the exact same process with the same settings.
 * 
 * Without the final plugboard swap, encrypt(encrypt(message)) would not
 * equal the original message, breaking the fundamental Enigma property.
 */

function runTests() {
  console.log('Running Enigma Unit Tests...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  function test(description, testFunction) {
    testsTotal++;
    try {
      testFunction();
      console.log(`✅ ${description}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected "${expected}", got "${actual}". ${message}`);
    }
  }
  
  // Test 1: Basic self-reciprocal property (no plugboard)
  test('Self-reciprocal property without plugboard', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    
    const message = 'HELLO';
    const encrypted = enigma1.process(message);
    const decrypted = enigma2.process(encrypted);
    
    assertEqual(decrypted, message, 'Encrypt then decrypt should return original');
  });
  
  // Test 2: Self-reciprocal property with plugboard
  test('Self-reciprocal property with plugboard', () => {
    const plugboard = [['A', 'B'], ['C', 'D']];
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
    
    const message = 'HELLOWORLD';
    const encrypted = enigma1.process(message);
    const decrypted = enigma2.process(encrypted);
    
    assertEqual(decrypted, message, 'Plugboard should work symmetrically');
  });
  
  // Test 3: Plugboard swapping
  test('Plugboard swapping works correctly', () => {
    const plugboard = [['H', 'X'], ['E', 'Y']];
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
    
    // First character 'H' should be swapped to 'X' by plugboard
    // We can't predict the exact output, but we can verify the swap happens
    const result = enigma.process('H');
    // The result should NOT be the same as without plugboard
    const enigmaNoPlug = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const resultNoPlug = enigmaNoPlug.process('H');
    
    if (result === resultNoPlug) {
      throw new Error('Plugboard should change the result');
    }
  });
  
  // Test 4: Non-alphabetic characters pass through
  test('Non-alphabetic characters pass through unchanged', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const result = enigma.process('HELLO 123 WORLD!');
    
    // Should contain the spaces, numbers, and punctuation
    if (!result.includes(' ') || !result.includes('123') || !result.includes('!')) {
      throw new Error('Non-alphabetic characters should pass through');
    }
  });
  
  // Test 5: Rotor stepping
  test('Rotor stepping works correctly', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    
    // Check initial positions
    assertEqual(enigma.rotors[2].position, 0, 'Right rotor should start at 0');
    
    // Process one character to trigger stepping
    enigma.process('A');
    assertEqual(enigma.rotors[2].position, 1, 'Right rotor should step to 1');
  });
  
  // Test 6: Different initial positions
  test('Different initial positions produce different results', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 1], [0, 0, 0], []);
    
    const result1 = enigma1.process('A');
    const result2 = enigma2.process('A');
    
    if (result1 === result2) {
      throw new Error('Different rotor positions should produce different results');
    }
  });
  
  // Test 7: Ring settings affect output
  test('Ring settings affect encryption output', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 1], []);
    
    const result1 = enigma1.process('A');
    const result2 = enigma2.process('A');
    
    if (result1 === result2) {
      throw new Error('Different ring settings should produce different results');
    }
  });
  
  console.log(`\nTest Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! The Enigma machine is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Enigma, plugboardSwap, runTests };
}

if (require.main === module) {
  // Check if running tests
  if (process.argv.includes('--test')) {
    runTests();
  } else {
    promptEnigma();
  }
}
