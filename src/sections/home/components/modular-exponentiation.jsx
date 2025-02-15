import { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export function ModularExponentiation() {
    const [base, setBase] = useState(0);
    const [exponent, setExponent] = useState(0);
    const [modulus, setModulus] = useState(0);
    const [result, setResult] = useState(null);

    function modExp(base, exponent, modulus) {
        if (modulus === 1) return 0;
        let result = 1;
        base = base % modulus;
        while (exponent > 0) {
            if (exponent % 2 === 1) {
                result = (result * base) % modulus;
            }
            exponent = Math.floor(exponent / 2);
            base = (base * base) % modulus;
        }
        return result;
    }

    const handleCalculate = () => {
        setResult(modExp(parseInt(base), parseInt(exponent), parseInt(modulus)));
    };

    return (
          <Box
            component="form"
            sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <h2 className="text-xl font-bold mb-4">Modular Exponentiation</h2>
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
              Calculate 
            </Button>
            {result !== null && (
                <div className="mt-4 p-2 bg-gray-100 rounded">Result: {result}</div>
            )}
        </Box>
    );
}
