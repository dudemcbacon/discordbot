const { loggers } = require('winston');

const logger = loggers.get('discordbot');

if (process.env.DISCORD_BOT_KEY === undefined) {
  logger.error('DISCORD_BOT_KEY must be defined in the environment');
  process.exit(1);
}
const discordkey = process.env.DISCORD_BOT_KEY;

if (process.env.PLEX_CHANNEL === undefined) {
  logger.error('PLEX_CHANNEL must be defined in the environment');
  process.exit(1);
}
const plexChannel = process.env.PLEX_CHANNEL;

if (process.env.PLEX_TOKEN === undefined) {
  logger.error('PLEX_TOKEN must be defined in the environment');
  process.exit(1);
}
const plexToken = process.env.PLEX_TOKEN;

if (process.env.PORT === undefined) {
  logger.error('PORT must be defined in the environment');
  process.exit(1);
}
const port = process.env.PORT;

module.exports = {
  discordkey,
  plexChannel,
  plexToken,
  port,
};
