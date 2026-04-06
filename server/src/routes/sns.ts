import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const sns = new Hono<{ Variables: { userId: string } }>();
sns.use('*', authMiddleware);

// 今日タスクを完了しているか確認
async function hasTodayCompletedTask(userId: string): Promise<boolean> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  // userId + completedAt の2条件のみ（複合インデックス不要）、statusはメモリで絞り込む
  const snapshot = await db.collection('tasks')
    .where('userId', '==', userId)
    .where('completedAt', '>=', todayStart)
    .where('completedAt', '<=', todayEnd)
    .get();

  return snapshot.docs.some(doc => doc.data().status === 'completed');
}

// タイムライン取得
sns.get('/feed', async (c) => {
  const userId = c.get('userId');
  const type = c.req.query('type') ?? 'all'; // all | following | party

  const hasCompleted = await hasTodayCompletedTask(userId);
  if (!hasCompleted) {
    return c.json({ error: 'task_required' }, 403);
  }

  let targetUserIds: string[] | null = null;

  if (type === 'following') {
    const followSnap = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();
    targetUserIds = followSnap.docs.map(d => d.data().followingId);
    targetUserIds.push(userId); // 自分の投稿も含む
    if (targetUserIds.length === 1) return c.json([]); // 自分のみでフォロー0件
  } else if (type === 'party') {
    const profileDoc = await db.collection('profiles').doc(userId).get();
    const partyId = profileDoc.data()?.partyId;
    if (!partyId) return c.json([]);
    const partyDoc = await db.collection('parties').doc(partyId).get();
    targetUserIds = partyDoc.data()?.memberIds ?? [];
  }

  let query: FirebaseFirestore.Query = db.collection('posts').orderBy('createdAt', 'desc').limit(50);

  // Firestore の 'in' は最大10件のため分割取得
  let postDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  if (targetUserIds !== null) {
    if (targetUserIds.length === 0) return c.json([]);
    const chunks: string[][] = [];
    for (let i = 0; i < targetUserIds.length; i += 10) {
      chunks.push(targetUserIds.slice(i, i + 10));
    }
    const results = await Promise.all(
      chunks.map(chunk =>
        db.collection('posts')
          .where('userId', 'in', chunk)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get()
      )
    );
    postDocs = results.flatMap(r => r.docs);
    postDocs.sort((a, b) => b.data().createdAt - a.data().createdAt);
    postDocs = postDocs.slice(0, 50);
  } else {
    const snap = await query.get();
    postDocs = snap.docs;
  }

  // 自分がいいね済みの投稿IDを取得
  const postIds = postDocs.map(d => d.id);
  let likedPostIds = new Set<string>();
  if (postIds.length > 0) {
    const likeChunks: string[][] = [];
    for (let i = 0; i < postIds.length; i += 10) {
      likeChunks.push(postIds.slice(i, i + 10));
    }
    const likeResults = await Promise.all(
      likeChunks.map(chunk =>
        db.collection('likes')
          .where('userId', '==', userId)
          .where('postId', 'in', chunk)
          .get()
      )
    );
    likedPostIds = new Set(likeResults.flatMap(r => r.docs.map(d => d.data().postId)));
  }

  const posts = postDocs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    likedByMe: likedPostIds.has(doc.id),
  }));

  return c.json(posts);
});

// 投稿作成
sns.post('/posts', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { text, taskId, isAutoPost } = body;

  if (!text || text.trim().length === 0) return c.json({ error: 'text required' }, 400);
  if (text.length > 140) return c.json({ error: 'text too long' }, 400);

  const profileDoc = await db.collection('profiles').doc(userId).get();
  const profileData = profileDoc.data() ?? {};

  const now = Date.now();
  const post = {
    userId,
    displayName: profileData.displayName ?? 'プレイヤー',
    avatarId: profileData.avatarId ?? 'default',
    text: text.trim(),
    taskId: taskId ?? null,
    isAutoPost: isAutoPost ?? false,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
  };

  const ref = await db.collection('posts').add(post);
  return c.json({ id: ref.id, ...post }, 201);
});

