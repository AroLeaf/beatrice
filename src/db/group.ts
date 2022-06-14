import mongoose from 'mongoose';

export interface GroupDoc {
  guild: string,
  name: string
  channels: string[]
  follows?: string
  permissions: {
    id: string
    type: 0|1
    allow: number
    deny: number
  }[]
}

const group = new mongoose.Schema<GroupDoc>({
  guild: String,
  name: String,
  channels: [String],
  follows: String,
  permissions: [{
    id: String,
    type: { type: Number },
    allow: String,
    deny: String,
  }],
});

export default mongoose.model<GroupDoc>('Group', group);