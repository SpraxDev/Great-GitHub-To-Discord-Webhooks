import { singleton } from 'tsyringe';
import { Hook } from '../../../config/AppConfiguration';
import DiscordWebHookSender from '../../../discord/DiscordWebHookSender';
import WebHookEvent from '../../WebHookEvent';
import WebHookEventProcessor from '../../WebHookEventProcessor';

@singleton()
export default class PingProcessor extends WebHookEventProcessor {
  constructor(private readonly discordWebHookSender: DiscordWebHookSender) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    await this.discordWebHookSender.sendOnPing(hook.discordWebhookUrl, event.payload.organization);
    return true;
  }
}
