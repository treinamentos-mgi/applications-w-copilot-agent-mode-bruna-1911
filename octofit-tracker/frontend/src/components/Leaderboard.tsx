import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
const loadLeaderboard = async () =>
  (await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')).leaderboard;

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry> title="Placar" description="Compare a pontuação total das equipes."
    loadItems={loadLeaderboard} emptyText="Sem pontuação no placar."
    renderItem={(entry) => <>{entry.rank}º lugar: {entry.teamName} — {entry.totalPoints} pontos</>} />;
}
