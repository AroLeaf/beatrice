import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import * as db from '@db';
import { MessageFlags } from 'detritus-client/lib/constants';

export class GroupList extends CommandOption {
  name = 'list';
  description = 'Lists all groups for this server';

  async run(context: InteractionContext) {
    const groups = await db.Group.find({ guild: context.guildId });

    const embed = {
      title: 'Permission groups',
      description: groups.length ? undefined : 'No groups',
      fields: groups.map(group => ({
        name: group.name,
        value: `Follows: ${group.follows ? `<#${group.follows}>` : 'none'}\nChannels: ${group.channels.map(c => `<#${c}>`).join(', ')}`,
        inline: true,
      })),
    }

    context.editOrRespond({ embed, flags: MessageFlags.EPHEMERAL });
  }
}