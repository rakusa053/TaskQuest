# 勉強タスク管理アプリ 実装計画

最終更新: 2026-04-01（Phase 10 アプリブロッカー Android 実装中）

## Context

勉強タスクの作成・管理・進捗追跡・カレンダー表示 + ゲーミフィケーション（XP・レベル・バッジ・ガチャ・RPGボス戦・マネー＆ショップ）を持つネイティブアプリを作成する。
**現在はローカルサーバーで開発し、将来的に ConoHa VPS へそのままデプロイできる構成にする。**

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

### フロントエンド

| 目的 | ライブラリ |
|---|---|
| フレームワーク | Expo SDK 53 + React Native |
| 言語 | TypeScript |
| ルーティング | expo-router v4（ファイルベース） |
| 状態管理 | Zustand v5 |
| HTTP クライアント | axios（IDトークン自動リフレッシュ付き） |
| UI | react-native-paper（Material Design 3） |
| チャート | victory-native v41（Skia ベース） |
| カレンダー | react-native-calendars |
| アニメーション | react-native-reanimated v3 |
| 日付計算 | date-fns v3 |
| セキュアストレージ | expo-secure-store |
| 通知 | expo-notifications |

### バックエンド

| 目的 | 技術 |
|---|---|
| ランタイム | Node.js (LTS) |
| API フレームワーク | Hono |
| Firebase 連携 | firebase-admin SDK |
| 言語 | TypeScript |
| コンテナ管理 | Docker + Docker Compose |

### クラウドサービス

| 目的 | サービス |
|---|---|
| データベース | Firebase Firestore |
| 認証 | Firebase Auth（メール/パスワード） |

---

## データモデル

```typescript
interface Task {
  id: string; title: string; description?: string;
  subjectId: string; status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high';
  dueDate: number | null; estimatedMinutes: number; actualMinutes: number;
  completedAt: number | null; createdAt: number; updatedAt: number; userId: string;
}

interface Subject {
  id: string; name: string; color: string; icon: string;
  createdAt: number; userId: string;
}

interface StudySession {
  id: string; taskId: string; subjectId: string;
  durationMinutes: number; date: string;
  startedAt: number; endedAt: number; userId: string;
}

interface UserProfile {
  id: string; displayName: string;
  level: number; xp: number; totalXp: number;
  weeklyPoints: number; streak: number; longestStreak: number;
  avatarId: string; unlockedAvatars: string[];
  gachaTickets: number;
  money: number;
  totalMoneyEarned: number;
  xpBoostExpiresAt: number | null;
  partyId: string | null;
  createdAt: number; userId: string;
}

interface Badge {
  id: string; name: string; description: string;
  icon: string; unlockedAt: number; userId: string;
}

interface GachaResult {
  id: string; userId: string;
  rewardMinutes: number; rarity: 'normal' | 'rare' | 'sr';
  used: boolean; usedAt: number | null;
  targetApp: string | null; expiresAt: number | null;
  createdAt: number;
}

interface ShopItem {
  id: string;
  type: 'avatar' | 'costume' | 'accessory' | 'gacha_ticket' | 'time_extension' | 'xp_boost';
  name: string; description: string; imageUrl?: string;
  price: number; value?: number; isLimited: boolean;
}

interface PurchaseLog {
  id: string; userId: string; shopItemId: string;
  price: number; createdAt: number;
}

interface Boss {
  id: string; name: string; imageUrl: string;
  level: number; hp: number; maxHp: number;
  type: 'global' | 'party'; partyId?: string;
  startsAt: number; endsAt: number;
  isDefeated: boolean; defeatedAt: number | null;
  moneyReward: number;
}

interface BossDamageLog {
  id: string; bossId: string; userId: string;
  damage: number; taskId: string; createdAt: number;
}

interface Party {
  id: string; name: string;
  leaderId: string; memberIds: string[];
  inviteCode: string; currentBossId: string | null;
  createdAt: number;
}
```

---

## ディレクトリ構成

### フロントエンド（gamingtask/）

