export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type VerifiedStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export interface User {
  id: number;
  email: string;
  nickname: string;
  status: UserStatus;
  createdAt: string;
}

export interface UserAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isPrimary: boolean;
  verifiedStatus: VerifiedStatus;
  verifiedAt: string | null;
}
