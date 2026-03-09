export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REISSUE: '/auth/reissue',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    MY_WISHES: '/users/me/wishes',
    MY_TRANSACTIONS: '/users/me/transactions',
  },
  ACCOUNTS: {
    BASE: '/accounts',
    VERIFY_SEND: (id: number) => `/accounts/${id}/verify/send`,
    VERIFY_CONFIRM: (id: number) => `/accounts/${id}/verify/confirm`,
  },
  PRODUCTS: {
    BASE: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    STATUS: (id: number) => `/products/${id}/status`,
    WISH: (id: number) => `/products/${id}/wish`,
  },
  CHATS: {
    ROOMS: '/chats/rooms',
    CREATE: '/chats/rooms',
    MESSAGES: (roomId: number) => `/chats/rooms/${roomId}/messages`,
  },
  TRANSFERS: {
    BASE: '/transfers',
  },
} as const;
