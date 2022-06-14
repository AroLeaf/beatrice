import { ApplicationCommandOptionTypes, MessageComponentButtonStyles, MessageComponentTypes, MessageFlags } from 'detritus-client/lib/constants';
import { ComponentButton, ComponentContext } from 'detritus-client/lib/utils';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { CommandOption } from '@lib/commands';
import { MemberOrUser, Message } from 'detritus-client/lib/structures';
import * as XRegExp from 'xregexp';

interface CommandArgs {
  count: number
  before?: string
  user?: MemberOrUser
  contains?: string,
}

export class PurgeLast extends CommandOption {
  name = 'last';
  description = 'Purges messages from a channel';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.INTEGER,
        name: 'count',
        description: 'how many messages to purge',
        minValue: 2,
        maxValue: 100,
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.USER,
        name: 'user',
        description: 'only delete messages sent by this user',
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'contains',
        description: 'only deleting messages containing this',
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'before',
        description: 'start looking for messages before this object (message, guild, channel, etc) was created',
      }],
    });
  }

  async run(context: InteractionContext | ComponentContext, args: CommandArgs) {
    if (!context.channel) return;

    if (args.before && !/\d+/.test(args.before)) return context.editOrRespond({ content: `"${args.before}" is not a valid discord snowflake, I suppose`, flags: MessageFlags.EPHEMERAL })

    const messages = await context.channel.fetchMessages({
      before: args.before || context.interaction.id,
      limit: args.count,
    }).then(res => res.filter(msg => msg.createdAtUnix >= Date.now() - 14 * 24 * 3_600_000));

    if (!messages.length) return context.editOrRespond({ content: 'You can\'t purge messages older than 2 weeks, I suppose', flags: MessageFlags.EPHEMERAL });
    
    const filters: ((messages: Message[]) => Message[])[] = [
      /*  user */ (messages: Message[]) => args.user ? messages.filter(msg => msg.author.id === args.user!.id) : messages,
      /* match */ (messages: Message[]) => args.contains ? messages.filter(msg => {
        const match = /^\/([^]+)\/([gimuynsxA]*)$/.exec(args.contains!);
        return match
          ? XRegExp.test(msg.content, XRegExp(match[1], match[2]))
          : msg.content.includes(args.contains!);
      }) : messages,
    ];

    const filtered = filters.reduce((messages, filter) => filter(messages), messages);
    const until = messages.sort((a,b) => a.createdAtUnix - b.createdAtUnix)[0].id;

    if (filtered.length === 1) await context.channel.deleteMessage(filtered[0].id);
    if (filtered.length > 1) await context.channel.bulkDelete(filtered.map(msg => msg.id));
    
    const repeats = [5, 25, 100];
    if (!repeats.includes(args.count)) repeats.push(args.count);
    
    context.editOrRespond({
      content: `Successfully deleted ${filtered.length || 'no'} messages\nfurther filtering will start [here](https://discord.com/channels/${context.guildId}/${context.channelId}/${until})`,
      flags: MessageFlags.EPHEMERAL,
      components: [{
        type: MessageComponentTypes.ACTION_ROW,
        components: repeats.map(count => new ComponentButton({
          style: MessageComponentButtonStyles.SUCCESS,
          label: `${filters.length ? 'filter' : 'purge'} ${count} more`,
          run: (context: ComponentContext) => this.run(context, {
            ...args, count,
            before: until,
          }),
        })),
      }],
    });
  }
}