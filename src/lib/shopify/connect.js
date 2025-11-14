import { getAuth } from 'firebase/auth';

export async function connectShopify(shopDomain) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  const userId = currentUser.uid;

  window.location.href = `/api/oauth2/shopify/authorize?shop=${shopDomain}&userId=${userId}`;
}
