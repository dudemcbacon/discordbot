const { loggers } = require('winston');

const logger = loggers.get('discordbot');

module.exports = {
  name: 'doubledank',
  description: 'Dank up a message.',
  aliases: [],
  usage: '[dank message]',
  execute: (message) => {
    let dankest = '';
    const danker = message.content.replace('!doubledank ', '').replace(/[.,#!$%^&*;:{}=\-_~()]/g, '').toLowerCase();
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
    logger.info(`${message.author.username} is danking it up: ${dankest}`);
    message.channel.send(dankest);
  },
};
