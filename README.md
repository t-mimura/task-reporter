# task-reporter

## これは何か。

これは slack の bot です。Botkitでできています。

任意のチャネル内の任意のメンバーを設定しておき、そのメンバーに対して一人ずつ発言をうながします。

日次スクラムのような場で、全員に発言する機会を設けるようなときの司会役として利用します。

## install 

```bash
$ git clone https://github.com/t-mimura/task-reporter.git
$ cd task-reporter
$ npm install
```

## 動かし方

bot の API Token が必要です。下記サイトを参考にして作成してください。

https://github.com/howdyai/botkit#getting-started

生成した API Token を次のパスのファイルを作成し、そこに保存してください。
task-reporterはそこから API Tokenを読み込みます。

`.task-reporter/BOT_TOKEN`

API Token を保存したら下記のように起動が可能です。

```bash
$ npm start
```

### その他の設定

報告に対するリアクションのアイコンをカスタマイズできます。

下記パスに設定のjsonファイルを置くと、起動に読み込みます。

`.task-reporter/reaction.json`

デフォルトでは以下のようになっています。

```json
[
  { "weight": 1, "value": [ "+1" ] },
  { "weight": 1, "value": [ "ok_woman" ] },
  { "weight": 1, "value": [ "eyes" ] }
]
```

## 使い方

全てのコマンドにおいて direct mention により動作させます。

### メンバーの登録

次のようにメンバーを登録します。

`@your_bot_name member @member1 @member2 @member3`

### 司会の開始

次のように司会を開始します。

`@your_bot_name start report`

ボットの呼びかけに対しては、direct mentionで返す必要があります。

`@your_bot_name ok. my yesterday work is ...`

