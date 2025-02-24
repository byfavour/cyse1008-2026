import React, { useState } from 'react';
import forge from 'node-forge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// ----------------------------------------------------------------------

export function EncryptionSimplifiedRSA({ title, subheader, ...other }) {
  const [p, setP] = useState(11); // Small prime
  const [q, setQ] = useState(13); // Small prime
  const [n, setN] = useState(null); // n = p * q
  const [phiN, setPhiN] = useState(null); // phi(n) = (p-1)*(q-1)
  const [e, setE] = useState(7); // Public exponent (co-prime with phiN)
  const [d, setD] = useState(null); // Private exponent (modular inverse of e mod phiN)

  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  // Function to compute GCD
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  // Function to compute modular inverse using EEA
  const modInverse = (a, m) => {
    let m0 = m,
      x0 = 0,
      x1 = 1;
    while (a > 1) {
      let q = Math.floor(a / m);
      [a, m] = [m, a % m];
      [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0 ? x1 + m0 : x1;
  };

  // Generate RSA keys
  const generateKeys = () => {
    const nValue = p * q;
    const phiValue = (p - 1) * (q - 1);

    if (gcd(e, phiValue) !== 1) {
      alert('e is not co-prime with phi(n). Choose another e.');
      return;
    }

    const dValue = modInverse(e, phiValue);

    setN(nValue);
    setPhiN(phiValue);
    setD(dValue);
  };

  // Encrypt plaintext
  const encrypt = () => {
    const m = plaintext.charCodeAt(0); // Simple: take first character
    const c = Math.pow(m, e) % n;
    setCiphertext(c);
  };

  // Decrypt ciphertext
  const decrypt = () => {
    const m = Math.pow(ciphertext, d) % n;
    const decryptedChar = String.fromCharCode(m);
    setDecryptedText(decryptedChar);
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button onClick={generateKeys} color="primary" variant="contained">
            Generate RSA Keys
          </Button>
        }
        sx={{ mb: 3 }}
      />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          {n && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <Typography variant="h6">
                <strong>p:</strong> {p}
              </Typography>
              <Typography variant="h6">
                <strong>q:</strong> {q}
              </Typography>
              <Typography variant="h6">
                <strong>n (p*q):</strong> {n}
              </Typography>
              <Typography variant="h6">
                <strong>phi(n):</strong> {phiN}
              </Typography>
              <Typography variant="h6">
                <strong>e (public exponent):</strong> {e}
              </Typography>
              <Typography variant="h6">
                <strong>d (private exponent):</strong> {d}
              </Typography>
            </div>
          )}

          {n && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Encryption & Decryption</h3>
              <Input
                type="text"
                placeholder="Enter single character"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
              />
              <Button onClick={encrypt} className="mt-2 w-full">
                Encrypt
              </Button>
              {ciphertext && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                  <Typography variant="h6">
                    <strong>Ciphertext:</strong> {ciphertext}
                  </Typography>
                </div>
              )}
              <Button onClick={decrypt} className="mt-2 w-full">
                Decrypt
              </Button>
              {decryptedText && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                  <Typography variant="h6">
                    <strong>Decrypted Text:</strong> {decryptedText}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
