'use client';

import withFirestoreRoute from 'src/components/firebase/with-firestore-route';
import { ProductDetailsView } from 'src/sections/product/view';

const ProductClientPage = withFirestoreRoute({
  collection: 'products',
  View: ProductDetailsView,
});

export default ProductClientPage;
