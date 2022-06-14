import { MessageFlags } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { SlashCommand } from '@lib/commands';

export default class Ping extends SlashCommand {
  name = 'ping';
  description = 'pong!';

  async run(context: InteractionContext) {
    const ping = await context.client.ping();
    context.editOrRespond({ content: `Pong!\ngateway: ${ping.gateway}ms\nREST: ${ping.rest}ms`, flags: MessageFlags.EPHEMERAL });
  }
}