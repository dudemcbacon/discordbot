const Discord = require('discord.js');
const client = new Discord.Client();

const schedule = require('node-schedule');


const superagent = require('superagent');

const Chance = require('chance');

let chance = new Chance();


// callback
superagent
  .get('http://10.0.10.26:7878/api/history?apikey=e848d68d67b44d2bb52703fff12b2f47&page=1&pageSize=100')
  .set('accept', 'json')
  .end((err, res) => {
    // Calling the end function will send the request
    res.body.records.forEach(element => {
      if (element.eventType === "downloadFolderImported") {
				console.log(element.movie.title);
			}
		});
  });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.cache.get("460558427823800330").send("Hey <@!194641343140593669>, have you done your dailies?");

  const j = schedule.scheduleJob('* * * * *', function(){
    console.log("pooping");
    client.channels.cache.get("460558427823800330").send("i poop every minute");
  });
});

client.on('message', msg => {
  console.log(msg.author.username);
  if (msg.author.username === 'dukeofwilshire') {
      msg.reply('Shut up.');
    }
});

client.on('message', msg => {
  if (msg.content.includes('donk')) {
      msg.mentions.users.forEach(user => {
        user.one = chance.d6();
        user.two = chance.d6();
        user.total = user.one + user.two;
      });
      let sorted = msg.mentions.users.sort((a, b) => (a.total > b.total) ? 1 : -1);
      let string = "";
      sorted.forEach(user => {
        console.log(`poop ${user.username}`);
        string += `<@!${user.id}> - ${user.total} (${user.one} ${user.two})\n`;
      });
      msg.reply(`here is your turn order...
---------------
${string}`);
    }
});

client.login('NjkyMjEyMTA2MjIwNTM1ODI5.XnrPpQ.3oAEw10MAz_PVS1TCQI7f8s3uCs');
