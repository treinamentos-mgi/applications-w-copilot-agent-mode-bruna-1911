import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: [true, 'O título é obrigatório'], trim: true },
  focus: { type: String, required: [true, 'O foco é obrigatório'], trim: true },
  minutes: { type: Number, required: [true, 'A duração é obrigatória'], min: [1, 'A duração deve ser de pelo menos um minuto'] },
  difficulty: { type: String, required: [true, 'A dificuldade é obrigatória'], trim: true },
});

export const Workout = model('Workout', workoutSchema);
