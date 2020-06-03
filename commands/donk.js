const chance = require('chance');
const { loggers } = require('winston');

const logger = loggers.get('discordbot');

module.exports = {
  name: 'donk',
  description: 'Rolls the donking dice.',
  aliases: [],
  usage: '[@player]...',
  execute: (message) => {
    const parsedUsers = [];
    message.mentions.users.forEach((user) => {
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
    message.reply(`here is your turn order...
---------------
${string}`);
  },
};
