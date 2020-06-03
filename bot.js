const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const { loggers } = require('winston');
const { Collection } = require('discord.js');

require('./util/logger.js');

const { router } = require('./routes/index.js');
const { client } = require('./util/client.js');
const { discordkey, port } = require('./util/environment.js');

const logger = loggers.get('discordbot');

// Initialize Express
const app = express();
app.use(morgan('combined', { stream: logger.stream }));
app.use('/', router);

client.on('ready', () => {
  logger.info('Hello, CoolBot has logged into Discord!');

  app.listen(port, () => logger.info(`CoolBot is listening for webhooks on port ${port}`));
});

// Load Dynamic Commands
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  /* eslint-disable import/no-dynamic-require, global-require */
  const command = require(`./commands/${file}`);
  /* eslint-enable import/no-dynamic-require, global-require */
  client.commands.set(command.name, command);
});

client.on('message', (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${command.name} ${command.usage}\``;
    }

    message.channel.send(reply);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    logger.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(discordkey);
