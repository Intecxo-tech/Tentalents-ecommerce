import { createLogger, format, transports } from 'winston';
import type { TransformableInfo } from 'logform'; // winston uses 'logform' types for formatters

const { combine, timestamp, printf, colorize, errors, json } = format;

const serviceName = process.env.LOG_SERVICE_NAME || 'unknown-service';
const isProduction = process.env.NODE_ENV === 'production';

const devFormat = printf((info: TransformableInfo) => {
  // Now info.level, info.message, info.timestamp, info.stack have proper types
  const { level, message, timestamp, stack } = info;
  return `[${timestamp}] [${serviceName}] ${level}: ${stack || message}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isProduction
      ? json()
      : combine(colorize({ all: true }), devFormat)
  ),
  defaultMeta: { service: serviceName },
  transports: [new transports.Console()],
});
