const winston = require('winston');
const path = require('path');
const WinstonDailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`);
const rotateTransport = new WinstonDailyRotateFile({
  filename: path.join(__dirname, '../../log/app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '7d',
});
const winstonConfig = {
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    rotateTransport,
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
};

const logger = winston.createLogger(winstonConfig);
module.exports = logger;