```
app/
├── (tabs)/
│   ├── _layout.tsx       # タブバー設定（5タブ）
│   ├── index.tsx         # タスク一覧
│   ├── boss.tsx          # ボス戦（グローバル/パーティ）
│   ├── calendar.tsx      # カレンダー
│   ├── stats.tsx         # 統計
│   └── profile.tsx       # プロフィール
├── task/
│   ├── new.tsx           # タスク作成（モーダル）
│   └── [id].tsx          # タスク編集（モーダル）
├── boss/
│   └── victory.tsx       # 討伐成功演出
├── party/
│   └── manage.tsx        # パーティ管理
├── gacha.tsx             # ガチャ
├── gacha/use.tsx         # ガチャ報酬使用
├── shop.tsx              # ショップ
├── subject/manage.tsx    # 科目管理
├── avatar.tsx            # アバター選択
├── auth/
│   ├── login.tsx
│   └── register.tsx
├── lock.tsx              # アプリロック画面
├── settings.tsx          # 設定画面
└── _layout.tsx           # ルートレイアウト（認証チェック）

components/
├── tasks/
├── calendar/
├── stats/
├── subjects/
├── gamification/         # XPBar, LevelUpModal, BadgeCard, XPPopup, AvatarDisplay, CoinDisplay
├── gacha/                # GachaCard, GachaResultModal, GachaTimerBadge, TicketCounter
├── boss/                 # BossCard, BossHPBar, DamagePopup, DamageLog, VictoryModal, PartyCard
├── shop/                 # ShopItemCard, PurchaseConfirmModal, CoinBalance
└── ui/

store/
├── authStore.ts
├── taskStore.ts
├── subjectStore.ts
├── statsStore.ts
├── profileStore.ts       # XP・レベル・バッジ・チケット・コイン・XPブースト
├── gachaStore.ts
├── bossStore.ts
└── shopStore.ts

api/
├── client.ts             # axios（IDトークン自動リフレッシュ）
├── taskApi.ts
├── subjectApi.ts
├── statsApi.ts
├── profileApi.ts
├── gachaApi.ts
├── bossApi.ts
├── partyApi.ts
└── shopApi.ts

hooks/
├── useAuth.ts
├── useTasks.ts
├── useStats.ts
├── useCalendarData.ts
├── useProfile.ts
├── useGacha.ts
├── useBoss.ts
├── useParty.ts
└── useShop.ts

types/index.ts
utils/
```

### バックエンド（gamingtask-server/）

```
src/
├── index.ts
├── routes/
│   ├── tasks.ts
│   ├── subjects.ts
│   ├── sessions.ts
│   ├── profile.ts        # XP・コイン・チケット付与
│   ├── gacha.ts          # サーバー側抽選
│   ├── boss.ts           # ダメージ処理・討伐判定・報酬付与
│   ├── party.ts          # パーティ管理
│   └── shop.ts           # 購入処理
├── middleware/
│   └── authMiddleware.ts
└── firebase/
    └── admin.ts

Dockerfile
docker-compose.yml
docker-compose.prod.yml   # ConoHa VPS 移行時
nginx/default.conf        # ConoHa VPS 移行時
.env.development
.env.production           # ConoHa VPS 移行時
.gitignore                # .env を必ず含める
```

---

## API エンドポイント設計

```
POST/GET         /api/tasks
PUT/DELETE       /api/tasks/:id

POST/GET         /api/subjects
PUT/DELETE       /api/subjects/:id

POST             /api/sessions
GET              /api/stats/weekly
GET              /api/stats/streak

GET/PUT          /api/profile
GET              /api/profile/badges
POST             /api/profile/xp        # XP・コイン・チケット付与（サーバー側のみ）

POST             /api/gacha/spin        # サーバー側抽選
GET              /api/gacha/results
POST             /api/gacha/use/:id

GET              /api/boss/global
GET              /api/boss/global/logs
POST             /api/boss/global/damage

GET              /api/party
POST             /api/party
POST             /api/party/join
DELETE           /api/party/leave
GET              /api/party/boss
POST             /api/party/boss/damage

GET              /api/shop
POST             /api/shop/purchase/:id
GET              /api/shop/purchases
```

すべてのリクエストに `Authorization: Bearer <FirebaseIDToken>` ヘッダーが必要。

---

## 実装ステップ

### Phase 0: 環境セットアップ ← 次にやること
1. Firebase プロジェクト作成（Firestore + Auth 有効化）
2. モノレポ構成（フロント + `server/` フォルダ）に変更済み
3. Expo アプリ scaffold: `npx create-expo-app@latest . --template blank-typescript`
4. サーバー scaffold: `npm init` + 必要パッケージインストール
5. `.env.development` 用意 / `.gitignore` に `.env` 追加（最重要）

### Phase 1: バックエンド（Hono API サーバー）
1. Hono + TypeScript セットアップ
2. `Dockerfile` + `docker-compose.yml`（ホットリロード付き）
3. Firebase Admin SDK 初期化 + Firestore セキュリティルール設定
4. 認証ミドルウェア（IDトークン検証）
5. タスク / 科目 / 学習記録 CRUD ルート
6. ゲーミフィケーション API（XP・マネー・チケット付与・バッジ判定）
7. ガチャ API（サーバー側抽選・タイマー管理）
8. ボス戦 API（ダメージ処理・HP管理・討伐判定・報酬付与）
9. パーティ API（作成・参加・招待コード）
10. ショップ API（商品一覧・購入処理・残高チェック・二重購入防止）

