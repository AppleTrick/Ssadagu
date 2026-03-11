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
  title: string;
  price: number;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  thumbnailUrl: string | null;
  isWished: boolean;
  createdAt: string;
}
