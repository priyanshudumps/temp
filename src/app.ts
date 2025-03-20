import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import jobs from './jobs';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

jobs.startJobs();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '10kb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// v1 api routes
app.use('/', routes);

// show server status on / route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;