// 投稿削除
sns.delete('/posts/:id', async (c) => {
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const ref = db.collection('posts').doc(postId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  await ref.delete();
  return c.json({ success: true });
});

// いいね / 取消
sns.post('/posts/:id/like', async (c) => {
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const likeSnap = await db.collection('likes')
    .where('postId', '==', postId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const postRef = db.collection('posts').doc(postId);
  const postDoc = await postRef.get();
  if (!postDoc.exists) return c.json({ error: 'Post not found' }, 404);

  let liked: boolean;
  let likesCount: number;

  if (!likeSnap.empty) {
    // いいね取消
    await likeSnap.docs[0].ref.delete();
    likesCount = Math.max(0, (postDoc.data()?.likesCount ?? 0) - 1);
    await postRef.update({ likesCount });
    liked = false;
  } else {
    // いいね
    await db.collection('likes').add({ postId, userId, createdAt: Date.now() });
    likesCount = (postDoc.data()?.likesCount ?? 0) + 1;
    await postRef.update({ likesCount });
    liked = true;
  }

  return c.json({ liked, likesCount });
});

// コメント一覧
sns.get('/posts/:id/comments', async (c) => {
  const postId = c.req.param('id');
  const snap = await db.collection('comments')
    .where('postId', '==', postId)
    .orderBy('createdAt', 'asc')
    .get();
  return c.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// コメント追加
sns.post('/posts/:id/comments', async (c) => {
  const userId = c.get('userId');
  const postId = c.req.param('id');
  const body = await c.req.json();
  const { text } = body;

  if (!text || text.trim().length === 0) return c.json({ error: 'text required' }, 400);
  if (text.length > 140) return c.json({ error: 'text too long' }, 400);

  const profileDoc = await db.collection('profiles').doc(userId).get();
  const profileData = profileDoc.data() ?? {};

  const now = Date.now();
  const comment = {
    postId,
    userId,
    displayName: profileData.displayName ?? 'プレイヤー',
    text: text.trim(),
    createdAt: now,
  };

  const ref = await db.collection('comments').add(comment);

  const postRef = db.collection('posts').doc(postId);
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    await postRef.update({ commentsCount: (postDoc.data()?.commentsCount ?? 0) + 1 });
  }

  return c.json({ id: ref.id, ...comment }, 201);
});

// コメント削除
sns.delete('/posts/:postId/comments/:commentId', async (c) => {
  const userId = c.get('userId');
  const { postId, commentId } = c.req.param();

  const ref = db.collection('comments').doc(commentId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  await ref.delete();

  const postRef = db.collection('posts').doc(postId);
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    await postRef.update({ commentsCount: Math.max(0, (postDoc.data()?.commentsCount ?? 0) - 1) });
  }

  return c.json({ success: true });
});

// フォロー / アンフォロー
sns.post('/follow/:targetUserId', async (c) => {
  const userId = c.get('userId');
  const targetUserId = c.req.param('targetUserId');

  if (userId === targetUserId) return c.json({ error: 'Cannot follow yourself' }, 400);

  const followSnap = await db.collection('follows')
    .where('followerId', '==', userId)
    .where('followingId', '==', targetUserId)
    .limit(1)
    .get();

  let following: boolean;
  if (!followSnap.empty) {
    await followSnap.docs[0].ref.delete();
    following = false;
  } else {
    await db.collection('follows').add({
      followerId: userId,
      followingId: targetUserId,
      createdAt: Date.now(),
    });
    following = true;
  }

  return c.json({ following });
});

// ユーザー検索
sns.get('/users/search', async (c) => {
  const userId = c.get('userId');
  const q = c.req.query('q') ?? '';
  if (q.length === 0) return c.json([]);

  const snap = await db.collection('profiles')
    .where('displayName', '>=', q)
    .where('displayName', '<=', q + '\uf8ff')
    .limit(20)
    .get();

  const users = snap.docs
    .filter(doc => doc.id !== userId)
    .map(doc => ({
      userId: doc.id,
      displayName: doc.data().displayName ?? 'プレイヤー',
      avatarId: doc.data().avatarId ?? 'default',
      level: doc.data().level ?? 1,
    }));

  // フォロー済みか確認
  if (users.length === 0) return c.json([]);
  const targetIds = users.map(u => u.userId);
  const followSnap = await db.collection('follows')
    .where('followerId', '==', userId)
    .where('followingId', 'in', targetIds.slice(0, 10))
    .get();
  const followedSet = new Set(followSnap.docs.map(d => d.data().followingId));

  return c.json(users.map(u => ({ ...u, followedByMe: followedSet.has(u.userId) })));
});

export default sns;
