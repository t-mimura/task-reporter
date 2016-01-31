'use strict';

const fs = require('fs');
const Botkit = require('botkit');
const util = require('util');

const token = fs.readFileSync('BOT_TOKEN', 'utf8').trim();
const MENTIONS = ['mention', 'direct_mention'];
const DM = ['direct_message'];
const DM_AND_MENTIONS = [].concat(DM).concat(MENTIONS);

const isDebug = process.env.NODE_ENV === 'deployment';

const controller = Botkit.slackbot({
  debug: isDebug,
  json_file_store: '.storage'
});

controller.spawn({ token }).startRTM();

class ReportManager {
  constructor() {
    this.reportings = {};
  }
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
  stopReport(bot, channel) {
    if (this.isReportingNow(channel)) {
      delete this.reportings[channel];
    }
  }
  onAmbient(message) {
    const reporter = this.reportings[message.channel];
    if (reporter) {
      reporter.onAmbient(message);
    }
  }
  isReportingNow(channel) {
    return this.reportings[channel] !== undefined;
  }
}

class Reporter {
  constructor(bot, channel, members, onFinish) {
    this.bot = bot;
    this.channel = channel;
    this.members = members;
    this.onFinish = onFinish;
  }
  start() {
    this.current = 0;
    this.report();
  }
  report() {
    this.waiting = this.members[this.current];
    this.bot.say({
      text: '<@' + this.waiting + '> さん、お願いします！！',
      channel: this.channel
    });
  }
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
  onAmbient(message) {
    if (message.user === this.waiting) {
      this.bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'ok_woman',
      }, (err) => {
        if (err) { console.log(err) }
      });
      this.next();
    }
  }
}

const reportManager = new ReportManager();

/**
 * 深いコピーをします。
 * @param obj コピー対象
 * @return コピー結果
 */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * hearsの外に例外を飛ばさないようにするための関数です。
 * この中で実行すると例外が発生した場合は、replyとしてメッセージを表示します。
 *
 * @param bot bot
 * @param message message
 * @param action 実際の処理
 */
function actInHears(bot, message, action) {
  try {
    action();
  } catch (e) {
    bot.reply(message, 'きゃっ、何か変です...\n```\n' + e.message + '\n```');
    console.log(e.stack);
  }
}

/**
 * チャンネルのストレージデータを取得して処理を行います。
 * エラー処理を内包しています。
 *
 * @param bot bot
 * @param message message
 * @action ストレージデータが必要な処理
 * {@link actInHears}
 */
function actWithChannel(bot, message, action) {
  controller.storage.channels.get(message.channel, (err, channel) => {
    actInHears(bot, message, () => {
      // 最初のデータが存在しないときもエラーで返ってくるので、errは見ないことにする。
      // if (err) {
      //   throw new Error(err.message);
      // }
      channel = channel || { id: message.channel };
      action(deepCopy(channel));
    });
  });
}

/**
 * 指定した配列の順番をランダムに変更した配列を生成します。
 * @param array 中身の順番をランダムにしたい配列
 * @return ランダムにした配列
 */
function randamize(array) {
  const result = [];
  while (array.length > 0) {
    const index = Math.floor(Math.random() * array.length);
    result.push(array.splice(index, 1)[0]);
  }
  return result;
}

controller.on('ambient', (bot, message) => {
  reportManager.onAmbient(message);
});

/*
 * ヘルプメッセージ（Usage）を表示します。
 */
controller.hears('^help', MENTIONS, (bot, message) => {
  actInHears(bot, message, () => {
    const botName = '<@' + bot.identity.name + '>';
    const helpMessage = ':information_desk_person:\n'
      + '`info`: このチャンネルの設定を確認します。\n    ex) ' + botName + ' info\n'
      + '`member`: 報告するメンバーを指定します。\n    ex) ' + botName + ' member @hoge @fuga @piyo\n'
      + '';
    bot.reply(message, helpMessage);
  });
});

/*
 * チャネルの設定を表示します。
 */
controller.hears('^info', MENTIONS, (bot, message) => {
  actWithChannel(bot, message, (channel) => {
    let info = '<#' + message.channel + '> :information_desk_person:\n';
    if (channel.members && channel.members.length > 0) {
      info += '`報告する人`: ' + channel.members.map(member => '<@' + member + '>').join(', ') + '\n';
    } else {
      info += '誰も設定されていないようです.\n';
    }

    // TODO: 時間

    bot.reply(message, info);
  });
});

/*
 * 報告者を設定します。
 * ex) @bot member @member1 @member2 ...
 */
controller.hears('^member', MENTIONS, (bot, message) => {
  actInHears(bot, message, () => {
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
    actWithChannel(bot, message, (channel) => {
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
  });
});


/**
 * 報告の司会を始めます。
 * @param bot bot
 * @param message message
 * @param members 報告を求める人たち
 */
function startReport(bot, message, members) {
  members = randamize(members);
  reportManager.startReport(bot, message.channel, members, () => {
    bot.reply(message, '全員終わりましたー。ありがとうございましたー！！:sunny:');
  });
};

/*
 * 報告の司会を始めます。
 * ストレージに保存してある、該当チャンネルのメンバーを対象にして {@link startReport}を呼び出します。
 */
controller.hears('^start report', MENTIONS, (bot, message) => {
  actWithChannel(bot, message, (channel) => {
    if (reportManager.isReportingNow(message.channel)) {
      bot.reply(message, 'もう始まってるよ. :hatched_chick: ');
      return;
    }
    startReport(bot, message, channel.members);
  });
});

/*
 * 報告会をとちゅうで終了します。
 */
controller.hears('^stop report', MENTIONS, (bot, message) => {
  if (reportManager.isReportingNow(message.channel)) {
    reportManager.stopReport(bot, message.channel);
    bot.reply(message, '終了しました。:yum:')
  } else {
    bot.reply(message, '始まっていませんよー。:hatching_chick:');
  }

});

controller.hears('^piyo', MENTIONS, (bot, message) => {
  bot.say({
    text: ':hatched_chick:',
    channel: message.channel
  });
});
