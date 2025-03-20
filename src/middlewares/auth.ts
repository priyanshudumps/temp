import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/constants';

interface VerifyCallback {
  (err: Error | null, doc: any, info: any): Promise<void>;
}

const verifyCallback =
  (req: Request, resolve: Function, reject: Function, requiredRights: string[]) => 
  async (err: Error | null, doc: any, info: any) => {
    if (err || info || !doc)
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    if (doc.category) req.community = doc;
    else req.user = doc;
    if (requiredRights.length) {
      const docRights = roleRights.get(doc.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        docRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.docId !== doc.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }
    resolve();
  };

const verifyCallback2 =
  (req: Request, resolve: Function, reject: Function, requiredRights: string[]) => 
  async (err: Error | null, community: any, info: any) => {
    if (err || info || !community)
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    req.community = community;
    if (requiredRights.length) {
      const communityRights = roleRights.get(community.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        communityRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.communityId !== community.id)
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
    }
    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

const authTwitter =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
      passport.authenticate(
        "tweet-user",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

const authTwitter2 =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) =>
    new Promise((resolve, reject) => {
      passport.authenticate(
        "tweet-community",
        { session: false },
        verifyCallback2(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

export { auth, authTwitter, authTwitter2 };