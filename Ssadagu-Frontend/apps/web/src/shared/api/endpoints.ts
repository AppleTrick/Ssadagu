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
    MY: (userId: number) => `/accounts/users/${userId}`,
  },
  DEMAND_DEPOSITS: {
    GET_ACCOUNT: (accountNo: string) => `/demand-deposits/accounts/${accountNo}`,
    DEPOSIT: (accountNo: string) => `/demand-deposits/accounts/${accountNo}/deposit`,
    HISTORY: (accountNo: string) => `/demand-deposits/accounts/${accountNo}/transactions`,
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
  TRANSACTIONS: {
    REQUEST: '/transactions/request', // 결제 요청 (판매자)
    APPROVE: '/transactions/approve', // 결제 승인 (구매자)
    CANCEL: '/transactions/cancel',   // 거래 취소
    HISTORY: '/transactions/history', // 거래 내역 조회
  },
} as const;
