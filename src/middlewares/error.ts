import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  path?: string;
  value?: any;
  code?: number;
  errors?: { [key: string]: { message: string } };
}

const handleCastErrorDB = (err: ExtendedError): string => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return message;
};

const handleDuplicateFieldsDB = (err: ExtendedError): string => {
  // eslint-disable-next-line security/detect-unsafe-regex
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `${value} already exists, Please use another value!`;
  return message;
};

const handleValidationErrorDB = (err: ExtendedError): string => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `${errors.join(". ")}`;
  return message;
};

export const errorConverter = (err: ExtendedError, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;
  if (error.name === "CastError") error.message = handleCastErrorDB(error);
  if (error.code === 11000) error.message = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError")
    error.message = handleValidationErrorDB(error);
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    // eslint-disable-next-line security/detect-object-injection
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction): void => {
  let { statusCode, message } = err;
  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    status: err.status,
    ...(config.env === "development" && { error: err }),
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};