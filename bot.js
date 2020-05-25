const express = require('express');
const morgan = require('morgan');
const { loggers } = require('winston');

require('./util/logger.js');

const { donk } = require('./commands/donk.js');
const { doubledank } = require('./commands/doubledank.js');
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

// Initialize Discord Commands
client.on('message', donk);
client.on('message', doubledank);

client.login(discordkey);
