export type RoomStatus = 'ACTIVE' | 'CLOSED' | 'DELETED';

export interface ChatRoom {
  id: number;
  productId: number;
  productTitle: string;
  productThumbnailUrl: string | null;
  productPrice?: number;
  productStatus?: string;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  lastMessage: string | null;
  lastSentAt: string | null;
  unreadCount: number;
  roomStatus: RoomStatus;
  partnerId: number;
  partnerNickname: string;
}

export type MessageType = 'TALK' | 'ENTER' | 'LEAVE' | 'SYSTEM' | 'PAYMENT_REQUEST' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL' | 'IMAGE' | 'MAP';

export interface TransactionContent {
  productTitle?: string;
  price?: number;
  time?: string;
  locationName?: string;
  buyerNickname?: string;
  sellerNickname?: string;
}

export interface ChatMessage {
  id: string; // 백엔드 message_id
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string | null;
  createdAt?: string; // 백엔드 필드 매핑
  type?: MessageType; // 백엔드 필드 매핑
  isRead: boolean;
  messageType?: MessageType;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}
