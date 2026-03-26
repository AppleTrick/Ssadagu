import { http, HttpResponse, delay } from 'msw';
import {
  MOCK_TOKEN,
  mockUser,
  mockProductDetail,
  mockChatRooms,
  mockChatMessages,
  mockTransactions,
  mockWishes,
  mockMyProducts,
  paginateProducts,
} from './mockData';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';
const d = (ms = 300) => delay(ms);

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async () => {
    await d();
    return HttpResponse.json({ data: { accessToken: MOCK_TOKEN, refreshToken: 'mock-refresh-token' } });
  }),
  http.post(`${BASE}/auth/reissue`, async () => {
    await d();
    return HttpResponse.json({ data: { accessToken: MOCK_TOKEN, refreshToken: 'mock-refresh-token' } });
  }),
  http.post(`${BASE}/auth/logout`, async () => {
    await d(100);
    return HttpResponse.json({ message: 'ok' });
  }),

  // ── Users ─────────────────────────────────────────────────────────────
  http.post(`${BASE}/users/signup`, async () => {
    await d(400);
    return HttpResponse.json({ data: { id: 1, email: 'test@test.com', nickname: '테스트유저' } });
  }),
  http.get(`${BASE}/users/me`, async () => {
    await d();
    return HttpResponse.json({ data: mockUser });
  }),
  http.get(`${BASE}/users/:userId`, async ({ params }) => {
    await d();
    return HttpResponse.json({ data: { ...mockUser, id: Number(params.userId) } });
  }),
  http.patch(`${BASE}/users/me`, async ({ request }) => {
    await d();
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ data: { ...mockUser, ...body } });
  }),
  http.get(`${BASE}/users/me/wishes`, async () => {
    await d();
    return HttpResponse.json({ data: { content: mockWishes } });
  }),
  http.get(`${BASE}/users/:userId/wishes`, async () => {
    await d();
    const data = mockWishes.map(p => ({
      id: p.id,
      productId: p.id,
      productTitle: p.title,
      productPrice: p.price,
      regionName: p.regionName,
      thumbnailUrl: p.thumbnailUrl ?? null,
    }));
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '관심 목록 조회 성공',
      data,
    });
  }),
  http.get(`${BASE}/users/:userId/products`, async () => {
    await d();
    // 사용자 요청 스펙에 맞춘 필드 매핑 (images 포함)
    const data = mockMyProducts.map(p => ({
      ...p,
      images: p.thumbnailUrl ? [{ id: 0, imageUrl: p.thumbnailUrl }] : []
    }));
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '조직 조회 성공',
      data: data
    });
  }),
  http.post(`${BASE}/users/region-verify`, async ({ request }) => {
    await d();
    const body = await request.json() as { region: string };
    if (body.region) {
      mockUser.regionName = body.region;
    }
    return HttpResponse.json({ message: 'ok' });
  }),
  http.get(`${BASE}/users/me/transactions`, async () => {
    await d();
    return HttpResponse.json({ data: { content: mockTransactions } });
  }),
  http.get(`${BASE}/users/:userId/purchases`, async () => {
    await d();
    const data = mockTransactions.map(t => ({
      id: t.id,
      productId: t.productId,
      productTitle: t.productTitle,
      amount: t.price,
      paymentMethod: 'TRANSFER',
      status: 'COMPLETED',
      createdAt: t.createdAt,
    }));
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '구매 내역 조회 성공',
      data,
    });
  }),
  http.get(`${BASE}/users/me/products`, async () => {
    await d();
    return HttpResponse.json({ data: { content: mockMyProducts } });
  }),
  http.post(`${BASE}/users/me/region`, async ({ request }) => {
    await d();
    try {
      const body = await request.json() as { region: string };
      if (body.region) {
        mockUser.regionName = body.region;
      }
    } catch (e) { }
    return HttpResponse.json({ message: 'ok' });
  }),

  // ── Accounts ──────────────────────────────────────────────────────────
  http.post(`${BASE}/accounts`, async () => {
    await d(500);
    return HttpResponse.json({ data: { id: 1, bankCode: '004', bankName: 'KB국민은행', accountNumber: '****1234' } });
  }),
  http.post(`${BASE}/accounts/:id/verify/send`, async () => {
    await d(800);
    return HttpResponse.json({ message: '1원 송금 완료' });
  }),
  http.post(`${BASE}/accounts/:id/verify/confirm`, async () => {
    await d(500);
    return HttpResponse.json({ data: { verified: true } });
  }),

  // ── Products (페이지네이션 지원) ────────────────────────────────────────
  http.get(`${BASE}/v1/products`, async ({ request }) => {
    await d();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 0);
    const query = url.searchParams.get('q') ?? undefined;
    return HttpResponse.json({ data: paginateProducts(page, query) });
  }),
  http.get(`${BASE}/v1/products/:id`, async ({ params }) => {
    await d();
    const id = Number(params.id);
    return HttpResponse.json({ data: { ...mockProductDetail, id } });
  }),
  http.post(`${BASE}/v1/products`, async () => {
    await d(600);
    return HttpResponse.json({ data: { id: 99 } });
  }),
  http.patch(`${BASE}/v1/products/:id/status`, async () => {
    await d();
    return HttpResponse.json({ message: 'ok' });
  }),
  http.post(`${BASE}/v1/products/:id/wish`, async ({ params }) => {
    await d(200);
    const id = Number(params.id);
    const wasWished = id === 2 || id === 8;
    return HttpResponse.json({ data: { isWished: !wasWished } });
  }),

  // ── Chats ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/chats/rooms`, async () => {
    await d();
    return HttpResponse.json({ data: { content: mockChatRooms } });
  }),
  http.post(`${BASE}/chats/rooms`, async ({ request }) => {
    await d(400);
    const body = await request.json() as Record<string, unknown>;
    const productId = Number(body.productId ?? 1);
    const existing = mockChatRooms.find((r) => r.productId === productId);
    if (existing) return HttpResponse.json({ data: existing });
    return HttpResponse.json({ data: { ...mockChatRooms[0], id: 99, productId } });
  }),
  http.get(`${BASE}/chats/rooms/:roomId`, async ({ params }) => {
    await d();
    const id = Number(params.roomId);
    const room = mockChatRooms.find((r) => r.id === id) ?? mockChatRooms[0];
    return HttpResponse.json({ data: room });
  }),
  http.get(`${BASE}/chats/rooms/:roomId/messages`, async () => {
    await d();
    return HttpResponse.json({ data: { content: mockChatMessages } });
  }),

  // ── Transfers ─────────────────────────────────────────────────────────
  http.post(`${BASE}/transfers`, async () => {
    await d(400);
    return HttpResponse.json({ data: { id: 1 } });
  }),
];
