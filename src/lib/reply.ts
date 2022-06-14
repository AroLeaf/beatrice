import { MessageFlags } from 'detritus-client/lib/constants'
import { InteractionEditOrRespond } from 'detritus-client/lib/structures'

interface Context {
  editOrRespond(options: InteractionEditOrRespond): Promise<any>
}

export default function makeReply(context: Context) {
  return (content: string) => context.editOrRespond({ content, flags: MessageFlags.EPHEMERAL });
}