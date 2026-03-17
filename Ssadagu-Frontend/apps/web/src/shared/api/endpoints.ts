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
    BASE: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    STATUS: (id: number) => `/products/${id}/status`,
    WISH: (id: number) => `/products/${id}/wish`,
  },
  CHATS: {
    USER_ROOMS: '/chat/rooms/user',
    CREATE: '/chat/rooms',
    DETAIL: (roomId: number) => `/chat/rooms/${roomId}`,
    MESSAGES: (roomId: number) => `/chat/rooms/${roomId}/messages`,
  },
  TRANSFERS: {
    BASE: '/transfers',
  },
} as const;
