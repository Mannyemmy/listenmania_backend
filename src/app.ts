import express, { Express } from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config';
import { morgan } from './modules/logger';
import { jwtStrategy } from './modules/auth';
import { authLimiter } from './modules/utils';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import routes from './routes/v1';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';

const app: Express = express();



// if (config.env !== 'test') {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// // set security HTTP headers
// app.use(helmet());

// // enable cors
// app.use(cors());
// app.options('*', cors());





// // gzip compression
// app.use(compression());



export default app;
