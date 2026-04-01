import type { User } from '@/entities/user';
import type { Product, ProductSummary } from '@/entities/product';
import type { ChatRoom, ChatMessage } from '@/entities/chat';

export const MOCK_TOKEN = 'mock-dev-access-token';

export const mockUser: User = {
  id: 1,
  email: 'dev@test.com',
  nickname: '개발자김싸다',
  regionName: undefined,
  status: 'UNVERIFIED',
  createdAt: '2024-01-01T00:00:00Z',
};

// 22개 상품 (무한 스크롤 테스트용)
export const mockProducts: ProductSummary[] = [
  { id: 1,  sellerId: 2, title: '맥북 프로 M3 14인치 풀박스', price: 2200000, thumbnailUrl: 'https://picsum.photos/seed/mac/400/400', status: 'ON_SALE', regionName: '서울 강남구', createdAt: '2025-03-09T10:00:00Z', updatedAt: '2025-03-09T10:00:00Z', wishCount: 12, chatCount: 3, categoryCode: 'ELEC', description: '상태 최상' },
  { id: 2,  sellerId: 2, title: '아이폰 15 프로 256GB 미개봉', price: 1100000, thumbnailUrl: 'https://picsum.photos/seed/iphone/400/400', status: 'ON_SALE', regionName: '서울 강남구', createdAt: '2025-03-09T09:00:00Z', updatedAt: '2025-03-09T09:00:00Z', wishCount: 8, chatCount: 2, categoryCode: 'ELEC', description: '미개봉 새상품' },
  { id: 3,  sellerId: 3, title: '닌텐도 스위치 OLED 화이트', price: 280000, thumbnailUrl: 'https://picsum.photos/seed/switch/400/400', status: 'ON_SALE', regionName: '서울 마포구', createdAt: '2025-03-09T08:00:00Z', updatedAt: '2025-03-09T08:00:00Z', wishCount: 5, chatCount: 1, categoryCode: 'ELEC', description: '상태 좋음' },
  { id: 4,  sellerId: 3, title: '다이슨 에어랩 완전체 미사용', price: 380000, thumbnailUrl: 'https://picsum.photos/seed/dyson/400/400', status: 'RESERVED', regionName: '서울 서초구', createdAt: '2025-03-08T20:00:00Z', updatedAt: '2025-03-08T20:00:00Z', wishCount: 15, chatCount: 5, categoryCode: 'BEAU', description: '미사용' },
  { id: 5,  sellerId: 2, title: '오디오테크니카 LP 턴테이블', price: 150000, thumbnailUrl: 'https://picsum.photos/seed/turntable/400/400', status: 'ON_SALE', regionName: '서울 용산구', createdAt: '2025-03-08T18:00:00Z', updatedAt: '2025-03-08T18:00:00Z', wishCount: 3, chatCount: 0, categoryCode: 'ELEC', description: '입문용 추천' },
  { id: 6,  sellerId: 1, title: '캠핑 테이블 + 의자 세트', price: 85000, thumbnailUrl: 'https://picsum.photos/seed/camp/400/400', status: 'SOLD', regionName: '서울 강동구', createdAt: '2025-03-08T16:00:00Z', updatedAt: '2025-03-08T16:00:00Z', wishCount: 2, chatCount: 1, categoryCode: 'SPOR', description: '일괄 판매' },
  { id: 7,  sellerId: 3, title: '삼성 갤럭시 탭 S9 Ultra', price: 950000, thumbnailUrl: 'https://picsum.photos/seed/tablet/400/400', status: 'ON_SALE', regionName: '서울 송파구', createdAt: '2025-03-08T14:00:00Z', updatedAt: '2025-03-08T14:00:00Z', wishCount: 7, chatCount: 2, categoryCode: 'ELEC', description: '거의 새것' },
  { id: 8,  sellerId: 2, title: 'LG 그램 16인치 노트북', price: 880000, thumbnailUrl: 'https://picsum.photos/seed/lgnotebook/400/400', status: 'ON_SALE', regionName: '서울 관악구', createdAt: '2025-03-08T12:00:00Z', updatedAt: '2025-03-08T12:00:00Z', wishCount: 4, chatCount: 1, categoryCode: 'ELEC', description: '초경량' },
  { id: 9,  sellerId: 1, title: '에어팟 프로 2세대 정품', price: 220000, thumbnailUrl: 'https://picsum.photos/seed/airpod/400/400', status: 'ON_SALE', regionName: '서울 영등포구', createdAt: '2025-03-08T10:00:00Z', updatedAt: '2025-03-08T10:00:00Z', wishCount: 9, chatCount: 3, categoryCode: 'ELEC', description: '생활기스' },
  { id: 10, sellerId: 3, title: '소니 WH-1000XM5 헤드폰', price: 270000, thumbnailUrl: 'https://picsum.photos/seed/sony/400/400', status: 'ON_SALE', regionName: '서울 중구', createdAt: '2025-03-07T22:00:00Z', updatedAt: '2025-03-07T22:00:00Z', wishCount: 6, chatCount: 2, categoryCode: 'ELEC', description: '실사용 적음' },
  { id: 11, sellerId: 2, title: '아이패드 에어 M2 256GB', price: 720000, thumbnailUrl: 'https://picsum.photos/seed/ipad/400/400', status: 'ON_SALE', regionName: '서울 노원구', createdAt: '2025-03-07T20:00:00Z', updatedAt: '2025-03-07T20:00:00Z', wishCount: 11, chatCount: 4, categoryCode: 'ELEC', description: '배터리 100' },
  { id: 12, sellerId: 3, title: '애플워치 시리즈 9 45mm', price: 380000, thumbnailUrl: 'https://picsum.photos/seed/watch/400/400', status: 'RESERVED', regionName: '서울 종로구', createdAt: '2025-03-07T18:00:00Z', updatedAt: '2025-03-07T18:00:00Z', wishCount: 8, chatCount: 3, categoryCode: 'ELEC', description: '필름 부착' },
  { id: 13, sellerId: 1, title: '로지텍 MX Master 3S 마우스', price: 75000, thumbnailUrl: 'https://picsum.photos/seed/mouse/400/400', status: 'ON_SALE', regionName: '서울 강서구', createdAt: '2025-03-07T16:00:00Z', updatedAt: '2025-03-07T16:00:00Z', wishCount: 2, chatCount: 0, categoryCode: 'ELEC', description: '사무용 최고' },
  { id: 14, sellerId: 3, title: '나이키 조던 1 레트로 High OG', price: 180000, thumbnailUrl: 'https://picsum.photos/seed/jordan/400/400', status: 'ON_SALE', regionName: '서울 동대문구', createdAt: '2025-03-07T14:00:00Z', updatedAt: '2025-03-07T14:00:00Z', wishCount: 14, chatCount: 6, categoryCode: 'CLOT', description: '박스 유' },
  { id: 15, sellerId: 2, title: '뱅앤올룹슨 스피커 Beoplay A1', price: 220000, thumbnailUrl: 'https://picsum.photos/seed/speaker/400/400', status: 'ON_SALE', regionName: '서울 성동구', createdAt: '2025-03-07T12:00:00Z', updatedAt: '2025-03-07T12:00:00Z', wishCount: 5, chatCount: 1, categoryCode: 'ELEC', description: '음질 최고' },
  { id: 16, sellerId: 3, title: '레고 테크닉 42175 맥라렌', price: 145000, thumbnailUrl: 'https://picsum.photos/seed/lego/400/400', status: 'ON_SALE', regionName: '서울 은평구', createdAt: '2025-03-07T10:00:00Z', updatedAt: '2025-03-07T10:00:00Z', wishCount: 3, chatCount: 1, categoryCode: 'HOBB', description: '조립 완료' },
  { id: 17, sellerId: 1, title: '다이슨 V15 무선청소기', price: 420000, thumbnailUrl: 'https://picsum.photos/seed/vacuum/400/400', status: 'ON_SALE', regionName: '서울 서대문구', createdAt: '2025-03-06T22:00:00Z', updatedAt: '2025-03-06T22:00:00Z', wishCount: 7, chatCount: 2, categoryCode: 'ELEC', description: '흡입력 굿' },
  { id: 18, sellerId: 2, title: '코닥 M35 필름 카메라', price: 55000, thumbnailUrl: 'https://picsum.photos/seed/camera/400/400', status: 'ON_SALE', regionName: '서울 도봉구', createdAt: '2025-03-06T20:00:00Z', updatedAt: '2025-03-06T20:00:00Z', wishCount: 4, chatCount: 1, categoryCode: 'ELEC', description: '토이 카메라' },
  { id: 19, sellerId: 3, title: '스타벅스 텀블러 미사용품', price: 28000, thumbnailUrl: 'https://picsum.photos/seed/tumbler/400/400', status: 'SOLD', regionName: '서울 강북구', createdAt: '2025-03-06T18:00:00Z', updatedAt: '2025-03-06T18:00:00Z', wishCount: 1, chatCount: 0, categoryCode: 'ETC', description: '선물용' },
  { id: 20, sellerId: 2, title: '이케아 KALLAX 책장 4칸', price: 40000, thumbnailUrl: 'https://picsum.photos/seed/shelf/400/400', status: 'ON_SALE', regionName: '서울 광진구', createdAt: '2025-03-06T16:00:00Z', updatedAt: '2025-03-06T16:00:00Z', wishCount: 2, chatCount: 0, categoryCode: 'FURN', description: '직접 가져가셔야 함' },
  { id: 21, sellerId: 1, title: '야마하 전자피아노 P-125', price: 350000, thumbnailUrl: 'https://picsum.photos/seed/piano/400/400', status: 'ON_SALE', regionName: '서울 금천구', createdAt: '2025-03-06T14:00:00Z', updatedAt: '2025-03-06T14:00:00Z', wishCount: 6, chatCount: 2, categoryCode: 'ELEC', description: '해머 건반' },
  { id: 22, sellerId: 3, title: '루이비통 네버풀 MM 정품', price: 1500000, thumbnailUrl: 'https://picsum.photos/seed/lv/400/400', status: 'ON_SALE', regionName: '서울 강남구', createdAt: '2025-03-06T12:00:00Z', updatedAt: '2025-03-06T12:00:00Z', wishCount: 18, chatCount: 7, categoryCode: 'CLOT', description: '상태 좋음' },
];

