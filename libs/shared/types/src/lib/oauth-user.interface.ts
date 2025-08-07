// oauth-user.interface.ts
export interface OAuthUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

// Extend Request:
declare global {
  namespace Express {
    interface Request {
      oauthUser?: OAuthUser;
    }
  }
}
