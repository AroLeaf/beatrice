import { ClientEvents } from 'detritus-client/lib/constants'
import { ShardClient } from 'detritus-client'

import { loader } from './loader';

export class BaseListener {
  declare event: ClientEvents;
  run?(payload: any, client: ShardClient): any;
  repeat = true;

  connect(client: ShardClient) {
    this.repeat 
      ? client.on(this.event, payload => this.run?.(payload, client))
      : client.once(this.event, payload => this.run?.(payload, client));
  }
}


export async function loadListeners(client: ShardClient, ...dir: string[]) {
  const listeners = await loader<typeof BaseListener>(...dir);
    for (const listener of listeners) {
      new listener().connect(client);
    }
}