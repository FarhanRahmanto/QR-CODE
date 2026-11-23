export type ItemStatus = 'SAFE' | 'LOST';

export interface User {
  id: string;
  name: string;
  email: string; // dipakai untuk login
  phone: string; // wajib: dihubungi penemu via WhatsApp & notifikasi scan
  createdAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface Item {
  id: string;
  publicCode: string;
  publicUrl?: string;
  ownerId: string;
  ownerName: string;
  itemName: string;
  photoUrl?: string;
  description: string;
  ownerMessage?: string;
  status: ItemStatus;
  allowWhatsapp: boolean;
  allowComments?: boolean;
  unreadComments: number;
  totalScans?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  itemId: string;
  finderName?: string;
  message: string;
  location?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Scan {
  id: string;
  itemId: string;
  ipHash?: string;
  userAgent?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface PublicItem {
  itemName: string;
  ownerName: string;
  photoUrl?: string;
  description: string;
  ownerMessage?: string;
  status: ItemStatus;
  allowWhatsapp: boolean;
  allowComments?: boolean;
}

export interface CreateItemInput {
  ownerName: string;
  itemName: string;
  description: string;
  ownerMessage?: string;
  allowWhatsapp: boolean;
  allowComments?: boolean;
  photo?: File;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {}

export interface CreateCommentInput {
  finderName?: string;
  message: string;
  location?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string; // Wajib: agar penemu bisa menghubungi & notifikasi scan terkirim
}
