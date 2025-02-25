import React, { useState } from 'react';
import forge from 'node-forge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
// ----------------------------------------------------------------------

export function EncryptionSimplifiedRSA({ title, subheader, ...other }) {
  const [p, setP] = useState(11); // Small prime
  const [q, setQ] = useState(13); // Small prime
  const [n, setN] = useState(p * q); // n = p * q
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
        <Box>
          <Typography variant="h4">Step 1</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Start with 2 different prime numbers
          </Typography>
          <TextField
            label="Prime p"
            type="number"
            value={p}
            onChange={(e) => setP(e.target.value)}
            sx={{ mr: 2 }}
          />
          <TextField
            label="Prime q"
            type="number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Typography variant="h4">Step 2</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Calculate key values: n, d, e
          </Typography>
          <Typography variant="body2" gutterBottom>
            The next steps will calculate the two keys. Both consist of two numbers, one of which is
            equal.
            <br />
            Private key: (n, d)
            <br />
            Public key: (n, d)
            <br />
            We call <i>n</i> the <i>RSA module</i>, <i>e</i> the <i>encryption exponent</i> and
            <i>d</i> the <i>decryption exponent</i>.
          </Typography>
          <Typography variant="h5">
            Step 2.1: Calculate <i>n</i>
          </Typography>
          <Typography variant="body2">
            <pre>n = p ⋅ q</pre>
          </Typography>
          <Typography variant="body2">
            <pre>
              n = {p} ⋅ {q}
            </pre>
          </Typography>
          <Typography variant="body2">
            <pre>n = {p * q}</pre>
            Since this will all be done in binary, {n} = {n.toString(2)}
            <sub>2</sub> <i>This means a length of {n.toString(2).length} bit</i>
          </Typography>
          <Typography variant="h5">
            Step 2.2: Calculate <i>ϕ(n)</i>, the 'Euler phi function', to make e, d
          </Typography>
          <Typography variant="body1">
            ϕ(n) = ϕ(p×q)=(p−1)×(q−1) ϕ(n) = ({p} -1 ) x ({q} - 1) = {phiN}
          </Typography>
          <Typography variant="h6">e (public exponent): {e}</Typography>
          <Typography variant="h6">d (private exponent): {d}</Typography>
        </Box>
        {n && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Encryption & Decryption</h3>
            <TextField
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
      </Stack>
    </Card>
  );
}
