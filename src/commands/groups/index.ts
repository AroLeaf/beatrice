import { Permissions } from 'detritus-client/lib/constants';
import { SlashCommand } from '@lib/commands';

import { GroupCreate } from './create';
import { GroupEdit } from './edit';
import { GroupList } from './list';
import { GroupLogs } from './logs';
import { GroupRemove } from './remove';
import { GroupSet } from './set';
import { GroupUpdate } from './update';

export default class Purge extends SlashCommand {
  name = 'groups';
  description = 'Channel permission groups';
  permissions = [Permissions.MANAGE_CHANNELS];
  permissionsClient = [Permissions.ADMINISTRATOR];
  triggerLoadingAsEphemeral = true;
  disableDm = true;

  constructor() {
    super({
      options: [
        new GroupCreate(),
        new GroupEdit(),
        new GroupList(),
        new GroupLogs(),
        new GroupRemove(),
        new GroupSet(),
        new GroupUpdate(),
      ],
    });
  }
}