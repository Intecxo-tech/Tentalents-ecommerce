import { Request, Response, NextFunction } from 'express';
declare module 'express' {
    interface Request {
        oauthUser?: {
            uid: string;
            email?: string;
            name?: string;
            picture?: string;
            emailVerified?: boolean;
        };
    }
}
export declare const oauthMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=oauth.middleware.d.ts.map