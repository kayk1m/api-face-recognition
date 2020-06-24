import * as winston from 'winston';
import * as moment from 'moment';
import 'dotenv/config';
import * as appRootPath from 'app-root-path';

const { combine, label, printf } = winston.format;

// eslint-disable-next-line no-shadow
const myFormat = printf(({ level, message, label, timestamp }) => `${timestamp}[${label}] ${level}: ${message}`);

const appendTimestamp = winston.format((info, opts) => {
  const myInfo = info;
  if (opts.tz) {
    myInfo.timestamp = moment().tz(opts.tz).format();
  }
  return myInfo;
});

const options = {
  info_file: {
    level: 'info',
    filename: `${appRootPath}/logs/info.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'WST' }),
      appendTimestamp({ tz: 'Asia/Seoul' }),
      myFormat,
    ),
  },

  error_file: {
    level: 'error',
    filename: `${appRootPath}/logs/error.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'WST' }),
      appendTimestamp({ tz: 'Asia/Seoul' }),
      myFormat,
    ),
  },

  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
      label({ label: 'WINSTON' }),
      appendTimestamp({ tz: 'Asia/Seoul' }),
      myFormat,
    ),
  },
};

const logger = process.env.NODE_ENV === 'production'
  ? winston.createLogger({
    transports: [
      new winston.transports.File(options.info_file),
      new winston.transports.File(options.error_file),
      new winston.transports.Console(options.console),
    ],
    exitOnError: false,
  })
  : winston.createLogger({
    transports: [new winston.transports.Console(options.console)],
  });

// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File(options.info_file),
//     new winston.transports.File(options.error_file),
//   ],
//   exitOnError: false,
// });

export default logger;
