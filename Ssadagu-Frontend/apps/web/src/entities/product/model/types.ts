export type ProductStatus = 'ON_SALE' | 'RESERVED' | 'SOLD' | 'DELETED';

export interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  sellerId: number;
  sellerNickname: string;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  images: ProductImage[];
  isWished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: number;
  sellerId: number;
  sellerNickname?: string;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string | null;
  isMine?: boolean;
  isLiked?: boolean;
}

export interface ProductDetail {
  id: number;
  sellerId: number;
  sellerNickname?: string;
  sellerProfileImageUrl?: string;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  createdAt: string;
  updatedAt: string;
  isMine?: boolean;
  isLiked?: boolean;
  images?: ProductImage[];
}

export interface CreateProductRequest {
  sellerId: number;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  images?: File[];
}

/** GET /api/v1/users/{userId}/wishes 응답 스펙 */
export interface WishItem {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  regionName: string;
  thumbnailUrl: string | null;
}

export interface UpdateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
  images?: File[];
  imageUrls?: string[];
}
