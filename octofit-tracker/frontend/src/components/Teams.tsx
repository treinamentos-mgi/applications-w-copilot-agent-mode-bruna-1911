import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<Team> title="Equipes" description="Gerencie equipes e integrantes."
    path="/api/teams" responseKey="teams" emptyText="Nenhuma equipe encontrada."
    renderItem={(team) => <>{team.name} — {team.members.length} integrante(s)</>} />;
}
