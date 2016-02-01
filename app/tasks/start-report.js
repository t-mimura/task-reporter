'use strict';

const rmUtils = require('../report-manager-utils');
const ReportManager = require('../report-manager');

/**
 * 報告の司会を始めます。
 * @param bot bot
 * @param message message
 * @param members 報告を求める人たち
 */
function startReport(bot, message, members) {
  members = rmUtils.randamize(members);
  ReportManager.startReport(bot, message.channel, members, () => {
    bot.reply(message, '全員終わりましたー。ありがとうございましたー！！:sunny:');
  });
};

/*
 * 報告の司会を始めます。
 * ストレージに保存してある、該当チャンネルのメンバーを対象にして {@link startReport}を呼び出します。
 */
module.exports = (controller, bot, message) => {
  rmUtils.actWithChannel(controller.storage, bot, message, (channel) => {
    if (ReportManager.isReportingNow(message.channel)) {
      bot.reply(message, 'もう始まってるよ. :hatched_chick: ');
      return;
    }
    startReport(bot, message, channel.members);
  });
};
