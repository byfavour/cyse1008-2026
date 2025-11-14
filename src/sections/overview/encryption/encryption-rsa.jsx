import forge from 'node-forge';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function EncryptionRSA({ title, subheader, ...other }) {
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [primeP, setPrimeP] = useState('');
  const [primeQ, setPrimeQ] = useState('');
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

      // Extract primes p and q
      const asn1 = forge.pki.privateKeyToAsn1(keypair.privateKey);
      const privateKeyObj = forge.pki.privateKeyFromAsn1(asn1);

      setPrimeP(privateKeyObj.p.toString(16));
      setPrimeQ(privateKeyObj.q.toString(16));

      setError('');
    } catch (err) {
      setError(`Error generating keys: ${  err.message}`);
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
      setError(`Error during encryption: ${  err.message}`);
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
      setError(`Error during decryption: ${  err.message}`);
    }
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button variant="contained" color="primary" onClick={generateKeys}>
            Compute
          </Button>
        }
        sx={{ mb: 3 }}
      />
      <CardContent>
        {error && <Box>{error}</Box>}
        {publicKey && privateKey && (
          <Box>
            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h5">Prime p</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ overflowWrap: 'break-word' }} gutterBottom>
                  {primeP}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h5" gutterBottom>
                  Prime q
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                  gutterBottom
                >
                  {primeQ}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h5">Public Key</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                  gutterBottom
                >
                  {forge.pki.publicKeyToPem(publicKey)}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography variant="h5" gutterBottom>
                  Private Key
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                  gutterBottom
                >
                  {forge.pki.privateKeyToPem(privateKey)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {publicKey && (
          <div className="mt-6">
            <Typography variant="h4" gutterBottom>
              Encryption & Decryption
            </Typography>
            <TextField
              type="text"
              placeholder="Enter plaintext (string)"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
            />
            <Button onClick={encrypt} variant="outlined">
              Encrypt
            </Button>
            {ciphertext && (
              <Box>
                <p>
                  <strong>Ciphertext (Base64):</strong>
                </p>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                  gutterBottom
                >
                  {ciphertext}
                </Typography>
              </Box>
            )}
            <Button onClick={decrypt} variant="outlined">
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
      </CardContent>
    </Card>
  );
}
