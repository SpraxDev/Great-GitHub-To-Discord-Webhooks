import { singleton } from 'tsyringe';
import { Hook } from '../../config/AppConfiguration';
import DiscordWebHookSender from '../../discord/DiscordWebHookSender';
import GitHubPayloadValidator from '../payload/GitHubPayloadValidator';
import WebHookEvent from '../WebHookEvent';
import WebHookEventProcessor from '../WebHookEventProcessor';

@singleton()
export default class ForkProcessor extends WebHookEventProcessor {
  constructor(
    private readonly payloadValidator: GitHubPayloadValidator,
    private readonly discordWebHookSender: DiscordWebHookSender
  ) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    this.payloadValidator.assert(this.payloadValidator.validatorForkEvent, event.payload);

    await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
      title: `[${event.payload.repository.name}] Repository forked`,
      description: `Repository has been forked at [${event.payload.forkee.full_name}](${event.payload.forkee.html_url})`,
      url: `${event.payload.repository.html_url}/forks`,
      color: DiscordWebHookSender.COLOR_INFO
    }, event.payload.sender, event.payload.organization);
    return true;
  }
}
