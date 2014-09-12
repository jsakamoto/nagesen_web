# 投げ銭 for Webの使い方

## アクセスするページ

    ルーティング|ページ
    :----------:|:----:
    /           | 投げ銭クライアント
    /box        | 投げ銭BOX
    /qr         | 投げ銭クライアントへのQRコード発行

## 準備するもの

### 共通

* Gitクライアント
* Node.js実行環境(node v0.10.26, npm v1.4.9)

### herokuで動かす場合

* heroku アカウント
* heroku toolbelt( [ダウンロードページ](https://toolbelt.heroku.com/) )

## ローカルで使う場合

``` shell
$ git clone https://github.com/ohotech/nagesen_web.git nagesen
$ cd nagesen
$ npm install
$ node app -p <port>
Listening on port <port>...
```

## heroku で使う場合

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
