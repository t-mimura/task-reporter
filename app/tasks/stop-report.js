'use strict';

const ReportManager = require('../report-manager');

/**
 * 報告会を途中で終了します。
 */
module.exports = (controller, bot, message) => {
  if (ReportManager.isReportingNow(message.channel)) {
    ReportManager.stopReport(bot, message.channel);
    bot.reply(message, 'そっと終了しました。:yum:');
  } else {
    bot.reply(message, '始まっていませんよー。:hatching_chick:');
  }
};
