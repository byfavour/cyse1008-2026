import ApexCharts from 'react-apexcharts';
import React, { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// ----------------------------------------------------------------------

export function EncryptionSimplifiedRSA({ title, subheader, ...other }) {
  const [p, setP] = useState(2); // Small prime
  const [q, setQ] = useState(7); // Small prime
  const [n, setN] = useState(14); // n = p * q
  const [phiN, setPhiN] = useState(6); // phi(n) = (p-1)*(q-1)
  const [e, setE] = useState(3); // Default exponent
  const [validEs, setValidEs] = useState([]);
  const [roots, setRoots] = useState([]);
  const [cipherToMessages, setCipherToMessages] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [chartRootsOfUnityOptions, _setChartRootsOfUnityOptions] = useState({});
  const [chartRootsOfUnitySeries, _setChartRootsOfUnitySeries] = useState([]);
  // const [chartData, setChartData] = useState({
  //   series: [],
  //   options: {
  //     chart: {
  //       type: 'scatter',
  //       zoom: { enabled: true },
  //     },
  //     xaxis: {
  //       title: { text: 'Message (m)' },
  //     },
  //     yaxis: {
  //       title: { text: 'Ciphertext (c)' },
  //     },
  //     title: {
  //       text: 'Message to Ciphertext Mapping',
  //       align: 'center',
  //     },
  //   },
  // });

  // Function to compute GCD
  const gcd = useCallback(function computeGcd(a, b) {
    return b === 0 ? a : computeGcd(b, a % b);
  }, []);

  // Function to compute modular inverse using EEA
  // const modInverse = (a, m) => {
  //   const m0 = m;
  //   let x0 = 0;
  //   let x1 = 1;
  //   while (a > 1) {
  //     const quotient = Math.floor(a / m);
  //     [a, m] = [m, a % m];
  //     [x0, x1] = [x1 - quotient * x0, x0];
  //   }
  //   return x1 < 0 ? x1 + m0 : x1;
  // };

  // Compute phi(n) and valid e values
  useEffect(() => {
    const computedN = p * q;
    const computedPhiN = (p - 1) * (q - 1);
    setN(computedN);
    setPhiN(computedPhiN);

    // Find valid e values (coprime to phi(n))
    const es = [];
    for (let i = 2; i < computedPhiN; i += 1) {
      if (gcd(i, computedPhiN) === 1) es.push(i);
    }
    setValidEs(es);
    if (!es.includes(e)) setE(es[0]); // Set default e if current e isn't valid
  }, [p, q, e, gcd]);

  // Generate mapping and chart data
  useEffect(() => {
    const messages = Array.from({ length: n - 1 }, (_, i) => i + 1);
    const cipherMap = {};

    const chartData = messages.map((m) => {
      const c = m ** e % n;
      if (!cipherMap[c]) cipherMap[c] = [];
      cipherMap[c].push(m);
      return { x: m, y: c };
    });

    setCipherToMessages(cipherMap);

    // Setup ApexCharts options
    setChartOptions({
      chart: { type: 'scatter', zoom: { enabled: true } },
      xaxis: { title: { text: 'Message (m)' } },
      yaxis: { title: { text: `Ciphertext (c = m^${e} mod ${n})` } },
      title: { text: 'Message to Ciphertext Mapping', align: 'center' },
    });

    setChartSeries([{ name: 'm vs c', data: chartData }]);
  }, [n, e]);

  // Compute n and roots of unity
  useEffect(() => {
    const computedN = p * q;
    setN(computedN);

    // Find e-th roots of unity: r^e ≡ 1 mod n
    const foundRoots = [];
    for (let r = 1; r < computedN; r += 1) {
      if (r ** e % computedN === 1) {
        foundRoots.push(r);
      }
    }
    setRoots(foundRoots);

    // Prepare chart data
    const angleStep = (2 * Math.PI) / foundRoots.length;
    const dataPoints = foundRoots.map((root, index) => {
      const angle = index * angleStep;
      return {
        x: Math.cos(angle),
        y: Math.sin(angle),
        root,
      };
    });

    // ApexCharts config
    setChartOptions({
      chart: { type: 'scatter', zoom: { enabled: true } },
      xaxis: { min: -1.5, max: 1.5, title: { text: 'Re' } },
      yaxis: { min: -1.5, max: 1.5, title: { text: 'Im' } },
      title: { text: `Roots of Unity (r^${e} ≡ 1 mod ${computedN})`, align: 'center' },
      annotations: {
        points: dataPoints.map((pt) => ({
          x: pt.x,
          y: pt.y,
          marker: { size: 6, fillColor: '#FF4560' },
          label: { text: `r=${pt.root}` },
        })),
      },
    });

    setChartSeries([{ name: 'Roots', data: dataPoints.map((pt) => [pt.x, pt.y]) }]);
  }, [p, q, e]);

  // Generate RSA keys
  // const generateKeys = () => {
  //   const nValue = p * q;
  //   const phiValue = (p - 1) * (q - 1);

  //   if (gcd(e, phiValue) !== 1) {
  //     alert('e is not co-prime with phi(n). Choose another e.');
  //     return;
  //   }

  //   const dValue = modInverse(e, phiValue);

  //   setN(nValue);
  //   setPhiN(phiValue);
  //   setD(dValue);
  // };

  // // Encrypt plaintext
  // const encrypt = () => {
  //   const m = plaintext.charCodeAt(0); // Simple: take first character
  //   const c = Math.pow(m, e) % n;
  //   setCiphertext(c);
  // };

  // // Decrypt ciphertext
  // const decrypt = () => {
  //   const m = Math.pow(ciphertext, d) % n;
  //   const decryptedChar = String.fromCharCode(m);
  //   setDecryptedText(decryptedChar);
  // };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item container size={6} spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Prime p"
              type="number"
              value={p}
              onChange={(_e) => setP(Number(_e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Prime q"
              type="number"
              value={q}
              onChange={(exx) => setQ(Number(exx.target.value))}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <Select value={e} onChange={(exc) => setE(Number(exc.target.value))} fullWidth>
              {validEs.map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption">Select Public Exponent (e)</Typography>
          </Grid>
          <Grid item size={12}>
            <Typography variant="h6" style={{ marginTop: '20px' }}>
              n = {n}, φ(n) = {phiN}
            </Typography>
          </Grid>
        </Grid>

        <Grid item size={6}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>
                    Ciphertext (c = m^{e} mod {n})
                  </strong>
                </TableCell>
                <TableCell>
                  <strong>Messages Mapping to c</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(cipherToMessages).map(([cipher, messages]) => (
                <TableRow key={cipher}>
                  <TableCell>{cipher}</TableCell>
                  <TableCell>{JSON.stringify(messages)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item size={6}>
          <ApexCharts options={chartOptions} series={chartSeries} type="scatter" />
        </Grid>

        <Grid item size={12}>
          <ApexCharts
            options={chartRootsOfUnityOptions}
            series={chartRootsOfUnitySeries}
            type="scatter"
          />
        </Grid>
        {/* List of Roots */}
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Found Roots of Unity: {roots.length > 0 ? roots.join(', ') : 'None'}
        </Typography>
      </Grid>
    </Card>
  );
}
