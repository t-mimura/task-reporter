'use strict';

/*
 * ヘルプメッセージ（Usage）を表示します。
 */
module.exports = (controller, bot, message) => {
  const botName = '<@' + bot.identity.name + '>';
  const helpMessage = ':information_desk_person:\n'
    + '`info`: このチャンネルの設定を確認します。\n    ex) ' + botName + ' info\n'
    + '`member`: 報告するメンバーを指定します。\n    ex) ' + botName + ' member @hoge @fuga @piyo\n'
    + '`start report`: 司会を始めます。\n    ex) ' + botName + ' start report\n'
    + '`stop report`: 途中で終了します。\n    ex) ' + botName + ' stop report\n'
    + '';
  bot.reply(message, helpMessage);
};
