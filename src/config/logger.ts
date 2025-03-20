import winston from 'winston';
import config from './config';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(), 
    winston.format.errors({ stack: true }), 
    winston.format.splat(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`
    ) // Include timestamp in log message
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;