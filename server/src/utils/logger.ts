import pino from 'pino';
import pinoCaller from 'pino-caller';

const isProduction = process.env.NODE_ENV === 'production';

const baseLogger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
export const logger = !isProduction ? pinoCaller(baseLogger) : baseLogger;