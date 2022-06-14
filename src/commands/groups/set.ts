import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import { Channel } from 'detritus-client/lib/structures';
import * as db from '@db';
import makeReply from '@lib/reply';

interface CommandArgs {
  group: string
  channel?: Channel
}

export class GroupSet extends CommandOption {
  name = 'set';
  description = 'Sets the group of a channel';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.CHANNEL,
        name: 'channel',
        description: 'the channel to add to a group, default: the current channel',
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'group',
        description: 'the group to add the channel to, default: no group',
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const group = await db.Group.findOne({ name: args.group, guild: context.guildId });
    const channel = args.channel || context.channel!;

    await db.Group.updateMany({ channels: channel.id }, { $pull: { channels: channel.id } });
    if (group) {
      await group.updateOne({ $push: { channels: channel.id } });
      return reply(`${channel.mention} is now in ${group.name}`);
    }

    reply(`${channel.mention} is now not in any group`);
  }
}