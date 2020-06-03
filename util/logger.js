const winston = require('winston');

// Configure Logging
winston.loggers.add('discordbot', {
  level: 'info',
  defaultMeta: { service: 'coolbot' },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

const logger = winston.loggers.get('discordbot');

logger.stream = {
  write: (message) => {
    logger.info(message, { logtype: 'access' });
  },
};
