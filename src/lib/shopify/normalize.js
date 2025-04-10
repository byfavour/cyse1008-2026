export function normalizeShopifyProduct(product) {
  return {
    title: product.title,
    handle: product.handle,
    shopifyId: product.id.toString(),
    description: product.body_html,
    vendor: product.vendor,
    tags: product.tags?.split(',').map((t) => t.trim()) || [],
    images: product.images?.map((img) => img.src) || [],
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
    options: product.options.map((opt) => ({
      name: opt.name,
      values: opt.values,
    })),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    source: 'shopify',
    integrations: {
      shopify: {
        id: product.id.toString(),
        updated_at: product.updated_at,
      },
    },
  };
}
