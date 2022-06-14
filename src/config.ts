import { ShardClientOptions } from 'detritus-client';
import { GatewayIntents } from 'detritus-client-socket/lib/constants';

export const config: ShardClientOptions = {
  gateway: {
    intents: [
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.GUILD_MEMBERS,
    ],
  }
}

export { config as default };