export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter';
  type: 'followers' | 'likes' | 'views' | 'comments';
  pricePer1000: number; // In Kwanzas
  minQuantity: number;
  maxQuantity: number;
}

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  type: string;
  link: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'order';
  status: 'pending' | 'completed' | 'failed';
  paymentLink?: string;
  createdAt: string;
}
