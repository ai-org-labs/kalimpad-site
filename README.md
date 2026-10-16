# kalimpad 公開ページ

サポート・プライバシー・利用規約の静的サイト。アプリのソースコードは含めない。

GitHub Pages: mainブランチのルートを公開。

法務文面の正本は非公開のアプリ開発リポジトリ内 src/legal/documents.json。文面変更時には日英4ページを同期する。外部スクリプト・解析・Cookieは使用しない。GitHub Pages基盤側の処理はGitHubのポリシーに従う。

## App Store公開（2026-10-16）

- 公開版：1.0.0(2)、App ID：6818530043。リンクとQR内容は https://apps.apple.com/app/id6818530043 。
- バッジ：Apple公式 https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/ja-jp から取得し無加工で保存。表示高60px、周囲15pxの余白。
- QR：qrcodeの誤り訂正M、余白4モジュール、8px/モジュールでローカル生成したPNG。アクセス解析や外部QRサービスなし。
- 検証：`node --test tests/download.test.cjs`。QRはjsQRで復号し、リンク先と一致することを確認。
