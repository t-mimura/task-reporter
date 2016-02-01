'use strict';

const rmUtils = require('./report-manager-utils');
const fs = require('fs');
const path = require('path');

const REACTION_FILE_PATH = path.resolve('./.task-reporter/reaction.json');
const REACTION_ICON_WEIGHT = (() => {
  if (fs.existsSync(REACTION_FILE_PATH)) {
    return JSON.parse(fs.readFileSync(REACTION_FILE_PATH, 'utf8'));
  } else {
    return [
      { weight: 1, value: ['+1']},
      { weight: 1, value: ['ok_woman']},
      { weight: 1, value: ['eyes']}
    ];
  }
})();

/**
 * 報告者の報告に対するリアクション（アイコン）をランダムで取得します。
 * @return アイコン用の文字列 ex) :smile:
 */
function getReactionIcon() {
  return rmUtils.randamWithWeight(REACTION_ICON_WEIGHT);
}

/**
 * 報告会を管理するクラスです。
 * 次の機能があります。
 * - チャネルごとの報告会の開始
 * - チャネルごとに報告会(Reporterオブジェクト)を保持
 * - メンションのチャネルごとの振り分け
 */
class ReportManager {
  /**
   * ReportManagerを生成します。
   */
  constructor() {
    this.reportings = {};
  }
  /**
   * 報告会(の司会)を開始します。
   * @param bot bot
   * @param channel channel id
   * @param members 報告する対象メンバー(user id の配列)
   * @param onFinish 正常に終了した際に呼ばれるコールバック関数
   */
  startReport(bot, channel, members, onFinish) {
    const reporter = new Reporter(bot, channel, members, () => {
      if (onFinish)  {
        onFinish();
      }
      delete this.reportings[channel];
    });
    this.reportings[channel] = reporter;
    reporter.start();
  }
  /**
   * 報告会を途中で終了します。
   * この場合、終了時のコールバック関数は呼ばれません。
   * @param bot bot
   * @param channel channel id
   */
  stopReport(bot, channel) {
    if (this.isReportingNow(channel)) {
      delete this.reportings[channel];
    }
  }
  /**
   * 当該BOT宛てのdirect mentionを受けたときの処理を行います。
   * メッセージのチャンネルで報告会が開始されていれば、Reporterオブジェクトへ
   * direct mentionを通知します。
   * @param message 受けたメッセージ
   * @return 処理を行った場合は `true`
   */
  onDirectMention(message) {
    const reporter = this.reportings[message.channel];
    let result = false;
    if (reporter) {
      result = reporter.onDirectMention(message);
    }
    return result;
  }
  /**
   * 指定のチャネルで報告会が行われているか調べます。
   * @param channel channel id
   * @return 行われている場合 `true`
   */
  isReportingNow(channel) {
    return this.reportings[channel] !== undefined;
  }
}

/**
 * 一つの報告会(の司会)を表すクラスです。
 * 与えられたメンバーに対して報告をうながし、回答があれば次のメンバーにうながすという流れで処理を行います。
 */
class Reporter {
  /**
   * Reporterを生成します。
   * @param bot bot
   * @param channel channel id
   * @param members 報告する対象メンバー(user idの配列)
   * @param onFinish 終了したときに実行するコールバック(オブション)
   */
  constructor(bot, channel, members, onFinish) {
    this.bot = bot;
    this.channel = channel;
    this.members = members;
    this.onFinish = onFinish;
  }
  /**
   * 報告会を開始します。
   */
  start() {
    this.current = 0;
    this.report();
  }
  /**
   * 次の人に対して報告をうながします。
   */
  report() {
    this.waiting = this.members[this.current];
    this.bot.say({
      text: '<@' + this.waiting + '> さん、お願いします！！',
      channel: this.channel
    });
  }
  /**
   * 報告対象を次に進めます。
   * 次の人がいなければ終わります。
   */
  next() {
    this.current++;
    if (this.members.length <= this.current) {
      if (this.onFinish ) {
        this.onFinish();
      }
    } else {
      this.report();
    }
  }
  /**
   * direct mentionを受けたときの処理を行います。
   * メッセージの送信者が報告をうながした人であれば、次に進みます。
   * @param message
   * @return 処理をした場合 `true`
   */
  onDirectMention(message) {
    if (message.user === this.waiting) {
      const icons = getReactionIcon();
      icons.forEach((icon) => {
        this.bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: icon,
        }, (err) => {
          if (err) { console.log(err) }
        });
      });
      this.next();
      return true;
    } else {
      return false;
    }
  }
}

module.exports = new ReportManager();
