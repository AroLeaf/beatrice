import { ClientEvents } from 'detritus-client/lib/constants';
import { BaseListener } from '@lib/listeners';

export default class ReadyListener extends BaseListener {
  event = ClientEvents.GATEWAY_READY;
  repeat = false;

  async run() {
    console.log('ready!');
  }
}