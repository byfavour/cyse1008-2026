// Shared option lists and defaults used across product, checkout, and order flows.
// These replace the old demo mock data.

export const PRODUCT_CHECKOUT_STEPS = ['Cart', 'Billing (optional)', 'Payment'];

export const PRODUCT_GENDER_OPTIONS = [
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Kids', value: 'Kids' },
];

export const PRODUCT_CATEGORY_OPTIONS = ['Shoes', 'Apparel', 'Accessories'];

export const PRODUCT_CATEGORY_GROUP_OPTIONS = [
  { group: 'Food & Beverage', classify: ['Gelato', 'Sorbet', 'Frozen Desserts', 'Ice Cream'] },
  { group: 'Clothing', classify: ['Shirts', 'T-shirts', 'Jeans', 'Leather', 'Accessories'] },
  { group: 'Tailored', classify: ['Suits', 'Blazers', 'Trousers', 'Waistcoats', 'Apparel'] },
  { group: 'Accessories', classify: ['Shoes', 'Backpacks and bags', 'Bracelets', 'Face masks'] },
];

export const PRODUCT_RATING_OPTIONS = ['up4Star', 'up3Star', 'up2Star', 'up1Star'];

export const PRODUCT_COLOR_OPTIONS = [
  '#FF4842',
  '#1890FF',
  '#FFC0CB',
  '#00AB55',
  '#FFC107',
  '#7F00FF',
  '#000000',
  '#FFFFFF',
];

export const PRODUCT_COLOR_NAME_OPTIONS = [
  { value: '#FF4842', label: 'Red' },
  { value: '#1890FF', label: 'Blue' },
  { value: '#FFC0CB', label: 'Pink' },
  { value: '#00AB55', label: 'Green' },
  { value: '#FFC107', label: 'Yellow' },
  { value: '#7F00FF', label: 'Violet' },
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
];

export const PRODUCT_SIZE_OPTIONS = [
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '8.5', label: '8.5' },
  { value: '9', label: '9' },
  { value: '9.5', label: '9.5' },
  { value: '10', label: '10' },
  { value: '10.5', label: '10.5' },
  { value: '11', label: '11' },
  { value: '11.5', label: '11.5' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
];

export const PRODUCT_STOCK_OPTIONS = [
  { value: 'in stock', label: 'In stock' },
  { value: 'low stock', label: 'Low stock' },
  { value: 'out of stock', label: 'Out of stock' },
];

export const PRODUCT_PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export const PRODUCT_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceDesc', label: 'Price: High - Low' },
  { value: 'priceAsc', label: 'Price: Low - High' },
];

export const PRODUCT_TAGS = ['New', 'Limited', 'Sale', 'Featured'];

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];
