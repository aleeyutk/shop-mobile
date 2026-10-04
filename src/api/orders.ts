import { apiRequest } from './client';
import { Order, CheckoutPayload } from '../types';

export async function fetchOrders(email?: string): Promise<Order[]> {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  return apiRequest<Order[]>(`/api/orders${query}`);
}

export async function submitCheckout(payload: CheckoutPayload): Promise<Order> {
  return apiRequest<Order>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
