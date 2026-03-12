export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REISSUE: '/auth/reissue',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    SIGNUP: '/users/signup',
    MY_WISHES: '/users/me/wishes',
    MY_TRANSACTIONS: '/users/me/transactions',
    REGION: '/users/me/region',
  },
  ACCOUNTS: {
    BASE: '/accounts',
    VERIFY_SEND: (id: number) => `/accounts/${id}/verify/send`,
    VERIFY_CONFIRM: (id: number) => `/accounts/${id}/verify/confirm`,
  },
  PRODUCTS: {
    BASE: '/v1/products',
    DETAIL: (id: number) => `/v1/products/${id}`,
    STATUS: (id: number) => `/v1/products/${id}/status`,
    WISH: (id: number) => `/v1/products/${id}/wish`,
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
