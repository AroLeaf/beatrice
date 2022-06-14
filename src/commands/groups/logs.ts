import { ApplicationCommandOptionTypes, ChannelTypes, ClientEvents, MessageFlags } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import { Channel } from 'detritus-client/lib/structures';
import * as db from '@db';
import makeReply from '@lib/reply';
import { ComponentActionRow, ComponentContext } from 'detritus-client/lib/utils';

interface CommandArgs {
  group: string
  channel: Channel
}

interface SelectMenuArgs {
  group: db.mongoose.Document<unknown, any, db.GroupDoc> & db.GroupDoc & { _id: db.mongoose.Types.ObjectId }
  channel: Channel
}

const supported = [
  ClientEvents.MESSAGE_UPDATE,
  ClientEvents.MESSAGE_DELETE,

  ClientEvents.CHANNEL_CREATE,
  ClientEvents.CHANNEL_UPDATE,
  ClientEvents.CHANNEL_DELETE,

  ClientEvents.THREAD_CREATE,
  ClientEvents.THREAD_UPDATE,
  ClientEvents.THREAD_DELETE,
];

export class GroupLogs extends CommandOption {
  name = 'logs';
  description = 'Edits logging settings for a group';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.STRING,
        name: 'group',
        description: 'the group to edit logging settings on',
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.CHANNEL,
        name: 'channel',
        description: 'a channel to log to',
        channel_types: [ChannelTypes.GUILD_TEXT],
        required: true,
      }],
    });
  }

  async run(context: InteractionContext, args: CommandArgs) {
    const reply = makeReply(context);
    const group = await db.Group.findOne({ name: args.group, guild: context.guildId });
    if (!group) return reply(`Group "${args.group}" does not exist, I suppose`);
    if (args.channel.type !== ChannelTypes.GUILD_TEXT) return reply('invalid channel type for logging');

    context.editOrRespond({
      content: `Logging settings for ${group.name} to ${args.channel.mention}:`,
      components: [new ComponentActionRow().addSelectMenu({
        label: 'Select events',
        options: supported.map(opt => ({ label: opt, value: opt, default: group.logs?.[opt] === args.channel.id })),
        run: (ctx: ComponentContext) => this.runSelectMenu(ctx, { channel: args.channel, group }),
        min_values: 0,
        max_values: supported.length,
      })],
      flags: MessageFlags.EPHEMERAL,
    });
  }

  async runSelectMenu(context: ComponentContext, args: SelectMenuArgs) {
    const logs = { ...args.group.logs };
    for (const event of context.data.values||[]) {
      logs[event] = args.channel.id;
    }
    await args.group.updateOne({ logs });
    context.editOrRespond({
      content: `log settings for ${args.group.name} updated`,
      components: [],
    });
  }
}