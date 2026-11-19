import { Schema, model } from 'mongoose';

const teamSchema = new Schema({
  name: { type: String, required: [true, 'O nome da equipe é obrigatório'], trim: true },
  mascot: { type: String, required: [true, 'O mascote é obrigatório'], trim: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const Team = model('Team', teamSchema);
