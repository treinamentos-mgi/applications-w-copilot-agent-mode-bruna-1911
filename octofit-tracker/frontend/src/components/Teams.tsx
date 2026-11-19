import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };
const loadTeams = async () => (await getJson<{ teams: Team[] }>('/api/teams')).teams;

export default function Teams() {
  return <CapabilityCard<Team> title="Equipes" description="Gerencie equipes e integrantes."
    loadItems={loadTeams} emptyText="Nenhuma equipe encontrada."
    renderItem={(team) => <>{team.name} — {team.members.length} integrante(s)</>} />;
}
