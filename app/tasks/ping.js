'use strict';

/*
 * ping pong 疎通確認用です。
 */
module.exports = (controller, bot, message) => {
  bot.say({
    text: ':champagne:',
    channel: message.channel
  });
};
