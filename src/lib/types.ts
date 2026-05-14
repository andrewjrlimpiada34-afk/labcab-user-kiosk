
export type UserRole = 'student' | 'teacher';

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
  /**
   * In Firestore you currently store either:
   * - a human-friendly icon key (e.g. "Beaker", "Stirring Rod"), OR
   * - an image URL (Cloudinary) under the field named `icon`.
   *
   * The UI will render an image when this looks like a URL.
   */
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
