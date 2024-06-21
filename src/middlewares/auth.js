const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/constants');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, doc, info) => {
  if (err || info || !doc) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  if (doc.category) req.community = doc;
  else req.user = doc;
  if (requiredRights.length) {
    const docRights = roleRights.get(doc.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => docRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.docId !== doc.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

const verifyCallback2 = (req, resolve, reject, requiredRights) => async (err, community, info) => {
  if (err || info || !community) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  req.community = community;
  if (requiredRights.length) {
    const communityRights = roleRights.get(community.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => communityRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.communityId !== community.id)
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

const authTwitter =
  (...requiredRights) =>
  async (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate('tweet-user', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err) => next(err));

const authTwitter2 =
  (...requiredRights) =>
  async (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate('tweet-community', { session: false }, verifyCallback2(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err) => next(err));

module.exports = { auth, authTwitter, authTwitter2 };
