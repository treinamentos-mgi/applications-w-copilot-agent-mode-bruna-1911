import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Os dados da atividade são inválidos'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes < 1
  ) {
    throw Object.assign(new Error('Informe pessoa, equipe, tipo e duração válida para a atividade'), { status: 400 });
  }

  if (!/^[\da-f]{24}$/i.test(userId) || !/^[\da-f]{24}$/i.test(teamId)) {
    throw Object.assign(new Error('A pessoa ou a equipe informada é inválida'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('A pessoa ou a equipe informada não foi encontrada'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Os dados da equipe são inválidos'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !/^[\da-f]{24}$/i.test(member))
  ) {
    throw Object.assign(new Error('Informe nome e mascote para a equipe e integrantes válidos'), { status: 400 });
  }

  const users = members.length ? await User.find({ _id: { $in: members } }) : [];
  if (users.length !== members.length) {
    throw Object.assign(new Error('Um ou mais integrantes informados não foram encontrados'), { status: 404 });
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: users.map((user) => user._id),
  });
  if (users.length) {
    await User.updateMany({ _id: { $in: users.map((user) => user._id) } }, { $set: { team: team._id } });
  }
  return team;
}

export async function getLeaderboard() {
  const teams = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw Object.assign(new Error('A pessoa informada não foi encontrada'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    walk: 'endurance',
    strength: 'strength',
  };
  const focus = (recentActivity && activityFocus[recentActivity.type]) || user.fitnessGoal;
  const activityReason: Record<string, string> = {
    run: 'sua atividade de corrida',
    cycle: 'sua atividade de ciclismo',
    walk: 'sua atividade de caminhada',
    strength: 'sua atividade de força',
  };
  const reason = (recentActivity && activityReason[recentActivity.type]) || `sua meta de ${focus}`;
  const workouts = await Workout.find().lean();

  return workouts
    .sort((left, right) => Number(right.focus === focus) - Number(left.focus === focus))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === focus
        ? `Recomendado com base na ${reason}.`
        : `Sugestão complementar para ${reason}.`,
    }));
}

export { User };
