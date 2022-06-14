import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import * as db from '@db';
import makeReply from '@lib/reply';

interface CommandArgs {
  group: string
  migrate?: string
}

export class GroupRemove extends CommandOption {
  name = 'remove';
  description = 'Removes a group';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.STRING,
        name: 'group',
        description: 'the name of the group you want to remove',
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'migrate',
        description: 'the name of the group to migrate channels to',
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const group = await db.Group.findOne({ name: args.group, guild: context.guildId });
    if (!group) return reply(`Group "${args.group}" does not exist, I suppose`);

    if (args.migrate) {
      const migrate = await db.Group.findOne({ name: args.migrate, guild: context.guildId });
      if (!migrate) return reply(`Group "${args.migrate}" does not exist, I suppose`);
      await migrate.updateOne({ $push: { channels: { $each: group.channels } } });
    }
    
    await group.deleteOne();

    reply(`Group "${args.group}" removed`);
  }
}