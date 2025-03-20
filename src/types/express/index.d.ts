import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    // Extend Express Request object to include custom properties
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      community?: {
        id: string;
        role: string;
        category?: string;
        [key: string]: any;
      };
    }
  }
}

export {};