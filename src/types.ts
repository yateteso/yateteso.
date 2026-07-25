export interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  wishlist: string[];
  createdAt: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Laptops' | 'Phones' | 'Phone Accessories' | 'Laptop Accessories';
  price: number;
  stock: number;
  imageUrl: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  selectedVariants: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
