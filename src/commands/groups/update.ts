import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import * as db from '@db';
import makeReply from '@lib/reply';
import { Channel, Overwrite } from 'detritus-client/lib/structures';

interface CommandArgs {
  group: string
}

export class GroupUpdate extends CommandOption {
  name = 'update';
  description = 'Updates permissions for all channels in a group, or all groups';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.STRING,
        name: 'group',
        description: 'the group to update, default: all',
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const group = await db.Group.findOne({ name: args.group, guild: context.guildId });
    const groups = group ? [group] : await db.Group.find({ guild: context.guildId });

    const promises = [];
    for (const group of groups) {
      const overwritesToObjects = (overwrites?: Overwrite[]) => overwrites?.map(overwrite => ({
        type: overwrite.type,
        id: overwrite.id,
        deny: Number(overwrite.deny),
        allow: Number(overwrite.allow),
      }));
      const permissions = group.follows
        && overwritesToObjects(context.client.channels.get(group.follows)?.permissionOverwrites.toArray()) 
        || group.permissions;

      const channels = group.channels.map(id => context.client.channels.get(id));
      for (const channel of channels.filter(channel => channel?.isGuildChannel && channel.id !== group.follows) as Channel[]) {
        promises.push(channel.edit({ permissionOverwrites: permissions }));
      }
    }

    await Promise.all(promises);
    reply(`Permissions ${promises.length ? 'updated' : 'up-to-date'} for ${group ? group.name : 'all groups'}`);
  }
}