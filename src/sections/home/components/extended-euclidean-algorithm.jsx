import React, { useState } from "react";

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
  const handleSubmit = (event) => {
    event.preventDefault();
    const computedResult = extendedEuclidean(parseInt(a, 10), parseInt(b, 10));
    setResult(computedResult);
  };

  return (
    <div>
      <h2>Extended Euclidean Algorithm</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="foo">
          Enter a:
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} required />
        </label>
        <br />
        <label htmlFor="foo">
          Enter b:
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Compute</button>
      </form>
      
      {result && (
        <div>
          <h3>Results</h3>
          <p>GCD: {result.gcd}</p>
          <p>Coefficients: x = {result.x}, y = {result.y}</p>
          <h4>Steps:</h4>
          <ul>
            {result.steps.map((step, index) => (
              <li key={index}>
                Quotient: {step.quotient}, Remainder: {step.remainder}, x: {step.x}, y: {step.y}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExtendedEuclideanAlgorithm;
