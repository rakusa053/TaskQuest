# 会話記録 - 勉強タスク管理アプリ設計

日付: 2026-03-26

---

## 決定事項まとめ

### フロントエンド
- **フレームワーク**: React Native + Expo
- **対応 OS**: iOS / Android 両対応
- **言語**: TypeScript

### バックエンド
- **フレームワーク**: Node.js + Hono
- **言語**: TypeScript
- **コンテナ**: Docker + Docker Compose
- **現在**: ローカルサーバーで開発
- **将来**: ConoHa VPS へデプロイ（同じ Docker Compose ファイルをそのまま使用）

### データベース・認証
- **DB**: Firebase Firestore
- **認証**: Firebase Auth（メール/パスワード）

---

## 機能一覧

### コア機能
1. **タスク作成・管理** — 追加・編集・削除・完了管理、科目・優先度・期限日・予定時間
2. **進捗・統計** — 学習時間グラフ、科目別完了率、ストリーク
3. **スケジュール・カレンダー** — 月カレンダー表示、日付別タスク一覧

### アプリロック機能
- タスク未完了中は**ユーザーが設定した特定のアプリのみ**をブロック（全アプリではない）
- **Android**: Accessibility Service でフォアグラウンドアプリを検知 → ブロック対象リストと照合
- **iOS（個人利用）**: Screen Time API（Family Controls）を使用
  - Apple Developer アカウント（$99/年）が必要
  - Family Controls 権限を Apple に申請
  - Expo Dev Build 必須
- **緊急解除**: 4桁 PIN で当日中のみロック解除
  - PIN は `expo-secure-store` に暗号化保存
  - 設定画面から変更可能

### 通知機能
- 毎日 **12:00** に本日の未完了タスク件数をプッシュ通知
- タップするとタスク一覧画面へ遷移

---

## 会話の流れ

**Q: ネイティブアプリを作りたい**
→ React Native + Expo を使用することに決定

**Q: バックエンドは何を使う？**
→ Node.js + Hono（TypeScript）+ Firebase（Firestore + Auth）

**Q: サーバーはどこで動かす？**
→ ConoHa VPS を想定。現在はローカルサーバーで開発し、後から VPS へ移行できる構成に

**Q: Docker の方がいい？**
→ Docker + Docker Compose を採用。ローカルと VPS で同じ構成が使えるため移行が楽

**Q: アプリロック機能を追加したい**
→ Android（Accessibility Service）+ iOS（Screen Time API）で実装

**Q: 全アプリではなく設定したアプリだけブロックしたい**
→ ブロック対象リストと照合する仕組みに変更

**Q: iOS は個人利用なら可能？**
→ Apple Developer アカウント + Family Controls 権限申請で実現可能

**Q: ずっとロックされる危険はない？**
→ 緊急解除（PIN入力）を追加。PIN は 0930 がデフォルト（設定変更可能）

**Q: 通知機能も追加したい**
→ 毎日 12:00 に本日のタスクをリマインド（expo-notifications 使用）

---

## 画面一覧

| 画面 | ファイル | 説明 |
|---|---|---|
| ログイン | `app/auth/login.tsx` | メール/パスワードでログイン |
| 新規登録 | `app/auth/register.tsx` | アカウント作成 |
| タスク一覧 | `app/(tabs)/index.tsx` | メイン画面、セクション別リスト |
| カレンダー | `app/(tabs)/calendar.tsx` | 月カレンダー + 日別タスク |
| 統計 | `app/(tabs)/stats.tsx` | グラフ・ストリーク |
| タスク作成 | `app/task/new.tsx` | モーダル |
| タスク編集 | `app/task/[id].tsx` | モーダル |
| アプリロック | `app/lock.tsx` | ブロック時のフルスクリーン表示 |
| 設定 | `app/settings.tsx` | ロック設定・PIN・通知時刻 |

---

## 注意事項

- アプリロック機能は **Expo Dev Build 必須**（Expo Go では動作しない）
- iOS のアプリロックは **Apple Developer アカウント（年間 $99）** と **Family Controls 権限申請** が必要
- ConoHa VPS 移行時は `.env.production` の URL を更新するだけで対応可能
