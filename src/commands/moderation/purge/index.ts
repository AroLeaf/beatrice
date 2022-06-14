import { Permissions } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { SlashCommand } from '@lib/commands';
import { PurgeLast } from './last';
import { PurgeUser } from './user';

export default class Purge extends SlashCommand {
  name = 'purge';
  description = 'tools to delete messages in bulk';
  permissions = [Permissions.MANAGE_MESSAGES];
  permissionsClient = [Permissions.MANAGE_MESSAGES, Permissions.BAN_MEMBERS];
  triggerLoadingAsEphemeral = true;
  disableDm = true;

  constructor() {
    super({
      options: [
        new PurgeLast(),
        new PurgeUser(),
      ],
    });
  }

  onRunError(context: InteractionContext, args: any, error: Error) {
    super.onRunError(context, args, new Error('Purge failed', { cause: error }));
  }
}