export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REISSUE: '/auth/reissue',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    SIGNUP: '/users/signup',
    MY_WISHES: (id: number) => `/users/${id}/wishes`,
    MY_TRANSACTIONS: (id: number) => `/users/${id}/purchases`,
    REGION: (id: number) => `/users/${id}/region`,

    PROFILE: (id: number) => `/users/${id}`,
    REGION_VERIFY: (id: number) => `/users/${id}/region-verify`,
    GET_USER_PRODUCTS: (id: number) => `/users/${id}/products`,
    GET_USER_PURCHASES: (id: number) => `/users/${id}/purchases`,
    GET_USER_WISHES: (id: number) => `/users/${id}/wishes`,
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
    READ: (roomId: number) => `/chat/rooms/${roomId}/read`,
  },
  TRANSFERS: {
    BASE: '/transfers',
  },
} as const;
