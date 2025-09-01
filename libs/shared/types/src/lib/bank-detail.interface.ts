export interface BankDetail {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  upiId?: string;
  isVerified?: boolean;
  cancelledcheque?: string;
}
