import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };

export default function Workouts() {
  return <CapabilityCard<Workout> title="Sugestões de treino" description="Recomendações de treino para mona@example.com, a pessoa de demonstração."
    path="/api/workouts/suggestions/mona%40example.com" responseKey="suggestions" emptyText="Nenhuma sugestão de treino encontrada."
    renderItem={(workout) => <>{workout.title} — {workout.reason}</>} />;
}
