'use strict';

const rmUtils = require('../report-manager-utils');

/*
 * 報告者を設定します。
 * ex) @bot member @member1 @member2 ...
 */
module.exports = (controller, bot, message) => {
  const params = message.text.split(/\s/);
  const members = [];
  let unknownMemberExist = false;

  if (params.shift() !== 'member') {
    return;
  }
  if (params.length === 0) {
    bot.reply(message, 'ちゃんと教えてください.:expressionless:');
    return;
  }
  params.forEach((param) => {
    const matches = param.match(/<@([^>]+)>/);
    if (!matches || matches.length === 0) {
      unknownMemberExist = true;
    } else {
      members.push(matches[1]);
    }
  });
  if (unknownMemberExist) {
    bot.reply(message, 'あれ、知らない人が混じっているようです。:frowning:');
    return;
  }

  // storageに保存
  rmUtils.actWithChannel(controller.storage, bot, message, (channel) => {
    if (!channel) {
      channel = {
        id: message.channel
      }
    }
    channel.members = members;
    controller.storage.channels.save(channel, (err, id) => {
      bot.reply(message, '承知いたしました！:ok_woman:');
    });
  });
}
