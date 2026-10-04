import { apiRequest } from './client';
import { Product, Category } from '../types';

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    query.append('category', params.category);
  }
  if (params?.search) {
    query.append('search', params.search);
  }
  if (params?.sort) {
    query.append('sort', params.sort);
  }
  const queryString = query.toString();
  return apiRequest<Product[]>(`/api/products${queryString ? `?${queryString}` : ''}`);
}

export async function fetchProduct(id: number): Promise<Product> {
  return apiRequest<Product>(`/api/products/${id}`);
}

export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/api/categories');
}
