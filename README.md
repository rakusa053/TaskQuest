# TaskQuest

勉強タスク管理 × ゲーミフィケーションアプリ。  
タスクをこなすとXP・コイン・ガチャチケットが貯まり、ボス討伐やパーティ機能でモチベーションを維持できます。

---

## 最大の特徴 — アプリブロック機能（Android 専用）

> **「勉強中に SNS や YouTube を開こうとすると、自動でブロックしてフォーカスモード画面に切り替わる」**

この機能は Expo や React Native の標準機能では実現できないため、**Kotlin でカスタムネイティブモジュールをゼロから自作**しました。

### 仕組み

```
① ユーザーがブロックしたいアプリを設定画面で選択
        ↓
② バックグラウンドサービス（Kotlin）が常駐し、
   Android の UsageStatsManager API で前面アプリを監視
        ↓
③ ブロック対象アプリが起動されたことを検知
        ↓
④ 即座にフォーカスモード画面（ロック画面）に切り替え
        ↓
⑤ ガチャ報酬（アプリ解放チケット）を使うと
   指定時間だけアプリが解放される
```

### 技術的なポイント

| 項目 | 内容 |
|---|---|
| 使用 API | Android `UsageStatsManager`（使用状況へのアクセス権限が必要） |
| 実装言語 | Kotlin（Expo Custom Native Module） |
| 監視方法 | バックグラウンドサービス + 1秒ポーリング |
| 解放タイマー | `SharedPreferences` で有効期限を管理し、期限切れで再ブロック |
| JS との連携 | Expo Module API 経由で React Native から Kotlin の関数を呼び出し |

### ガチャとの連携

タスクを完了するとガチャチケットが貯まり、ガチャを引くとアプリ解放時間（10〜30分）を獲得できます。  
**「勉強を頑張らないとスマホが使えない」** という仕組みで、学習習慣の形成を促します。

---

## その他の機能

- **タスク管理** — タスクの作成・編集・完了・科目分類・締切管理
- **ゲーミフィケーション** — XP・レベルアップ・コイン・バッジ・ストリーク
- **ガチャ** — タスク完了で貯まるチケットでガチャを引き、アプリ解放時間を獲得
- **ボス戦** — タスク完了のたびにグローバル/パーティボスにダメージを与える
- **パーティ** — 招待コードで仲間とパーティを組み、共同でボスを討伐
- **SNS** — 学習の進捗を投稿・いいね・コメントで共有
- **ノート評価（AI）** — 勉強したノートを撮影すると Gemini API が採点・アドバイスを返す
- **ショップ** — コインでアバター・テーマ・ガチャチケットを購入
- **カレンダー** — タスクの締切・完了をカレンダーで確認

---

## 技術スタック

### フロントエンド
| 技術 | 用途 |
|---|---|
| React Native + Expo | Android アプリ・Web を同一コードで開発 |
| TypeScript | 型安全な開発 |
| Expo Router | ファイルベースのルーティング |
| Zustand | 状態管理 |
| Axios | API通信（認証トークン自動付与） |
| React Native Paper | Material Design 3 UI |
| Kotlin（カスタムネイティブモジュール） | アプリ監視・ブロック機能 |

### バックエンド
| 技術 | 用途 |
|---|---|
| Node.js + Hono | 軽量 REST API サーバー |
| TypeScript | 型安全な開発 |
| Firebase Admin SDK | Firestore・Auth の操作 |
| Firestore | データベース |
| Firebase Auth | 認証（メール/パスワード） |
| Gemini API（Gemini 2.5 Flash） | ノート画像の AI 評価 |

### インフラ
| 技術 | 用途 |
|---|---|
| Docker + Docker Compose | コンテナ管理 |
| Caddy | リバースプロキシ・Web 配信 |
| ConoHa VPS | 本番サーバー |

---

## アーキテクチャ

```
[Android アプリ / Web ブラウザ]
        |
   React Native + Expo Router
   Zustand（状態管理）
        |
   HTTP + Firebase ID トークン
        |
[ConoHa VPS]
   Caddy（リバースプロキシ）
   ├── Hono API（ゲームロジック・AI評価）
   └── Web Static Files（Expo Web ビルド）
        |
   Firebase Admin SDK
        |
[Firebase]
   ├── Firestore（データベース）
   └── Auth（認証）
```

---

## ディレクトリ構成

```
studytask/
├── app/                  # 画面（Expo Router）
│   ├── (tabs)/           # タブ画面（タスク・ボス・カレンダー・SNS・プロフィール）
│   ├── auth/             # ログイン・新規登録
│   ├── gacha/            # ガチャ・報酬使用
│   ├── shop/             # ショップ
│   ├── task/             # タスク作成・編集
│   ├── lock.tsx          # フォーカスモード（ロック画面）
│   ├── blocked-apps.tsx  # ブロックアプリ設定
│   └── note-check.tsx    # AI ノート評価
├── components/           # 再利用 UI パーツ
├── store/                # 状態管理（Zustand）
├── api/                  # サーバー通信
├── hooks/                # カスタムフック
├── modules/app-blocker/  # ★ カスタムネイティブモジュール（Kotlin）
│   ├── index.ts          # JS インターフェース
│   ├── index.web.ts      # Web スタブ
│   └── android/
│       ├── AppBlockerModule.kt   # アプリ監視・アイコン取得
│       └── AppBlockerService.kt  # バックグラウンドサービス
├── types/                # 型定義
├── utils/                # 汎用関数
├── lib/                  # Firebase・通知・PIN管理
└── server/               # バックエンド（Hono API）
    ├── src/
    │   ├── routes/       # API エンドポイント
    │   ├── middleware/   # 認証ミドルウェア
    │   └── services/     # バッジ付与ロジック
    ├── Dockerfile.prod
    ├── Dockerfile.web
    └── docker-compose.prod.yml
```

---

## セットアップ

### 必要なもの
- Node.js 20+
- Docker + Docker Compose
- Firebase プロジェクト（Firestore + Auth 有効化）
- Gemini API キー

### 開発環境の起動

```bash
# サーバー起動
cd server
cp .env.development.example .env.development
# .env.development に Firebase・Gemini の認証情報を記入
docker compose up

# アプリ起動（別ターミナル）
npm install
npx expo start
```

### 本番デプロイ（VPS）

```bash
git pull origin main
cd server
docker compose -f docker-compose.prod.yml up --build -d
```

---

## ver.11（最新）の主な更新

- フォーカスモード（アプリブロック）安定化
- レベルアップ後 FAB が押せない問題修正
- 報酬タイマーをタスク画面に追加
- プレミアムアバター反映修正
- Web ログイン後の画面遷移修正
