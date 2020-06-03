const request = require('request-promise-native');
const sharp = require('sharp');
const { loggers } = require('winston');
const { client } = require('../util/client.js');
const { plexChannel } = require('../util/environment.js');
const { notifyDiscord } = require('../util/util.js');

const logger = loggers.get('discordbot');

/* eslint-disable consistent-return */
module.exports.hook = async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  logger.info(`Plex webhook received: ${payload.event}`);
  const channel = client.channels.cache.get(plexChannel);

  const isVideo = (['movie', 'episode'].includes(payload.Metadata.type));
  const isAudio = (payload.Metadata.type === 'track');

  // missing required properties
  if (!payload.user || !payload.Metadata || !(isAudio || isVideo)) {
    return res.sendStatus(400);
  }

  // Get Image
  let buffer;
  let image;
  if (req.file && req.file.buffer) {
    buffer = req.file.buffer;
  } else if (payload.thumb) {
    logger.info('[REDIS]', `Retrieving image from  ${payload.thumb}`);
    buffer = await request.get({
      uri: payload.thumb,
      encoding: null,
    });
  }
  if (buffer) {
    image = await sharp(buffer)
      .resize({
        height: 75,
        width: 75,
        fit: 'contain',
        background: 'white',
      })
      .toBuffer();
  }

  // post to slack
  if ((payload.event === 'media.scrobble' && isVideo)
      || (payload.event === 'library.new' && isVideo)
      || payload.event === 'media.rate') {
    let action;

    if (payload.event === 'media.scrobble') {
      action = 'played';
    } else if (payload.event === 'library.new') {
      action = 'added';
    } else if (payload.rating > 0) {
      action = 'rated ';
      for (let i = 0; i < payload.rating / 2; i += 1) {
        action += ':star:';
      }
    } else {
      action = 'unrated';
    }

    if (image) {
      logger.info(`[DISCORD] Sending ${action} with image`);
      notifyDiscord(channel, image, payload, action);
    } else {
      logger.info(`[DISCORD] Sending ${action} without image`);
      notifyDiscord(channel, image, payload, action);
    }
  } else if ((payload.event === 'library.on.deck') || payload.event === 'library.new') {
    channel.send(`Received unhandled Plex event: ${payload.event}`);
    logger.info(`Payload: ${JSON.stringify(payload)}`);
  }

  res.send({ status: 'SUCCESS' });
};
