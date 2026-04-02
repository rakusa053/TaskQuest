import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const note = new Hono<{ Variables: { userId: string } }>();
note.use('*', authMiddleware);

// スコアに応じた報酬
function calcReward(score: number): { xp: number; money: number } {
  if (score >= 80) return { xp: 30, money: 15 };
  if (score >= 60) return { xp: 20, money: 10 };
  if (score >= 40) return { xp: 10, money: 5 };
  return { xp: 5, money: 2 };
}

// ノート評価
note.post('/evaluate', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { imageBase64, taskId } = body;

  if (!imageBase64 || !taskId) {
    return c.json({ error: 'imageBase64 and taskId are required' }, 400);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'GEMINI_API_KEY not configured' }, 500);
  }

  // タスクに既に評価済みか確認
  const taskRef = db.collection('tasks').doc(taskId);
  const taskDoc = await taskRef.get();
  if (!taskDoc.exists) return c.json({ error: 'Task not found' }, 404);
  if (taskDoc.data()?.noteEvaluated) {
    return c.json({ error: 'Already evaluated' }, 400);
  }

  // Gemini Vision API 呼び出し
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `このノートの写真を見て、勉強の頑張りを評価してください。

以下の観点で100点満点でスコアをつけ、コメントをしてください：
- 文字の丁寧さ・見やすさ
- ノートの充実度（量・内容）
- 図や色分けなどの工夫

必ず以下のJSON形式のみで返してください（他のテキストは不要）：
{
  "score": 85,
  "comment": "全体的な評価コメント",
  "points": ["良かった点1", "良かった点2"],
  "advice": "もっと良くするためのアドバイス"
}`
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64,
              }
            }
          ]
        }],
        generationConfig: { temperature: 0.4 }
      })
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error('Gemini API error:', err);
    return c.json({ error: 'Gemini API failed' }, 500);
  }

  const geminiData = await geminiRes.json() as any;
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  let evaluation: { score: number; comment: string; points: string[]; advice: string };
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    evaluation = JSON.parse(jsonMatch?.[0] ?? '{}');
    if (typeof evaluation.score !== 'number') throw new Error('invalid');
  } catch {
    return c.json({ error: 'Failed to parse Gemini response' }, 500);
  }

  // 報酬付与
  const reward = calcReward(evaluation.score);
  const profileRef = db.collection('profiles').doc(userId);
  const profileDoc = await profileRef.get();
  const profileData = profileDoc.data() ?? {};

  await profileRef.set({
    xp: (profileData.xp ?? 0) + reward.xp,
    totalXp: (profileData.totalXp ?? 0) + reward.xp,
    money: (profileData.money ?? 0) + reward.money,
    totalMoneyEarned: (profileData.totalMoneyEarned ?? 0) + reward.money,
    weeklyPoints: (profileData.weeklyPoints ?? 0) + reward.xp,
  }, { merge: true });

  // タスクに評価済みフラグ
  await taskRef.set({ noteEvaluated: true }, { merge: true });

  return c.json({
    score: evaluation.score,
    comment: evaluation.comment,
    points: evaluation.points,
    advice: evaluation.advice,
    reward,
  });
});

export default note;
