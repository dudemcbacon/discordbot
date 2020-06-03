const { MessageAttachment, MessageEmbed } = require('discord.js');

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

module.exports.notifyDiscord = (channel, image, payload, action) => {
  let locationText = '';
  if (payload.Player) {
    locationText = payload.Player.publicAddress;
  }

  let footer = '';
  if (action === 'added') {
    footer = `${action} by ${payload.Account.title} on ${payload.Server.title} ${locationText}`;
  } else {
    footer = `${action} by ${payload.Account.title} on ${payload.Player.title} from ${payload.Server.title} ${locationText}`;
  }

  const attachment = new MessageAttachment(image);
  const embed = new MessageEmbed()
    // Set the title of the field
    .attachFiles([attachment])
    .setTitle(formatTitle(payload.Metadata))
    .setThumbnail('attachment://file.jpg')
    // Set the color of the embed
    .setColor(0xa67a2d)
    // Set the main content of the embed
    .setDescription(formatSubtitle(payload.Metadata))
    .setFooter(footer);

  channel.send(embed);
};
