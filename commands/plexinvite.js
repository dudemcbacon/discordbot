const { loggers } = require('winston');
const superagent = require('superagent');
const { parseString } = require('xml2js');

const { plexToken } = require('../util/environment.js');

const logger = loggers.get('discordbot');

module.exports = {
  name: 'plexinvite',
  description: 'Generate an invite to CoolBot\'s Plex server.',
  usage: 'plexinvite [email]',
  execute: (message, args) => {
    const email = args[0];
    logger.info(`Validating e-mail address ${email}`);
    superagent
      .post('https://plex.tv/api/users/validate')
      .query({ invited_email: email })
      .query({ 'X-Plex-Token': plexToken })
      .then((res) => {
        parseString(res.body, (err, result) => {
          if (result.Response.$.code === '0') {
            logger.info('Validated Plex e-mail');
            message.reply('e-mail valid.');

            const postData = {
              machineIdentifier: '46efdc9ee8e7912c069a3ea90fa4824665b916da',
              librarySectionIds: [],
              settings: {
                allowSync: '0',
                allowCameraUpload: '0',
                filterMovies: '',
                filterTelevision: '',
                filterMusic: '',
              },
              invitedEmail: email,
            };

            let req = superagent
              .post('https://plex.tv/api/users/shared_servers')
              .query({ 'X-Plex-Token': plexToken })
              .query({ 'X-Plex-Client-Identifier': '95mueir09vdtgkqeoighfg7h' })
              .set('Content-Type', 'application/json')
              .send(postData)
              .then((res) => {
                logger.info('Created server share');
                message.reply('an e-mail has been sent to you.');
              })
              .catch((err) => {
                logger.error(`Error creating server_share: ${err}`);
              });
          } else {
            logger.warn('Could not validate e-mail address');
            message.reply('I couldn\'t validate your e-mail address');
          }
        });
      })
      .catch((err) => {
        logger.error(`Error validating e-mail address: ${err}`);
      });
  },
};
