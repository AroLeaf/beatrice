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
  name = 'get';
  description = 'Finds out what group a channel is in';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.CHANNEL,
        name: 'channel',
        description: 'the channel to add to a group, default: the current channel',
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const channel = args.channel || context.channel!;
    const group = await db.Group.findOne({ channels: channel.id });
    reply(`${channel.mention} is ${group ? `in ${group.name}` : 'not in a group'}`);
  }
}