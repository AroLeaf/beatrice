import { InteractionCommandClient, ShardClient } from 'detritus-client';
import { res } from 'file-ez';

import * as env from '@env';
import config from './config';
import { loadListeners } from '@lib/listeners';

(async () => {
  const client = new ShardClient(env.bot.TOKEN, config);
  await loadListeners(client, res('./listeners'));

  const interactions = new InteractionCommandClient(client);
  await interactions.addMultipleIn('./commands');
  await interactions.run()
  //.catch(err => console.error(err.errors, JSON.stringify(err.errors, null, 2))));
})();