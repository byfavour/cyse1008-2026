import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// ----------------------------------------------------------------------

// Extended Euclidean Algorithm to compute modular inverse
function extendedGCD(a, b) {
  if (b === 0) return [a, 1, 0];
  const [gcd, x1, y1] = extendedGCD(b, a % b);
  const x = y1;
  const y = x1 - Math.floor(a / b) * y1;
  return [gcd, x, y];
}

function modularInverse(e, phi) {
  const [gcd, x] = extendedGCD(e, phi);
  if (gcd !== 1) {
    throw new Error('e and φ(N) are not coprime. Choose a different e.');
  }
  return ((x % phi) + phi) % phi; // Ensure positive inverse
}

// Convert string to BigInt
function stringToBigInt(str) {
  return BigInt('0x' + Buffer.from(str, 'utf8').toString('hex'));
}

// Convert BigInt back to string
function bigIntToString(bigInt) {
  const hex = bigInt.toString(16);
  return Buffer.from(hex, 'hex').toString('utf8');
}

export function EncryptionRSA({ title, subheader, ...other }) {
  const [p, setP] = useState(0);
  const [q, setQ] = useState(0);
  const [phi, setPhi] = useState(null);
  const [n, setN] = useState(null);
  const [e, setE] = useState(65537); // Default e
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  const [plaintext, setPlaintext] = useState(''); // Plaintext message
  const [ciphertext, setCiphertext] = useState(null); // Encrypted message
  const [decryptedText, setDecryptedText] = useState(null); // Decrypted message

  const generateKeys = () => {
    const pInt = parseInt(p);
    const qInt = parseInt(q);

    if (isNaN(pInt) || isNaN(qInt) || pInt <= 1 || qInt <= 1) {
      setError('Please enter valid prime numbers greater than 1 for p and q.');
      return;
    }

    const nVal = pInt * qInt;
    const phiVal = (pInt - 1) * (qInt - 1);

    try {
      const dVal = modularInverse(parseInt(e), phiVal);
      setPhi(phiVal);
      setN(nVal);
      setD(dVal);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to encrypt plaintext (string)
  const encrypt = () => {
    if (!n || !e) {
      setError('Generate keys before encrypting.');
      return;
    }

    try {
      const m = stringToBigInt(plaintext);
      if (m >= n) {
        setError('Plaintext is too long for the current modulus N.');
        return;
      }
      const c = modExp(m, BigInt(e), n);
      setCiphertext(c.toString());
      setError('');
    } catch (err) {
      setError('Error during encryption: ' + err.message);
    }
  };

  // Function to decrypt ciphertext
  const decrypt = () => {
    if (!ciphertext || !d) {
      setError('Encrypt a message before decrypting.');
      return;
    }
    try {
      const cBigInt = BigInt(ciphertext);
      const m = modExp(cBigInt, d, n);
      const decrypted = bigIntToString(m);
      setDecryptedText(decrypted);
    } catch (err) {
      setError('Error during decryption: ' + err.message);
    }
  };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} action={<Button />} sx={{ mb: 3 }} />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <TextField
            id="p"
            label="Enter p:"
            type="number"
            value={p}
            onChange={(e) => setP(e.target.value)}
          />
          <TextField
            id="q"
            label="Enter q:"
            type="number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <TextField
            id="e"
            label="Enter exponent:"
            type="number"
            value={e}
            onChange={(e) => setE(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={generateKeys}>
            Compute
          </Button>
          {error && <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
          {phi && n && d && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p>
                <strong>Step 1 - Modulus N:</strong> {n} (Calculated as p * q)
              </p>
              <p>
                <strong>Step 2 - Euler’s Totient φ(N):</strong> {phi} (Calculated as (p - 1) * (q -
                1))
              </p>
              <p>
                <strong>Step 3 - Public Key (e, N):</strong> ({e}, {n})
              </p>
              <p>
                <strong>Step 4 - Private Key (d, N):</strong> ({d}, {n}) (d is the modular inverse
                of e mod φ(N))
              </p>
            </div>
          )}

          {phi && n && d && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Encryption & Decryption</h3>
              <TextField
                id="plaintext"
                label="Enter plaintext:"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
              />
              <Button onClick={encrypt} className="mt-2 w-full">
                Encrypt
              </Button>
              {ciphertext !== null && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                  <p>
                    <strong>Ciphertext:</strong> {ciphertext}
                  </p>
                </div>
              )}
              <Button onClick={decrypt} className="mt-2 w-full">
                Decrypt
              </Button>
              {decryptedText !== null && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                  <p>
                    <strong>Decrypted Text:</strong> {decryptedText}
                  </p>
                </div>
              )}
            </div>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
