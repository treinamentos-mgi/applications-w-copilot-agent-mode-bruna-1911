import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };
const loadWorkouts = async () =>
  (await getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')).suggestions;

export default function Workouts() {
  return <CapabilityCard<Workout> title="Sugestões de treino" description="Recomendações de treino para mona@example.com, a pessoa de demonstração."
    loadItems={loadWorkouts} emptyText="Nenhuma sugestão de treino encontrada."
    renderItem={(workout) => <>{workout.title} — {workout.reason}</>} />;
}
