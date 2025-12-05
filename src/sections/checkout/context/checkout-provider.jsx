'use client';

import { useMemo, Suspense, useEffect, useCallback, createContext } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { getStorage, useLocalStorage } from 'src/hooks/use-local-storage';

import { PRODUCT_CHECKOUT_STEPS } from 'src/constants/options';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const CheckoutContext = createContext(undefined);

export const CheckoutConsumer = CheckoutContext.Consumer;

const STORAGE_KEY = 'app-checkout';

const initialState = {
  items: [],
  subtotal: 0,
  total: 0,
  discount: 0,
  shipping: 0,
  tax: 0,
  billing: null,
  totalItems: 0,
};

// ----------------------------------------------------------------------

export function CheckoutProvider({ children }) {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Container>{children}</Container>
    </Suspense>
  );
}

// ----------------------------------------------------------------------

function Container({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const activeStep = Number(searchParams.get('step'));

  const { state, setState, setField, canReset, resetState } = useLocalStorage(
    STORAGE_KEY,
    initialState
  );

  const completed = activeStep === PRODUCT_CHECKOUT_STEPS.length;

  const updateTotalField = useCallback(() => {
    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

    const subtotal = state.items.reduce((total, item) => total + item.quantity * item.price, 0);

    const tax = state.items.reduce((acc, item) => {
      const rate = Number(item?.taxes ?? 0);
      if (!Number.isFinite(rate) || rate <= 0) return acc;
      return acc + item.quantity * item.price * (rate / 100);
    }, 0);

    setField('subtotal', subtotal);
    setField('tax', tax);
    setField('totalItems', totalItems);
    setField('total', subtotal - state.discount + state.shipping + tax);
  }, [setField, state.discount, state.items, state.shipping]);

  useEffect(() => {
    const restoredValue = getStorage(STORAGE_KEY);
    if (restoredValue) {
      updateTotalField();
    }
  }, [updateTotalField]);

  useEffect(() => {
    updateTotalField();
  }, [state.items, state.discount, state.shipping, updateTotalField]);

  // Clear any stale cart persisted before the cleanup (removes old $1 demo items)
  useEffect(() => {
    resetState();
  }, [resetState]);

  const initialStep = useCallback(() => {
    if (!activeStep) {
      const href = createUrl('go', 0);
      router.push(href);
    }
  }, [activeStep, router]);

  const onBackStep = useCallback(() => {
    const href = createUrl('back', activeStep);
    router.push(href);
  }, [activeStep, router]);

  const onNextStep = useCallback(() => {
    const href = createUrl('next', activeStep);
    router.push(href);
  }, [activeStep, router]);

  const onGotoStep = useCallback(
    (step) => {
      const href = createUrl('go', step);
      router.push(href);
    },
    [router]
  );

  const onAddToCart = useCallback(
    (newItem) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === newItem.id) {
          const colorsAdded = [...item.colors, ...newItem.colors];

          const colors = colorsAdded.filter((color, index) => colorsAdded.indexOf(color) === index);

          const taxes =
            Number.isFinite(Number(newItem?.taxes)) && Number(newItem?.taxes) >= 0
              ? Number(newItem.taxes)
              : item.taxes;

          return { ...item, colors, taxes, quantity: item.quantity + 1 };
        }
        return item;
      });

      if (!updatedItems.some((item) => item.id === newItem.id)) {
        const taxes = Number.isFinite(Number(newItem?.taxes)) ? Number(newItem.taxes) : 0;
        updatedItems.push({ ...newItem, taxes });
      }

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onDeleteCart = useCallback(
    (itemId) => {
      const updatedItems = state.items.filter((item) => item.id !== itemId);

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onIncreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onDecreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onCreateBilling = useCallback(
    (address) => {
      setField('billing', address);

      onNextStep();
    },
    [onNextStep, setField]
  );

  const onSkipBilling = useCallback(() => {
    setField('billing', null);
    onNextStep();
  }, [onNextStep, setField]);

  const onApplyDiscount = useCallback(
    (discount) => {
      setField('discount', discount);
    },
    [setField]
  );

  const onApplyShipping = useCallback(
    (shipping) => {
      setField('shipping', shipping);
    },
    [setField]
  );

  // Reset
  const onReset = useCallback(() => {
    if (completed) {
      resetState();
      router.push(paths.product.root);
    }
  }, [completed, resetState, router]);

  const memoizedValue = useMemo(
    () => ({
      ...state,
      canReset,
      onReset,
      onUpdate: setState,
      onUpdateField: setField,
      //
      completed,
      //
      onAddToCart,
      onDeleteCart,
      //
      onIncreaseQuantity,
      onDecreaseQuantity,
      //
      onCreateBilling,
      onSkipBilling,
      onApplyDiscount,
      onApplyShipping,
      //
      activeStep,
      initialStep,
      onBackStep,
      onNextStep,
      onGotoStep,
    }),
    [
      state,
      onReset,
      canReset,
      setField,
      completed,
      setState,
      activeStep,
      onBackStep,
      onGotoStep,
      onNextStep,
      initialStep,
      onAddToCart,
      onDeleteCart,
      onApplyDiscount,
      onApplyShipping,
      onCreateBilling,
      onSkipBilling,
      onDecreaseQuantity,
      onIncreaseQuantity,
    ]
  );

  return <CheckoutContext.Provider value={memoizedValue}>{children}</CheckoutContext.Provider>;
}

// ----------------------------------------------------------------------

function createUrl(type, activeStep) {
  const step = { back: activeStep - 1, next: activeStep + 1, go: activeStep }[type];

  const stepParams = new URLSearchParams({ step: `${step}` }).toString();

  return `${paths.product.checkout}?${stepParams}`;
}
