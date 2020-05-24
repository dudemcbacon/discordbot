const Discord = require('discord.js');
// const schedule = require('node-schedule');
// const superagent = require('superagent');
const Chance = require('chance');
const winston = require('winston');
const express = require('express');
const multer = require('multer');
const health = require('@cloudnative/health-connect');

const healthcheck = new health.HealthChecker();

const upload = multer();

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


  app.post('/hook', upload.none(), (req, res) => {
    const payload = JSON.parse(req.body.payload);
    logger.info(`Plex webhook received: ${payload.event}`);
    logger.info(`Payload: ${JSON.stringify(payload)}`);
    const channel = client.channels.cache.get(plexChannel);
    channel.send(`Plex event received: ${payload.event}`);
    res.send({ status: 'SUCCESS' });
  });

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
