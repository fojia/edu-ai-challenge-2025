
# BUG EXPLANATION:
The original code was missing the final plugboard swap after the backward
pass through the rotors. The Enigma machine applies the plugboard
transformation twice: once at input and once at output. This is critical
for the machine's self-reciprocal property - encrypting and decrypting
use the exact same process with the same settings.
Without the final plugboard swap, encrypt(encrypt(message)) would not
equal the original message, breaking the fundamental Enigma property.


# Run Test
    node enigma.js --test
