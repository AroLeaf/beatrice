import mongoose from 'mongoose';

export interface ConfigDoc {
  guild: string
}

const config = new mongoose.Schema<ConfigDoc>({
  guild: String,
});

export default mongoose.model<ConfigDoc>('Config', config);