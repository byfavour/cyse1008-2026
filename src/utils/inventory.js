export function getVariantStock(variant) {
  const n = Number(variant?.stock ?? variant?.quantity ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function getProductStockCount(product) {
  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
  if (!hasVariants) return getVariantStock(product);
  return product.variants.reduce((sum, v) => sum + getVariantStock(v), 0);
}

export function isProductAvailable(product) {
  return getProductStockCount(product) > 0;
}

export function clampToAvailable(product, desiredQty = 1) {
  const max = getProductStockCount(product);
  return Math.max(0, Math.min(desiredQty, max));
}
