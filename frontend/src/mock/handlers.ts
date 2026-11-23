import type { User, Item, Comment, Scan, PublicItem, CreateItemInput, UpdateItemInput, CreateCommentInput, LoginInput, RegisterInput } from '@/types';
import { mockUser, initialMockItems, initialMockComments, initialMockScans } from './data';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let currentUser: User = { ...mockUser };
let items: Item[] = [...initialMockItems];
let comments: Comment[] = [...initialMockComments];
let scans: Scan[] = [...initialMockScans];

export async function mockLogin(input: LoginInput): Promise<User> {
  await delay(400);
  if (input.mode === 'phone') {
    if (input.otp !== '123456' && input.otp?.length !== 6) {
      throw new Error('Kode OTP tidak valid');
    }
    currentUser = { ...currentUser, phone: input.phone || currentUser.phone };
    return currentUser;
  } else {
    if (!input.email || !input.password) {
      throw new Error('Email dan password harus diisi');
    }
    currentUser = {
      ...currentUser,
      email: input.email,
    };
    return currentUser;
  }
}

export async function mockRequestOTP(phone: string): Promise<{ success: boolean }> {
  await delay(300);
  return { success: true };
}

export async function mockRegister(input: RegisterInput): Promise<User> {
  await delay(500);
  if (!input.phone) {
    throw new Error('Nomor WhatsApp wajib diisi');
  }
  currentUser = {
    id: `usr_${Date.now()}`,
    name: input.name,
    phone: input.phone,
    email: input.email || undefined,
    createdAt: new Date().toISOString(),
  };
  return currentUser;
}

export async function mockGetItems(): Promise<Item[]> {
  await delay(300);
  return [...items];
}

export async function mockGetItem(id: string): Promise<Item | undefined> {
  await delay(200);
  return items.find((i) => i.id === id);
}

export async function mockGetItemByCode(code: string): Promise<PublicItem | undefined> {
  await delay(300);
  const found = items.find((i) => i.publicCode.toLowerCase() === code.toLowerCase());
  if (!found) return undefined;

  // Record a scan
  scans.unshift({
    id: `scan_${Date.now()}`,
    itemId: found.id,
    userAgent: navigator.userAgent,
    createdAt: new Date().toISOString(),
  });

  return {
    itemName: found.itemName,
    ownerName: found.ownerName,
    photoUrl: found.photoUrl,
    description: found.description,
    ownerMessage: found.ownerMessage,
    status: found.status,
    allowWhatsapp: found.allowWhatsapp,
  };
}

export async function mockCreateItem(input: CreateItemInput): Promise<Item> {
  await delay(500);
  const newItem: Item = {
    id: `item_${Date.now()}`,
    publicCode: Math.random().toString(36).substring(2, 12),
    ownerId: currentUser.id,
    ownerName: input.ownerName || currentUser.name,
    itemName: input.itemName,
    photoUrl: input.photo ? URL.createObjectURL(input.photo) : undefined,
    description: input.description,
    ownerMessage: input.ownerMessage,
    status: 'SAFE',
    allowWhatsapp: input.allowWhatsapp,
    unreadComments: 0,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  return newItem;
}

export async function mockUpdateItem(id: string, input: UpdateItemInput): Promise<Item> {
  await delay(400);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Barang tidak ditemukan');

  const updated: Item = {
    ...items[index],
    ownerName: input.ownerName ?? items[index].ownerName,
    itemName: input.itemName ?? items[index].itemName,
    description: input.description ?? items[index].description,
    ownerMessage: input.ownerMessage ?? items[index].ownerMessage,
    allowWhatsapp: input.allowWhatsapp ?? items[index].allowWhatsapp,
    photoUrl: input.photo ? URL.createObjectURL(input.photo) : items[index].photoUrl,
  };
  items[index] = updated;
  return updated;
}

export async function mockDeleteItem(id: string): Promise<void> {
  await delay(300);
  items = items.filter((i) => i.id !== id);
}

export async function mockToggleStatus(id: string): Promise<Item> {
  await delay(300);
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error('Barang tidak ditemukan');
  item.status = item.status === 'SAFE' ? 'LOST' : 'SAFE';
  return { ...item };
}

export async function mockGetComments(itemId: string): Promise<Comment[]> {
  await delay(200);
  return comments.filter((c) => c.itemId === itemId);
}

export async function mockSubmitComment(code: string, input: CreateCommentInput): Promise<Comment> {
  await delay(400);
  const item = items.find((i) => i.publicCode.toLowerCase() === code.toLowerCase());
  if (!item) throw new Error('Barang tidak ditemukan');

  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    itemId: item.id,
    finderName: input.finderName || 'Anonim',
    message: input.message,
    location: input.location,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  comments.unshift(newComment);
  item.unreadComments += 1;
  return newComment;
}

export async function mockMarkCommentRead(commentId: string): Promise<void> {
  await delay(150);
  const comment = comments.find((c) => c.id === commentId);
  if (comment && !comment.isRead) {
    comment.isRead = true;
    const item = items.find((i) => i.id === comment.itemId);
    if (item && item.unreadComments > 0) {
      item.unreadComments -= 1;
    }
  }
}

export async function mockGetScans(itemId: string): Promise<Scan[]> {
  await delay(200);
  return scans.filter((s) => s.itemId === itemId);
}

export async function mockUpdateUser(data: Partial<User>): Promise<User> {
  await delay(300);
  currentUser = { ...currentUser, ...data };
  return currentUser;
}
