import { Interaction, Structures } from 'detritus-client';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, InteractionCallbackTypes, MessageFlags } from 'detritus-client/lib/constants';

import * as env from '@env';

export class BaseCommand<ParsedArgsFinished = Interaction.ParsedArgs> extends Interaction.InteractionCommand<ParsedArgsFinished> {
  triggerLoadingAfter = 1000;

  constructor(data: Interaction.InteractionCommandOptions) {
    super(Object.assign(data, process.env.NODE_ENV === 'production' ? {} : {
      guildIds: env.bot.GUILDS,
      global: false,
    }));
  }

  onLoadingTrigger(context: Interaction.InteractionContext) {
    return context.responded || context.respond(
      InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      { flags: this.triggerLoadingAsEphemeral ? MessageFlags.EPHEMERAL : 0 },
    );
  }

  onRunError(context: Interaction.InteractionContext, _args: Interaction.ParsedArgs, error: Error) {
    context.editOrRespond({ content: error.message, flags: MessageFlags.EPHEMERAL });
    console.error(error);
  }
}


export class SlashCommand<ParsedArgsFinished = Interaction.ParsedArgs> extends BaseCommand<ParsedArgsFinished> {
  type = ApplicationCommandTypes.CHAT_INPUT;
}


export class CommandOption<ParsedArgsFinished = Interaction.ParsedArgs> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
  type = ApplicationCommandOptionTypes.SUB_COMMAND;
}


export interface ContextMenuMessageArgs {
  message: Structures.Message,
}

export class MessageCommand extends BaseCommand<ContextMenuMessageArgs> {
  type = ApplicationCommandTypes.MESSAGE;
}


export interface ContextMenuUserArgs {
  member?: Structures.Member,
  user: Structures.User,
}

export class UserCommand extends BaseCommand<ContextMenuUserArgs> {
  type = ApplicationCommandTypes.USER;
}