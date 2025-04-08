// Normalize Shopify product to Quilt format
export function normalizeShopifyProduct(product) {
  return {
    id: `shopify-${product.id}`, // Local Quilt ID
    name: product.title,
    description: product.body_html,
    images: product.images?.map((img) => img.src),
    variants: product.variants.map((v) => ({
      id: v.id.toString(),
      title: v.title,
      price: parseFloat(v.price),
      sku: v.sku,
      quantity: v.inventory_quantity,
      options: product.options.reduce((acc, option, idx) => {
        const key = option.name;
        const value = v[`option${idx + 1}`];
        if (key && value) acc[key] = value;
        return acc;
      }, {}),
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    })),
    source: 'shopify',
    integrations: {
      shopify: {
        id: product.id.toString(),
        updated_at: product.updated_at,
      },
    },
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}
