# 勉強タスク管理アプリ 実装計画

## Context

勉強タスクの作成・管理・進捗追跡・カレンダー表示ができるネイティブアプリを作成する。
React Native + Expo（iOS/Android 対応）+ Node.js/Hono バックエンド + Firebase 構成。
**今回はローカルサーバーで開発し、将来的に ConoHa VPS へそのままデプロイできる構成にする。**
環境変数（`.env`）で接続先を切り替えるだけで本番移行できるようにする。

---

## アーキテクチャ全体像

### 開発環境（現在）
```
[React Native (Expo)]  iOS / Android（同一 Wi-Fi）
         ↕ HTTP  http://192.168.x.x:3000
[ローカルマシン]
  └ Docker Compose
      └ hono-api コンテナ（Node.js + Hono、ホットリロード）
         ↕ Firebase Admin SDK
[Firebase]
  └ Firestore / Auth
```

### 本番環境（将来 ConoHa VPS へ移行時）
```
[React Native (Expo)]  iOS / Android
         ↕ HTTPS  https://your-domain.com
[ConoHa VPS]
  └ Docker Compose（同じ compose ファイルをそのまま使用）
      └ hono-api コンテナ
      └ nginx コンテナ（Let's Encrypt SSL）
         ↕ Firebase Admin SDK
[Firebase]
  └ Firestore / Auth
```

---

## Tech Stack

### フロントエンド（モバイルアプリ）

| 目的 | ライブラリ |
|---|---|
| フレームワーク | Expo SDK 53 + React Native |
| 言語 | TypeScript |
| ルーティング | expo-router v4（ファイルベース） |
| 状態管理 | Zustand v5 |
| HTTP クライアント | axios または fetch |
| UI | react-native-paper（Material Design 3） |
| チャート | victory-native v41（Skia ベース） |
| カレンダー | react-native-calendars |
| アニメーション | react-native-reanimated v3 |
| 日付計算 | date-fns v3 |

### バックエンド

| 目的 | 技術 |
|---|---|
| ランタイム | Node.js (LTS) |
| API フレームワーク | Hono |
| Firebase 連携 | firebase-admin SDK |
| 言語 | TypeScript |
| コンテナ管理 | Docker + Docker Compose |
| 開発時 | `docker compose up`（tsx --watch でホットリロード） |
| 本番時 | 同じ compose ファイル + nginx コンテナ追加（ConoHa VPS 移行後） |

### バックエンド（クラウドサービス）

| 目的 | サービス |
|---|---|
| データベース | Firebase Firestore |
| 認証 | Firebase Auth（メール/パスワード） |

---

