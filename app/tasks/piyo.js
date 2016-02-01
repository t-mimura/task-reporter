'use strict';

/*
 * piyo chicken 疎通確認用です。
 */
module.exports = (controller, bot, message) => {
  bot.say({
    text: ':hatched_chick:',
    channel: message.channel
  });
};