### Phase 2: フロントエンド データ層
1. `types/index.ts` 全インターフェース定義
2. `api/client.ts` — axios（IDトークン自動リフレッシュ付き）
3. 各 API モジュール

### Phase 3: 状態管理（Zustand v5）
1. authStore / taskStore / subjectStore / statsStore
2. profileStore（XP・レベル・バッジ・チケット・コイン・XPブースト）
3. gachaStore / bossStore / shopStore

### Phase 4: カスタムフック
useAuth / useTasks / useStats / useCalendarData / useProfile / useGacha / useBoss / useParty / useShop

### Phase 5: UI コンポーネント
1. 基本 UI
2. 科目・タスク・カレンダー・統計コンポーネント
3. ゲーミフィケーションコンポーネント（XPBar / LevelUpModal / BadgeCard / XPPopup / AvatarDisplay / CoinDisplay）
4. ガチャコンポーネント（GachaCard / GachaResultModal / GachaTimerBadge / TicketCounter）
5. ボス戦コンポーネント（BossCard / BossHPBar / DamagePopup / DamageLog / VictoryModal / PartyCard）
6. ショップコンポーネント（ShopItemCard / PurchaseConfirmModal / CoinBalance）

### Phase 6: 画面実装
1. 認証チェック・ログイン・新規登録
2. タブレイアウト（タスク / ボス戦 / カレンダー / 統計 / プロフィール）
3. タスク作成・編集モーダル
4. ボス戦・パーティ管理・討伐成功演出画面
5. ショップ・ガチャ・報酬使用画面
6. プロフィール・アバター選択・科目管理・設定画面

### Phase 7: アプリロック機能（基本UI）✅
- フォーカスモード UI（ロック画面）
- 設定画面でフォーカスモード ON/OFF
- PIN削除 → 「タスクに集中しましょう」＋「タスク画面に戻る」ボタンに変更

### Phase 10: Android ネイティブ アプリブロッカー（実装中）
- expo native module（app-blocker）実装
- UsageStats + フォアグラウンドサービス（500ms ポーリング）
- ブロック対象アプリ選択 UI（blocked-apps.tsx）
- **既知の問題（未解決）**:
  - `foreground=null`: エミュレータで UsageEvents が取得できない
  - BAL制限（Android 14+）: `startActivity()` がサービスからブロックされる
- **解決済み**:
  - `startForeground()` クラッシュ（API34+で3引数版に修正）
  - `stopMonitoring→startMonitoring` 連続呼び出しによる `ForegroundServiceDidNotStartInTimeException` 修正
  - ロック画面シンプル化（PIN削除）

### Phase 8: 通知機能 ✅
- expo-notifications 初期化
- 毎日リマインド（時刻設定可能）
- ガチャタイマー終了通知
- ボス討伐成功通知
- expo-task-manager / expo-background-fetch 登録

### Phase 9: 仕上げ ✅
- XPPopup アニメーション（タスク完了時）
- LevelUpModal
- エラーハンドリング（Snackbar）
- LoadingOverlay
- Pull-to-refresh（タスク一覧）
- victory-native チャート（統計画面）
- react-native-calendars（カレンダー画面）
- 設定画面・科目管理・アバター選択 画面実装完了

---

## セキュリティ対応（実装時に必ず入れる）
1. `.gitignore` に `.env` を追加（最重要）
2. Firestore セキュリティルールで `userId == request.auth.uid` を必須に
3. 初回起動時にPIN強制設定（デフォルトPINをコードに残さない）
4. XP・コイン・チケット・ダメージ付与はサーバー側のみで処理
5. 購入処理はサーバー側で残高チェック・二重購入防止
6. axios インターセプターで IDトークン自動リフレッシュ

---

## 動作確認方法

```bash
# バックエンド起動（Docker）
cd gamingtask-server && docker compose up

# フロントエンド起動
cd gamingtask && npx expo start
```

ローカル IP（例: `192.168.1.10:3000`）を `.env.development` に設定し、スマホ実機 / シミュレーターから接続

## ConoHa VPS 移行手順（将来）

1. ConoHa VPS に Docker / Docker Compose をインストール
2. `gamingtask-server/` を VPS にデプロイ（git clone）
3. `docker-compose.prod.yml` で nginx コンテナ + Let's Encrypt を追加
4. `.env.production` のドメインを更新
5. `docker compose -f docker-compose.prod.yml up -d` で起動
6. アプリの `EXPO_PUBLIC_API_URL` を本番 URL に変更してビルド
