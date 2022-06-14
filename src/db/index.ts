import mongoose from 'mongoose';
import Config, { ConfigDoc } from './config';
import Group, { GroupDoc } from './group';
import * as env from '@env';

mongoose.connect(env.MONGO);

export {
  mongoose,
  Config, ConfigDoc,
  Group, GroupDoc,
}