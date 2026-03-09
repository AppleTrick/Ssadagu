export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCT_DETAIL: (id: number) => `/products/${id}`,
  PRODUCT_NEW: '/products/new',
  CHAT_LIST: '/chat',
  CHAT_ROOM: (roomId: number) => `/chat/${roomId}`,
  MY: '/my',
  MY_ACCOUNT: '/my/account',
  MY_PRODUCTS: '/my/products',
  MY_TRANSACTIONS: '/my/transactions',
  MY_WISHES: '/my/wishes',
} as const;
