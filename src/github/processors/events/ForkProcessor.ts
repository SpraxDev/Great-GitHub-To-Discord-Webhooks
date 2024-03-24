import { singleton } from 'tsyringe';
import { Hook } from '../../../config/AppConfiguration';
import DiscordWebHookSender from '../../../discord/DiscordWebHookSender';
import WebHookEvent from '../../WebHookEvent';
import WebHookEventProcessor from '../../WebHookEventProcessor';

@singleton()
export default class ForkProcessor extends WebHookEventProcessor {
  constructor(private readonly discordWebHookSender: DiscordWebHookSender) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    // TODO: Validate event.payload.forkee
    await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
      title: `[${event.payload.repository.name}] Repository forked`,
      description: `Repository has been forked at [${(event.payload as any).forkee.full_name}](${(event.payload as any).forkee.html_url})`,
      url: `${event.payload.repository.html_url}/forks`,
      color: DiscordWebHookSender.COLOR_INFO
    }, event.payload.sender, event.payload.organization);
    return true;
  }
}
