export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string | null;
  google_id?: string | null;
  created_at: string;
  token?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  product_count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category_id: number;
  stock: number;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total_count: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  mailgun_sent: boolean;
  created_at: string;
  items: OrderItem[];
}

export interface CheckoutPayload {
  items: { product_id: number; quantity: number }[];
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  payment_method: string;
}
