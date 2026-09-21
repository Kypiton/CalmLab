export interface CheckoutItem {
  id: number;
  quantity: number;
}

export function isCheckoutCart(data: unknown): data is CheckoutItem[] {
  return Array.isArray(data) && data.length > 0 && data.length <= 99 &&
    data.every(item => item && Number.isSafeInteger(item.id) && item.id > 0 &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999) &&
    new Set(data.map(item => item.id)).size === data.length;
}
