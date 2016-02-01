'use strict';

/**
 * 深いコピーをします。
 * @param obj コピー対象
 * @return コピー結果
 */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 外に例外を飛ばさないようにするための関数です。
 * この中で実行すると例外が発生した場合は、replyとしてメッセージを表示します。
 *
 * @param bot bot
 * @param message message
 * @param action 実際の処理
 */
function actWithCatch(bot, message, action) {
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
 * @param storage storage
 * @param bot bot
 * @param message message
 * @action ストレージデータが必要な処理
 * {@link actWithCatch}
 */
function actWithChannel(storage, bot, message, action) {
  storage.channels.get(message.channel, (err, channel) => {
    // 最初のデータが存在しないときもエラーで返ってくるので、errは見ないことにする。
    // if (err) {
    //   throw new Error(err.message);
    // }
    channel = channel || { id: message.channel };
    action(deepCopy(channel));
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

module.exports = {
  deepCopy,
  actWithCatch,
  actWithChannel,
  randamize
};