export const mockProductDetail: Product = {
  id: 1,
  sellerId: 2,
  sellerNickname: '판매왕이모니',
  title: '맥북 프로 M3 14인치 풀박스',
  description: '구매한지 6개월 된 맥북 프로 M3 14인치입니다.\n\n배터리 상태 96%, 기스 없음.\n풀박스 + 정품 충전기 포함.\n직거래 선호하며 택배도 가능합니다.\n\n거래 희망 장소: 강남역 2번 출구 앞',
  price: 2200000,
  categoryCode: 'ELEC',
  regionName: '서울 강남구',
  status: 'ON_SALE',
  wishCount: 12,
  chatCount: 3,
  images: [
    { id: 1, imageUrl: 'https://picsum.photos/seed/mac1/600/400', sortOrder: 0 },
    { id: 2, imageUrl: 'https://picsum.photos/seed/mac2/600/400', sortOrder: 1 },
    { id: 3, imageUrl: 'https://picsum.photos/seed/mac3/600/400', sortOrder: 2 },
  ],
  isWished: false,
  createdAt: '2025-03-01T10:00:00Z',
  updatedAt: '2025-03-01T10:00:00Z',
};

export const mockChatRooms: ChatRoom[] = [
  { id: 1, productId: 1, productTitle: '맥북 프로 M3 14인치 풀박스', productThumbnailUrl: 'https://picsum.photos/seed/mac/80/80', buyerId: 1, buyerNickname: '개발자김싸다', sellerId: 2, sellerNickname: '판매왕이모니', lastMessage: '직거래 가능한가요?', lastSentAt: '2025-03-09T10:30:00Z', unreadCount: 2, roomStatus: 'ACTIVE', partnerId: 2, partnerNickname: '판매왕이모니' },
  { id: 2, productId: 2, productTitle: '아이폰 15 프로 256GB 미개봉', productThumbnailUrl: 'https://picsum.photos/seed/iphone/80/80', buyerId: 1, buyerNickname: '개발자김싸다', sellerId: 2, sellerNickname: '판매왕이모니', lastMessage: '아직 판매 중인가요?', lastSentAt: '2025-03-08T15:00:00Z', unreadCount: 0, roomStatus: 'ACTIVE', partnerId: 2, partnerNickname: '판매왕이모니' },
  { id: 3, productId: 7, productTitle: '삼성 갤럭시 탭 S9 Ultra', productThumbnailUrl: 'https://picsum.photos/seed/tablet/80/80', buyerId: 3, buyerNickname: '구매자박사다', sellerId: 1, sellerNickname: '개발자김싸다', lastMessage: '이 가격에 팔 수 있을까요?', lastSentAt: '2025-03-07T09:00:00Z', unreadCount: 1, roomStatus: 'ACTIVE', partnerId: 3, partnerNickname: '구매자박사다' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'msg-1', roomId: 1, senderId: 2, senderNickname: '판매왕이모니', content: '안녕하세요! 관심 가져주셔서 감사합니다 😊', sentAt: '2025-03-09T10:00:00Z', isRead: true },
  { id: 'msg-2', roomId: 1, senderId: 1, senderNickname: '개발자김싸다', content: '안녕하세요~ 직거래 가능한가요?', sentAt: '2025-03-09T10:05:00Z', isRead: true },
  { id: 'msg-3', roomId: 1, senderId: 2, senderNickname: '판매왕이모니', content: '네 가능합니다! 어디 쪽 사세요?', sentAt: '2025-03-09T10:10:00Z', isRead: true },
  { id: 'msg-4', roomId: 1, senderId: 1, senderNickname: '개발자김싸다', content: '강남역 근처인데 혹시 괜찮으세요?', sentAt: '2025-03-09T10:28:00Z', isRead: false },
  { id: 'msg-5', roomId: 1, senderId: 2, senderNickname: '판매왕이모니', content: '강남역 2번 출구 어떠세요?', sentAt: '2025-03-09T10:30:00Z', isRead: false },
];

export const mockTransactions = [
  { id: 1, productId: 1, productTitle: '맥북 프로 M3 14인치 풀박스', productThumbnailUrl: 'https://picsum.photos/seed/mac/80/80', price: 2200000, buyerId: 1, buyerNickname: '개발자김싸다', sellerId: 2, sellerNickname: '판매왕이모니', status: 'COMPLETED', createdAt: '2025-02-15T14:00:00Z' },
];

export const mockWishes: ProductSummary[] = [mockProducts[1]];
export const mockMyProducts: ProductSummary[] = [mockProducts[5]];

// 페이지네이션 유틸
export const PAGE_SIZE = 10;
export const paginateProducts = (page: number, query?: string) => {
  const source = query
    ? mockProducts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : mockProducts;
  const start = page * PAGE_SIZE;
  return {
    content: source.slice(start, start + PAGE_SIZE),
    page,
    size: PAGE_SIZE,
    totalElements: source.length,
    hasNext: start + PAGE_SIZE < source.length,
  };
};
