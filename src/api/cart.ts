import { apiRequest } from './client';
import { Cart } from '../types';

export async function fetchCart(): Promise<Cart> {
  return apiRequest<Cart>('/api/cart');
}

export async function addCartItem(productId: number, quantity: number = 1): Promise<Cart> {
  return apiRequest<Cart>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<Cart> {
  return apiRequest<Cart>(`/api/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: number): Promise<Cart> {
  return apiRequest<Cart>(`/api/cart/${productId}`, {
    method: 'DELETE',
  });
}

export async function clearServerCart(): Promise<Cart> {
  return apiRequest<Cart>('/api/cart', {
    method: 'DELETE',
  });
}
