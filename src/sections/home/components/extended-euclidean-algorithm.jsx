import React, { useState } from "react";

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

/**
 * ExtendedEuclideanAlgorithm Component
 * This React component takes two integer inputs (a, b) and computes the
 * greatest common divisor (GCD) using the Extended Euclidean Algorithm.
 * It also finds the coefficients x and y such that ax + by = gcd(a, b).
 */
export const ExtendedEuclideanAlgorithm = () => {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [result, setResult] = useState(null);

  /**
   * Computes the GCD of two numbers using the Extended Euclidean Algorithm.
   * Also finds x and y such that ax + by = gcd(a, b).
   * @param {number} q - First input number.
   * @param {number} m - Second input number.
   * @returns {Object} - An object containing gcd, x, and y.
   */
  const extendedEuclidean = (q, m) => {
    let oldR = q;
    let r = m;
    let oldS = 1;
    let s = 0;
    let oldT = 0;
    let t = 1;
    const steps = [];

    while (r !== 0) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
      [oldT, t] = [t, oldT - quotient * t];
      
      steps.push({
        quotient,
        remainder: r,
        x: oldS,
        y: oldT,
      });
    }
    
    return { gcd: oldR, x: oldS, y: oldT, steps };
  };

  /**
   * Handles form submission, computes the Extended Euclidean Algorithm,
   * and updates the state with the results.
   */
  const handleCalculate = (event) => {
    event.preventDefault();
    const computedResult = extendedEuclidean(parseInt(a, 10), parseInt(b, 10));
    setResult(computedResult);
  };

  return (
    <Stack>
      <Typography variant="h2">Extended Euclidean Algorithm</Typography>
      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="a"
          label="Enter a:"
          type="number"
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
        <TextField
          id="b"
          label="Enter b:"
          type="number"
          value={b}
          onChange={(e) => setB(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleCalculate}>
          Compute 
        </Button>
      </Box>
      
      {result && (
        <Box>
          <Typography variant="h3">Results</Typography>
          <Typography variant="p">GCD: {result.gcd} </Typography>
          <Typography variant="p">Coefficients: x = {result.x}, y = {result.y}</Typography>
          <Typography variant="h4">Steps</Typography>
          <List dense>
            {result.steps.map((step, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Quotient: ${step.quotient}, Remainder: ${step.remainder}, x: ${step.x}, y: ${step.y}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Stack>
  );
};

export default ExtendedEuclideanAlgorithm;
