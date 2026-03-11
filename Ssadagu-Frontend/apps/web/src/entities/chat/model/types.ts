export type RoomStatus = 'ACTIVE' | 'CLOSED' | 'DELETED';

export interface ChatRoom {
  id: number;
  productId: number;
  productTitle: string;
  productThumbnailUrl: string | null;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  lastMessage: string | null;
  lastSentAt: string | null;
  unreadCount: number;
  roomStatus: RoomStatus;
}

export interface ChatMessage {
  id: string;
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}
