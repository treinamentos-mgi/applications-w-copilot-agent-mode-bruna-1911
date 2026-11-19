import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
const activityNames: Record<string, string> = {
  run: 'Corrida',
  cycle: 'Ciclismo',
  walk: 'Caminhada',
  strength: 'Força',
};

export default function Activities() {
  return <CapabilityCard<Activity> title="Atividades" description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
    path="/api/activities" responseKey="activities" emptyText="Nenhuma atividade encontrada."
    renderItem={(activity) => <>{activityNames[activity.type] ?? activity.type}: {activity.minutes} minutos, {activity.points} pontos</>} />;
}
