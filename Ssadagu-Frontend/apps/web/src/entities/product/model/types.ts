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
}

export interface CreateProductRequest {
  sellerId: number;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
}

export interface UpdateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
}
