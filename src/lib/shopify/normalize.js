export function normalizeShopifyProduct(product) {
  const variants = (product.variants || []).map((v, idx) => {
    const stock = Number(v.inventory_quantity ?? 0);
    const options = (product.options || []).reduce((acc, option, i) => {
      const key = option?.name;
      const value = v?.[`option${i + 1}`];
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    return {
      id: String(v.id),
      title: v.title,
      price: parseFloat(v.price),
      sku: v.sku,
      stock,
      options,
      allowOversell: v.inventory_policy === 'continue',
      trackInventory: v.inventory_management === 'shopify',
      createdAt: v.created_at,
      updatedAt: v.updated_at,
      integrations: {
        shopify: {
          variantId: String(v.id),
          inventory_item_id: v.inventory_item_id ? String(v.inventory_item_id) : undefined,
          inventory_policy: v.inventory_policy,
          inventory_management: v.inventory_management,
          raw_inventory_quantity: v.inventory_quantity,
          position: v.position ?? idx + 1,
        },
      },
    };
  });

  const stockAggregate = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return {
    title: product.title,
    handle: product.handle,
    shopifyId: String(product.id),
    description: product.body_html,
    vendor: product.vendor,
    tags:
      typeof product.tags === 'string'
        ? product.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(product.tags)
          ? product.tags
          : [],
    images: (product.images || []).map((img) => img.src),
    variants,
    options: (product.options || []).map((opt) => ({
      name: opt.name,
      values: opt.values,
    })),
    stock: stockAggregate,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    source: 'shopify',
    integrations: {
      shopify: {
        id: String(product.id),
        updated_at: product.updated_at,
      },
    },
  };
}
