import { ApplicationCommandOptionTypes, MessageFlags, Permissions } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { Guild, Member, MemberOrUser } from 'detritus-client/lib/structures';
import { SlashCommand } from '@lib/commands';
import makeReply from '@lib/reply';

interface CommandArgs {
  user: MemberOrUser
  reason: string
}

interface CommandContext extends InteractionContext {
  guild: Guild;
}

export default class Ban extends SlashCommand {
  name = 'ban';
  description = 'Permanently removes a member from the server';
  permissions = [Permissions.BAN_MEMBERS];
  permissionsClient = [Permissions.BAN_MEMBERS];
  triggerLoadingAsEphemeral = true;
  disableDm = true;

  constructor() {
    super({
      options: [{
        type: ApplicationCommandOptionTypes.USER,
        name: 'user',
        description: 'user you want to ban',
        required: true,
      }, {
        type: ApplicationCommandOptionTypes.STRING,
        name: 'reason',
        description: 'why this user is being banned',
      }],
    });
  }

  async run(context: CommandContext, args: CommandArgs) {
    const reply = makeReply(context);
    if (args.user instanceof Member) {
      if (args.user.isOwner) return reply('You are not allowed to ban the owner, I suppose');
      const pos = (member: Member | null | undefined) => member?.highestRole?.position || 0;
      if (pos(context.me) <= pos(args.user)) return reply(`I am not allowed to ban ${args.user.mention}, I suppose`);
      if (pos(context.member) <= pos(args.user)) return reply(`You are not allowed to ban ${args.user.mention}, I suppose`);
    };

    await context.guild.createBan(args.user.id, { reason: args.reason });
    return reply(`${args.user.mention} has been banned`);
  }

  onRunError(context: CommandContext, args: CommandArgs, error: Error) {
    context.editOrRespond({ content: `${args.user.mention} could not be banned`, flags: MessageFlags.EPHEMERAL });
    console.error(error);
  }
}