## データモデル

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high';
  dueDate: number | null;        // Unix ms
  estimatedMinutes: number;
  actualMinutes: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
  userId: string;                // Firebase Auth UID
}
```

### Subject（科目）
```typescript
interface Subject {
  id: string;
  name: string;
  color: string;  // hex
  icon: string;   // MaterialCommunityIcons name
  createdAt: number;
  userId: string;
}
```

### StudySession（学習記録）
```typescript
interface StudySession {
  id: string;
  taskId: string;
  subjectId: string;
  durationMinutes: number;
  date: string;           // "2026-03-26"
  startedAt: number;
  endedAt: number;
  userId: string;
}
```

---

## ディレクトリ構成

### フロントエンド

```
studytask/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx       # タブバー設定
│   │   ├── index.tsx         # タスク一覧
│   │   ├── calendar.tsx      # カレンダー
│   │   └── stats.tsx         # 統計
│   ├── task/
│   │   ├── new.tsx           # タスク作成（モーダル）
│   │   └── [id].tsx          # タスク編集（モーダル）
│   ├── subject/
│   │   └── manage.tsx        # 科目管理
│   ├── auth/
│   │   ├── login.tsx         # ログイン画面
│   │   └── register.tsx      # 新規登録画面
│   ├── lock.tsx              # アプリロック画面
│   ├── settings.tsx          # 設定画面
│   └── _layout.tsx           # ルートレイアウト（認証チェック）
├── components/
│   ├── tasks/                # TaskCard, TaskList, TaskForm, TaskFilterBar
│   ├── calendar/             # CalendarView, DayTaskList
│   ├── stats/                # StudyTimeChart, CompletionRing, StreakDisplay
│   ├── subjects/             # SubjectBadge, SubjectPicker
│   └── ui/                   # Button, Card, EmptyState, ProgressBar, SwipeableRow
├── store/
│   ├── taskStore.ts
│   ├── subjectStore.ts
│   ├── statsStore.ts
│   └── authStore.ts          # 認証状態管理
├── api/
│   ├── client.ts             # axios インスタンス（ベースURL + 認証ヘッダー）
│   ├── taskApi.ts            # タスク API 呼び出し
│   ├── subjectApi.ts
│   └── statsApi.ts
├── hooks/                    # useTasks, useSubjects, useStats, useCalendarData, useAuth
├── types/index.ts
└── utils/                    # dateUtils, timeUtils, colorUtils, constants
```

### バックエンド

```
server/
├── src/
│   ├── index.ts              # Hono アプリ起動・ミドルウェア設定
│   ├── routes/
│   │   ├── tasks.ts          # GET/POST/PUT/DELETE /tasks
│   │   ├── subjects.ts       # GET/POST/PUT/DELETE /subjects
│   │   ├── sessions.ts       # POST /sessions, GET /stats
│   │   └── auth.ts           # POST /auth/verify
│   ├── middleware/
│   │   └── authMiddleware.ts # Firebase ID トークン検証
│   ├── firebase/
│   │   └── admin.ts          # Firebase Admin SDK 初期化
│   └── types/
│       └── index.ts
├── Dockerfile                # Node.js イメージ定義
├── docker-compose.yml        # 開発用（ホットリロード + ボリュームマウント）
├── docker-compose.prod.yml   # 本番用（nginx コンテナ追加）← ConoHa 移行時
├── nginx/
│   └── default.conf          # Nginx リバースプロキシ設定 ← ConoHa 移行時
├── package.json
├── tsconfig.json
├── .env.development          # ローカル用環境変数
└── .env.production           # 本番用環境変数 ← ConoHa 移行時
```

---

## API エンドポイント設計

```
POST   /api/tasks           タスク作成
GET    /api/tasks           タスク一覧（クエリ: status, subjectId, date）
PUT    /api/tasks/:id       タスク更新
DELETE /api/tasks/:id       タスク削除

POST   /api/subjects        科目作成
GET    /api/subjects        科目一覧
PUT    /api/subjects/:id    科目更新
DELETE /api/subjects/:id    科目削除

POST   /api/sessions        学習記録追加
GET    /api/stats/weekly    週次統計
GET    /api/stats/streak    ストリーク情報
```

すべてのリクエストに `Authorization: Bearer <FirebaseIDToken>` ヘッダーが必要。
Hono の authMiddleware がトークンを検証し `userId` を取得する。

---

## 画面構成

### 認証フロー
- 未ログイン → `auth/login.tsx`（ログイン / 新規登録へ）
- ログイン済み → `(tabs)` タブ画面へ

### Tab 1 - タスク一覧（`app/(tabs)/index.tsx`）
- 科目フィルターチップ（横スクロール）
- セクション別リスト：期限切れ / 今日 / 今後 / 完了済み
- 左スワイプ → 削除、右スワイプ → 完了
- FAB（＋） → タスク作成モーダル

### Tab 2 - カレンダー（`app/(tabs)/calendar.tsx`）
- 月カレンダー（タスクのある日にカラードット）
- 選択日のタスクリスト表示（下半分）

### Tab 3 - 統計（`app/(tabs)/stats.tsx`）
- ストリーク（連続日数）カード
- 今週の学習時間棒グラフ（7日分）
- 科目別完了率
- 科目別学習時間ドーナツチャート
- 期間切り替え：週 / 月 / 全期間

### タスク作成/編集（モーダル）
- フィールド：タイトル、科目、優先度、期限日、予定時間、メモ
- 編集時のみ：学習時間記録、ステータス切り替え

### アプリロック画面（`app/lock.tsx`）
- 対象アプリ起動時にフルスクリーンで表示
- 未完了タスク件数と科目一覧を表示（「あと X 件」）
- 「タスクを確認する」ボタン → アプリのタスク一覧へ遷移
- 「緊急解除」ボタン → PIN 入力ダイアログ（4桁）
- PIN 正解 → 当日中ロック解除、履歴に記録
- PIN 不正解 → エラー表示（連続失敗でクールダウン）

### 設定画面（`app/settings.tsx`）
- ロック機能のオン/オフ切り替え
- ブロック対象アプリ選択（Android: アプリ一覧 / iOS: FamilyActivityPicker）
- 選択済みアプリ一覧（削除可能）
- PIN 変更（現在の PIN → 新しい PIN）
- 通知時刻の設定（デフォルト 12:00）

---

## 実装ステップ

### Phase 0: 環境セットアップ
1. Firebase プロジェクト作成（Firestore + Auth 有効化）
2. Expo アプリ scaffold: `npx create-expo-app@latest studytask --template blank-typescript`
3. サーバープロジェクト scaffold: `mkdir server && npm init`
4. 環境変数ファイルを用意（開発・本番で切り替え可能な構成）

```
server/
├── .env.development   # API_BASE_URL=http://192.168.x.x:3000
└── .env.production    # API_BASE_URL=https://your-domain.com  ← ConoHa 移行時

