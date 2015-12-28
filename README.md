# 投げ銭 for Webの使い方

## アクセスするページ

    ルーティング|ページ
    :----------:|:----:
    /           | 投げ銭クライアント
    /box        | 投げ銭BOX
    /qr         | 投げ銭クライアントへのQRコード発行

## ローカルで使う場合

### 準備するもの

* Gitクライアント
* Node.js実行環境(node v0.10.26, npm v1.4.9)

### 手順

``` shell
$ git clone https://github.com/ohotech/nagesen_web.git nagesen
$ cd nagesen
$ npm install
$ node app -p <port>
Listening on port <port>...
```

##  herokuで動かす場合

### 準備するもの

* Gitクライアント
* Node.js実行環境(node v0.10.26, npm v1.4.9)
* heroku アカウント
* heroku toolbelt( [ダウンロードページ](https://toolbelt.heroku.com/) )

### 手順

* ここでは、「[subdomain].herokuapp.com」に投げ銭を設置したい例です。

``` shell
$ heroku login # ssh公開鍵登録　一度行えばよい
$ heroku create [subdomain] # [subdomain]の取得
$ git clone https://github.com/ohotech/nagesen_web.git nagesen
$ cd nagesen
$ git push heroku master
$ heroku ps:scale web=1 # 無料枠内での起動
$ heroku logs # 起動確認
$ heroku ps:scale web=0 # 終了
```

## herokuで動かす場合 - "Deploy to Heroku" ボタン編

### 準備するもの

* heroku アカウント

### 手順

下の「Deploy to Heroku」ボタンをクリックし、表示される Web サイトの指示に従ってください。

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

投げ銭 for Web は heroku の無料枠内で実行できます。

## Azure Web Apps で動かす場合

### 準備するもの

* Azure アカウント

### 手順

下の「Deploy to Azure」ボタンをクリックし、表示される Web サイトの指示に従ってください。

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

投げ銭 for Web は Azure Web Apps の無料枠内で実行できます。
