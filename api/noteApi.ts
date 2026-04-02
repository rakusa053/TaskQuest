import apiClient from './client';

export interface NoteEvaluationResult {
  score: number;
  comment: string;
  points: string[];
  advice: string;
  reward: { xp: number; money: number };
}

export async function evaluateNote(
  imageBase64: string,
  taskId: string
): Promise<NoteEvaluationResult> {
  const res = await apiClient.post('/api/note/evaluate', { imageBase64, taskId });
  return res.data;
}
