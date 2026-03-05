'use client';

import { useMemo, useState, useEffect } from 'react';

import { getVendors, getVendorById } from 'src/lib/firebase/vendors';

const defaultState = {
  vendors: [],
  vendorsLoading: true,
  vendorsError: null,
  vendorsValidating: false,
};

export function useGetVendors(ownerId) {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      setState((prev) => ({ ...prev, vendorsLoading: true, vendorsValidating: true }));
      try {
        const data = await getVendors(ownerId ? { ownerId } : {});
        if (!active) return;
        setState({
          vendors: data,
          vendorsLoading: false,
          vendorsError: null,
          vendorsValidating: false,
        });
      } catch (error) {
        if (!active) return;
        setState({
          vendors: [],
          vendorsLoading: false,
          vendorsError: error,
          vendorsValidating: false,
        });
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [ownerId]);

  return useMemo(
    () => ({
      ...state,
      vendorsEmpty: !state.vendorsLoading && state.vendors.length === 0,
    }),
    [state]
  );
}

export function useGetVendor(vendorId) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendorId) {
      setVendor(null);
      setLoading(false);
      return;
    }
    let active = true;
    async function fetchVendor() {
      setLoading(true);
      try {
        const data = await getVendorById(vendorId);
        if (!active) return;
        setVendor(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
        setVendor(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchVendor();
    return () => {
      active = false;
    };
  }, [vendorId]);

  return { vendor, vendorLoading: loading, vendorError: error };
}
