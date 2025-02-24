import React, { useState } from 'react';
import forge from 'node-forge';
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

export function EncryptionRSAToy({ title, subheader, ...other }) {
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [error, setError] = useState('');

  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  // Function to generate RSA keys using node-forge
  const generateKeys = () => {
    try {
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      setPublicKey(keypair.publicKey);
      setPrivateKey(keypair.privateKey);
      setError('');
    } catch (err) {
      setError('Error generating keys: ' + err.message);
    }
  };
  // Function to encrypt plaintext
  const encrypt = () => {
    if (!publicKey) {
      setError('Generate keys before encrypting.');
      return;
    }

    try {
      const encrypted = publicKey.encrypt(forge.util.encodeUtf8(plaintext), 'RSA-OAEP');
      setCiphertext(forge.util.encode64(encrypted));
      setError('');
    } catch (err) {
      setError('Error during encryption: ' + err.message);
    }
  };

  // Function to decrypt ciphertext
  const decrypt = () => {
    if (!privateKey) {
      setError('Generate keys before decrypting.');
      return;
    }

    try {
      const decrypted = privateKey.decrypt(forge.util.decode64(ciphertext), 'RSA-OAEP');
      setDecryptedText(forge.util.decodeUtf8(decrypted));
      setError('');
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
          <Button onClick={generateKeys} className="mt-4 w-full">
            Generate RSA Keys
          </Button>

          {error && <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
          {publicKey && privateKey && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p>
                <strong>Public Key:</strong>
              </p>
              <pre>{forge.pki.publicKeyToPem(publicKey)}</pre>
              <p>
                <strong>Private Key:</strong>
              </p>
              <pre>{forge.pki.privateKeyToPem(privateKey)}</pre>
            </div>
          )}

          {publicKey && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Encryption & Decryption</h3>
              <TextField
                type="text"
                placeholder="Enter plaintext (string)"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
              />
              <Button onClick={encrypt} className="mt-2 w-full">
                Encrypt
              </Button>
              {ciphertext && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                  <p>
                    <strong>Ciphertext (Base64):</strong>
                  </p>
                  <pre>{ciphertext}</pre>
                </div>
              )}
              <Button onClick={decrypt} className="mt-2 w-full">
                Decrypt
              </Button>
              {decryptedText && (
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
