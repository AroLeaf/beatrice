import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Channel, Guild, Member, MemberOrUser } from 'detritus-client/lib/structures';
import { CommandOption } from '@lib/commands';
import makeReply from '@lib/reply';

interface CommandContext extends InteractionContext {
  guild: Guild;
  channel: Channel
}

interface CommandArgs {
  user: MemberOrUser
  days: number
}

export class PurgeUser extends CommandOption {
  name = 'user';
  description = 'Purges all messages a user sent in the last 1-7 days. This can only be done with non-members.';

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.USER,
        name: 'user',
        description: 'the user you want to delete messages of',
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.INTEGER,
        name: 'days',
        description: 'until how many days ago messages should be deleted',
        required: true,
        minValue: 1,
        maxValue: 7,
      }],
    });
  }

  async run(context: CommandContext, args: CommandArgs) {
    if (!context.guild || !args.user || !args.days) return;
    const reply = makeReply(context);
    
    if (args.user instanceof Member) return reply('That user is a member of this server, I suppose');
    const ban = await context.rest.raw.fetchGuildBan(context.guildId!, args.user.id).catch(() => {});
    
    if (ban) {
      await context.guild.removeBan(args.user.id, { reason: 'purge' });
      await context.guild.createBan(args.user.id, { reason: 'purge', deleteMessageDays: args.days.toString() });
    } else {
      await context.guild.createBan(args.user.id, { reason: 'purge', deleteMessageDays: args.days.toString() });
      await context.guild.removeBan(args.user.id, { reason: 'purge' });
    }

    reply(`Successfully purged all messages ${args.user.mention} sent in the last **${args.days}** days`);
  }
}