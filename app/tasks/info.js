'use strict';

const rmUtils = require('../report-manager-utils');

/*
 * チャネルの設定を表示します。
 */
module.exports = (controller, bot, message) => {
  rmUtils.actWithChannel(controller.storage, bot, message, (channel) => {
    let info = '<#' + message.channel + '> :information_desk_person:\n';
    if (channel.members && channel.members.length > 0) {
      info += '`報告する人`: ' + channel.members.map(member => '<@' + member + '>').join(', ') + '\n';
    } else {
      info += '誰も設定されていないようです.\n';
    }

    // TODO: 時間

    bot.reply(message, info);
  });
}
