const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  product: {
    root: '/product',
    checkout: '/product/checkout',
    details: (id) => `/product/${id}`,
  },
  // AUTH
  auth: {
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    permission: `${ROOTS.DASHBOARD}/permission`,
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
    },
    vendor: {
      root: `${ROOTS.DASHBOARD}/vendor`,
      new: `${ROOTS.DASHBOARD}/vendor/new`,
      details: (id) => `${ROOTS.DASHBOARD}/vendor/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/vendor/${id}/edit`,
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
    },
  },
  docs: 'https://docs.minimals.cc',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
};
