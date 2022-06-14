import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import { Channel, Overwrite } from 'detritus-client/lib/structures';
import * as db from '@db';
import makeReply from '@lib/reply';

interface CommandArgs {
  name: string
  follows?: Channel
  copies?: Channel
}

export class GroupCreate extends CommandOption {
  name = 'create';
  description = 'Creates a new group';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.STRING,
        name: 'name',
        description: 'the name of the new group',
        required: true,
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
  
    if (await db.Group.exists({ name: args.name })) return reply(`A group called "${args.name}" already exists, I suppose`);
    if (args.copies && args.follows) return reply('You can\'t set both `copies` and `follows`, I suppose');

    const overwritesToObjects = (overwrites?: Overwrite[]) => overwrites?.map(overwrite => ({
      type: overwrite.type,
      id: overwrite.id,
      deny: Number(overwrite.deny),
      allow: Number(overwrite.allow),
    }));

    await db.Group.create({
      guild: context.guildId,
      name: args.name,
      follows: args.follows?.id,
      permissions: overwritesToObjects(args.copies?.permissionOverwrites.toArray()) || [],
    });

    reply(`Group ${args.name} created`);
  }
}