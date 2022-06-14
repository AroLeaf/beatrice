import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import { Channel } from 'detritus-client/lib/structures';
import * as db from '@db';
import makeReply from '@lib/reply';

interface CommandArgs {
  group: string
  name?: string
  follows?: Channel
  copies?: Channel
}

export class GroupEdit extends CommandOption {
  name = 'edit';
  description = 'Edits a group';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.STRING,
        name: 'group',
        description: 'the group to edit',
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'name',
        description: 'a new name for this group',
      }, {
        type: ApplicationCommandOptionTypes.CHANNEL,
        name: 'follows',
        description: 'a channel to mirror permissions of',
      }, {
        type: ApplicationCommandOptionTypes.CHANNEL,
        name: 'copies',
        description: 'a channel to copy permissions of',
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const group = await db.Group.findOne({ name: args.group, guild: context.guildId });
    if (!group) return reply(`Group "${args.group}" does not exist, I suppose`);
    
    if (group.name !== args.name && await db.Group.exists({ name: args.name, guild: context.guildId })) return reply(`A group called "${args.name}" already exists, I suppose`);
    if (args.copies && args.follows) return reply('You can\'t set both `copies` and `follows`, I suppose');

    await group.updateOne({
      name: args.name || group.name,
      follows: args.copies ? undefined : args.follows?.id || group.follows,
      permissions: args.follows ? [] : args.copies?.permissionOverwrites.toArray() || group.permissions,
    });

    const edits = [];
    if (args.name) edits.push(`now called "${args.name}"`);
    if (args.follows) edits.push(`now follows ${args.follows.mention}`);
    if (args.copies) edits.push(`now has the permissions of ${args.copies.mention}`);
    reply(`Group ${args.name || args.group} edited: \n- ${edits.join('\n- ')}`);
  }
}