studytask/
├── .env.development   # EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
└── .env.production    # EXPO_PUBLIC_API_URL=https://your-domain.com
```

### Phase 1: バックエンド（Hono API サーバー）
1. Hono セットアップ + TypeScript 設定
2. `Dockerfile` 作成（Node.js LTS イメージ）
3. `docker-compose.yml` 作成（ボリュームマウントでホットリロード）
4. Firebase Admin SDK 初期化（`/src/firebase/admin.ts`）
5. 認証ミドルウェア（ID トークン検証）
6. タスク CRUD ルート（Firestore 読み書き）
7. 科目 CRUD ルート
8. 学習記録・統計ルート
9. `docker compose up` でローカル起動確認

### Phase 2: フロントエンド データ層
1. `/types/index.ts` 全インターフェース定義
2. `/api/client.ts` — axios インスタンス（Firebase ID トークンを自動付与）
3. 各 API モジュール（taskApi, subjectApi, statsApi）
4. 認証ストア（Firebase Auth SDK でログイン/ログアウト管理）

### Phase 3: フロントエンド 状態管理
1. `authStore.ts` — ユーザー状態 + ID トークン管理
2. `taskStore.ts` — API 呼び出し + ローカルキャッシュ
3. `subjectStore.ts`
4. `statsStore.ts`

### Phase 4: カスタムフック
1. `useAuth.ts` — 認証状態・ログイン/ログアウト
2. `useTasks.ts` — グループ化タスク（overdue/today/upcoming/completed）
3. `useStats.ts` — 統計データ（期間別）
4. `useCalendarData.ts` — カレンダー用マーク済み日付

### Phase 5: UI コンポーネント
1. 基本 UI（Button, Card, EmptyState, SwipeableRow）
2. 科目コンポーネント（SubjectBadge, SubjectPicker）
3. タスクコンポーネント（TaskCard, TaskList, TaskForm, TaskFilterBar）
4. カレンダーコンポーネント（CalendarView, DayTaskList）
5. 統計コンポーネント（StudyTimeChart, CompletionRing, StreakDisplay）

### Phase 6: 画面実装
1. `_layout.tsx` — 認証チェック（未ログインなら auth/login へリダイレクト）
2. ログイン / 新規登録画面
3. タブレイアウト + タスク一覧 → カレンダー → 統計
4. タスク作成・編集モーダル
5. 科目管理画面
6. 設定画面

### Phase 7: アプリロック機能

#### Android（Accessibility Service）
1. `android/` にカスタムネイティブモジュール作成（Expo Dev Build 必須）
2. `AccessibilityService` を実装 — フォアグラウンドアプリのパッケージ名を検知
3. **ユーザーが設定したアプリのみ**を対象に判定（ブロック対象リストと照合）
4. 対象アプリ起動 + 未完了タスクあり → ロック画面を前面表示
5. 対象外アプリは通常通り使用可能
6. タスク完了時にロック解除

#### iOS（Screen Time API）
1. Apple Developer アカウントで `Family Controls` 権限を申請
2. Expo Dev Build に `com.apple.developer.family-controls` entitlement を追加
3. `FamilyControls` + `ManagedSettings` + `DeviceActivity` フレームワークを Swift で実装
4. `FamilyActivityPicker` UI でユーザーがブロック対象アプリを選択・保存
5. **選択したアプリのみ** `ManagedSettings` でブロック（未完了タスクがある間）
6. タスク完了でブロック解除

#### 共通 UI
- **ブロック対象アプリ選択画面**（設定画面に追加）
  - Android: インストール済みアプリ一覧から選択
  - iOS: `FamilyActivityPicker`（システム標準の選択 UI）を使用
- **ロック画面**
  - 「タスクを完了してください」メッセージ + 未完了タスク件数
  - タスク一覧へのリンク
  - 「緊急解除」ボタン → PIN 入力ダイアログ表示
- **緊急解除（PIN）**
  - 4桁 PIN を入力すると一時的にロック解除（当日中のみ有効）
  - PIN は `expo-secure-store` に暗号化して保存
  - 初期 PIN はアプリ初回起動時に設定（デフォルト値あり）
  - 設定画面から PIN 変更可能
- ロックのオン/オフ切り替えスイッチ
- 選択したアプリのアイコン・名前を一覧表示（確認・削除できる）

> **前提**: Expo Dev Build（Expo Go 不可）、iOS は Apple Developer アカウント + Family Controls 権限申請が必要

### Phase 8: 通知機能

1. `expo-notifications` を導入
2. アプリ起動時に通知権限をリクエスト
3. 毎日 12:00 に「本日のタスク」リマインダーをスケジュール
   - 未完了タスクがある場合のみ通知
   - 通知内容：「今日のタスクが X 件あります」
   - タップ → アプリのタスク一覧画面を開く
4. タスク完了・追加時に翌日分のスケジュールを再設定

> **実装メモ**: `expo-notifications` の `scheduleNotificationAsync` で毎日12:00のトリガーを設定

### Phase 9: 仕上げ
1. ライト/ダークテーマ対応
2. Reanimated アニメーション
3. エラーハンドリング（API エラー → Snackbar 表示）
4. ローディング状態（スケルトン）
5. オフライン時のフォールバック表示

---

## 重要ファイル

**フロントエンド**
- `/types/index.ts` — 全型定義の基盤
- `/api/client.ts` — 認証ヘッダー付き HTTP クライアント
- `/store/authStore.ts` — 認証状態の中心
- `/store/taskStore.ts` — タスク状態の中心
- `/app/_layout.tsx` — 認証ルーティングの起点
- `/app/lock.tsx` — アプリロック画面
- `/app/settings.tsx` — 設定画面

**バックエンド**
- `server/src/index.ts` — Hono エントリーポイント
- `server/src/middleware/authMiddleware.ts` — 全 API の認証ガード
- `server/src/firebase/admin.ts` — Firestore 接続

---

## 動作確認方法

```bash
# バックエンド起動（Docker）
cd server && docker compose up

# フロントエンド起動
cd studytask && npx expo start
```

- ローカル IP（例: `192.168.1.10:3000`）を `.env.development` に設定し、スマホ実機 / シミュレーターから接続
- 新規登録 → ログイン → タスク作成 → 一覧表示 → カレンダードット確認 → 完了 → 統計反映
- iOS Simulator + Android Emulator の両方で動作確認

## ConoHa VPS 移行手順（将来）

1. ConoHa VPS に Docker / Docker Compose をインストール
2. `server/` を VPS にデプロイ（git clone）
3. `docker-compose.prod.yml` で nginx コンテナ + Let's Encrypt を追加
4. `.env.production` のドメインを更新
5. `docker compose -f docker-compose.prod.yml up -d` で起動
6. アプリの `EXPO_PUBLIC_API_URL` を本番 URL に変更してビルド
