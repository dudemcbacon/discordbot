const Discord = require('discord.js');
// const schedule = require('node-schedule');
// const superagent = require('superagent');
const Chance = require('chance');
const winston = require('winston');
const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const sharp = require('sharp');
const request = require('request-promise-native');
const health = require('@cloudnative/health-connect');

const healthcheck = new health.HealthChecker();

const upload = multer({ storage: multer.memoryStorage() });

const client = new Discord.Client();
const chance = new Chance();

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'coolbot' },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

const plexChannel = '713909279345606657';

if (process.env.DISCORD_BOT_KEY === undefined) {
  logger.error('DISCORD_BOT_KEY must be defined in the environment');
  process.exit(1);
}
const discordkey = process.env.DISCORD_BOT_KEY;

if (process.env.PORT === undefined) {
  logger.error('PORT must be defined in the environment');
  process.exit(1);
}
const port = process.env.PORT;

// Initialize express and define a port
const app = express();
app.use(morgan('dev'));

function formatTitle(metadata) {
  if (metadata.grandparentTitle) {
    return metadata.grandparentTitle;
  }

  let ret = metadata.title;
  if (metadata.year) {
    ret += ` (${metadata.year})`;
  }
  return ret;
}

function formatSubtitle(metadata) {
  let ret = '';

  if (metadata.grandparentTitle) {
    if (metadata.type === 'track') {
      ret = metadata.parentTitle;
    } else if (metadata.index && metadata.parentIndex) {
      ret = `S${metadata.parentIndex} E${metadata.index}`;
    } else if (metadata.originallyAvailableAt) {
      ret = metadata.originallyAvailableAt;
    }

    if (metadata.title) {
      ret += ` - ${metadata.title}`;
    }
  } else if (metadata.type === 'movie') {
    ret = metadata.tagline;
  }

  return ret;
}

function notifyDiscord(channel, image, payload, action) {
  const locationText = payload.Player.publicAddress;

  const attachment = new Discord.MessageAttachment(image);
  const embed = new Discord.MessageEmbed()
    // Set the title of the field
    .attachFiles([attachment])
    .setTitle(formatTitle(payload.Metadata))
    .setThumbnail('attachment://file.jpg')
    // Set the color of the embed
    .setColor(0xa67a2d)
    // Set the main content of the embed
    .setDescription(formatSubtitle(payload.Metadata))
    .setFooter(`${action} by ${payload.Account.title} on ${payload.Player.title} from ${payload.Server.title} ${locationText}`, payload.Account.thumb);

  channel.send(embed);
}

// superagent
// .get('http://10.0.10.26:7878/api/history?apikey=e848d68d67b44d2bb52703fff12b2f47&page=1&pageSize=100')
// .set('accept', 'json')
// .end((err, res) => {
// res.body.records.forEach(element => {
// if (element.eventType === "downloadFolderImported") {
// console.log(element.movie.title);
// }
// });
// });

client.on('ready', () => {
  logger.info('Hello, CoolBot has logged into Discord!');


  /* eslint-disable consistent-return */
  app.post('/hook', upload.single('thumb'), async (req, res) => {
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
    if ((payload.event === 'media.scrobble' && isVideo) || payload.event === 'media.rate') {
      let action;

      if (payload.event === 'media.scrobble') {
        action = 'played';
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
    } else {
      channel.send(`Received unhandled Plex event: ${payload.event}`);
      logger.info(`Payload: ${JSON.stringify(payload)}`);
    }

    res.send({ status: 'SUCCESS' });
  });
  /* eslint-enable consistent-return */

  app.use('/live', health.LivenessEndpoint(healthcheck));
  app.use('/ready', health.ReadinessEndpoint(healthcheck));
  app.use('/health', health.HealthEndpoint(healthcheck));

  app.listen(port, () => logger.info(`CoolBot is listening for webhooks on port ${port}`));
  // const j = schedule.scheduleJob('* * * * *', function(){
  // console.log("pooping");
  // client.channels.cache.get("460558427823800330").send("i poop every minute");
  // });
});

// client.on('message', (msg) => {
// console.log(msg.author.username);
// if (msg.author.username === 'dukeofwilshire') {
// msg.reply('Shut up.');
// }
// });

client.on('message', (msg) => {
  if (msg.content.includes('donk')) {
    const parsedUsers = [];
    msg.mentions.users.forEach((user) => {
      const u = {};
      u.id = user.id;
      u.username = user.username;
      u.one = chance.d6();
      u.two = chance.d6();
      u.total = user.one + user.two;
      parsedUsers.append(u);
    });
    const sorted = parsedUsers.sort((a, b) => ((a.total > b.total) ? 1 : -1));
    let string = '';
    sorted.forEach((user) => {
      logger.info(`poop ${user.username}`);
      string += `<@!${user.id}> - ${user.total} (${user.one} ${user.two})\n`;
    });
    msg.reply(`here is your turn order...
---------------
${string}`);
  }
});

client.on('message', (msg) => {
  if (msg.content.startsWith('!doubledank')) {
    let dankest = '';
    const danker = msg.content.replace('!doubledank ', '').replace(/[.,#!$%^&*;:{}=\-_~()]/g, '').toLowerCase();
    danker.split('').forEach((letter) => {
      switch (letter) {
        case 'a':
        case 'b':
          dankest = `${dankest}:${letter}: `;
          break;
        case ' ':
          dankest += '  ';
          break;
        default:
          dankest = `${dankest}:regional_indicator_${letter}: `;
      }
    });
    logger.info(`${msg.author.username} is danking it up: ${dankest}`);
    msg.channel.send(dankest);
  }
});


client.login(discordkey);
