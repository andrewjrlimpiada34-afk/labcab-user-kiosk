
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  qrCode: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  items: { itemId: string; name: string; quantity: number }[];
  timestamp: string;
  deadline: string;
  status: 'active' | 'returned';
}
