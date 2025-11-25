export interface ScoreEntry {
  score: number;
  date: string;
}

const MAX_SCORES = 5;

export const saveScore = (gameKey: string, score: number): void => {
  const scores = getScores(gameKey);
  scores.push({
    score,
    date: new Date().toISOString(),
  });
  
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, MAX_SCORES);
  
  localStorage.setItem(`leaderboard_${gameKey}`, JSON.stringify(topScores));
};

export const getScores = (gameKey: string): ScoreEntry[] => {
  const stored = localStorage.getItem(`leaderboard_${gameKey}`);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const isTopScore = (gameKey: string, score: number): boolean => {
  const scores = getScores(gameKey);
  if (scores.length < MAX_SCORES) return true;
  return score > scores[scores.length - 1].score;
};
