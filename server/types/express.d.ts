export {};

declare global {
  namespace Express {
    export interface Request {
      loginInfo?: {
        userId?: number;
        email?: string;
      };
    }
  }
}
