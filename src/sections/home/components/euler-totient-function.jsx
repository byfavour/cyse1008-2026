import { useState } from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function EulerTotientFunction() {
    const [base, setBase] = useState(0);
    const [exponent, setExponent] = useState(0);
    const [modulus, setModulus] = useState(0);
    const [result, setResult] = useState(null);

    function modExp(_base, _exponent, _modulus) {
        if (_modulus === 1) return 0;
        let _result = 1;
        _base %= _modulus;
        while (_exponent > 0) {
            if (_exponent % 2 === 1) {
              _result = (_result * _base) % _modulus;
            }
            _exponent = Math.floor(_exponent / 2);
            _base = (_base * _base) % _modulus;
        }
        return _result;
    }

    const handleCalculate = () => {
        setResult(modExp(parseInt(base, 10), parseInt(exponent, 10), parseInt(modulus, 10)));
    };

    return (
          <Box
            component="form"
            sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <Typography variant="h2">Modular Exponentiation</Typography>
            <TextField
              id="base"
              label="Base"
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
            <TextField
              id="exponent"
              label="Exponent"
              type="number"
              value={exponent}
              onChange={(e) => setExponent(e.target.value)}
            />
            <TextField
              id="modulus"
              label="Modulus"
              type="number"
              value={modulus}
              onChange={(e) => setModulus(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleCalculate}>
              Compute 
            </Button>
            {result !== null && (
                <Box>Result: {result}</Box>
            )}
        </Box>
    );
}
