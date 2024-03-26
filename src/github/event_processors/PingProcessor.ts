import { singleton } from 'tsyringe';
import { Hook } from '../../config/AppConfiguration';
import DiscordWebHookSender from '../../discord/DiscordWebHookSender';
import GitHubPayloadValidator from '../payload/GitHubPayloadValidator';
import WebHookEvent from '../WebHookEvent';
import WebHookEventProcessor from '../WebHookEventProcessor';

@singleton()
export default class PingProcessor extends WebHookEventProcessor {
  constructor(
    private readonly payloadValidator: GitHubPayloadValidator,
    private readonly discordWebHookSender: DiscordWebHookSender
  ) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    this.payloadValidator.assert(this.payloadValidator.validatorPingEvent, event.payload);

    await this.discordWebHookSender.sendOnPing(hook.discordWebhookUrl, event.payload.organization);
    return true;
  }
}
