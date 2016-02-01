'use strict';

// 外部モジュールの読み込み
const fs = require('fs');
const Botkit = require('botkit');

// 内部モジュール
const ReportManager = require('./app/report-manager');
const rmUtils = require('./app/report-manager-utils');

// 定数定義
const MENTIONS = ['mention', 'direct_mention'];
const DM = ['direct_message'];
const DM_AND_MENTIONS = [].concat(DM).concat(MENTIONS);

// このファイル内全体で使う変数の定義
const isDebug = process.env.NODE_ENV === 'deployment';
const token = fs.readFileSync('BOT_TOKEN', 'utf8').trim();
const controller = Botkit.slackbot({
  debug: isDebug,
  json_file_store: '.storage'
});
const commands = [
  { pattern: /^help/, task: require('./app/tasks/help') },
  { pattern: /^info/, task: require('./app/tasks/info') },
  { pattern: /^member/, task: require('./app/tasks/member') },
  { pattern: /^start report/, task: require('./app/tasks/start-report') },
  { pattern: /^stop report/, task: require('./app/tasks/stop-report') },
  { pattern: /^piyo/, task: require('./app/tasks/piyo') },
  { pattern: /^ping$/, task: require('./app/tasks/ping') }
];

// BOTを開始します。
controller.spawn({ token }).startRTM();

/*
 * この子の会話は全てここから始まります。
 * controller.hearsは使っていません。
 * コマンド以外のdirect_mentionを全部拾って、報告かどうかを調べる必要があるためです。
 * (hearsで拾ったやつもon('direct_mention')で通知されてしまうが、
 *  hearsで拾ったかどうかはon('direct_mention')からは分からないので、
 *  on('direct_mention')で一括で行うことで処理の振り分けをする。)
 */
controller.on('direct_mention', (bot, message) => {
  rmUtils.actWithCatch(bot, message, () => {
    let commandFound = false;
    commands.forEach((command) => {
      if (command.pattern.test(message.text)) {
        commandFound = true;
        command.task(controller, bot, message);
      }
    });
    if (!commandFound) {
      ReportManager.onDirectMention(message);
    }
  });
});
