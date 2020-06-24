import * as express from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import 'dotenv/config';

import logger from './config/winston_config';
import { sequelize } from './sequelize';
import indexRouter from './v1/index';

const CUSTOM: string = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

interface Err extends Error {
  status: number;
}

const portHttp = 8080;
const portHttps = 4343;
const ssl = true;

const app: Application = express();

sequelize.sync();
// sequelize.sync({ force: true });

app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan(CUSTOM, { stream: { write: (message: string) => logger.info(message) } }));
} else {
  app.use(morgan('dev'));
}

app.use(bodyParser.json());

app.use('/', indexRouter);

app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
  const error = new Error('404 NOT FOUND') as Err;
  error.status = 404;

  return next(error);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Err, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`NAME: ${err.name}, STATUE: ${err.status}, STACK: ${err.stack}`);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 400 });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(err.status || 500).json({ errName: err.name || 'InternalServerError' });
  }

  return res.status(err.status || 500)
    .json({ errName: err.name, errMsg: err.message, errStack: err.stack });
});

http.createServer(app).listen(portHttp, () => {
  logger.info(`HTTP SERVER LISTIENING ON PORT ${portHttp}`);
});

if (ssl) {
  const sslOptions = {
    ca: fs.readFileSync('/etc/letsencrypt/live/kay-cert/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/kay-cert/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/kay-cert/cert.pem'),
  };

  https.createServer(sslOptions, app).listen(portHttps, () => {
    logger.info(`HTTPS SERVER LISTIENING ON PORT ${portHttps}`);
  });
}
