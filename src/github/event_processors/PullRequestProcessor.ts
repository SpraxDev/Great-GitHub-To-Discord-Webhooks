import { singleton } from 'tsyringe';
import { Hook } from '../../config/AppConfiguration';
import DiscordWebHookSender from '../../discord/DiscordWebHookSender';
import GitHubPayloadValidator from '../payload/GitHubPayloadValidator';
import WebHookEvent from '../WebHookEvent';
import WebHookEventProcessor from '../WebHookEventProcessor';

@singleton()
export default class PullRequestProcessor extends WebHookEventProcessor {
  constructor(
    private readonly payloadValidator: GitHubPayloadValidator,
    private readonly discordWebHookSender: DiscordWebHookSender
  ) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    if (event.action === 'opened' || event.action === 'closed') {
      this.payloadValidator.assert(this.payloadValidator.validatorPullRequestEvent, event.payload);

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Pull Request by ${event.payload.pull_request.user.login} ${event.action}`,
        description: `${event.payload.pull_request.title}`,
        url: `${event.payload.pull_request.html_url}`,
        color: DiscordWebHookSender.COLOR_INFO,
        fields: event.action === 'opened' ? [
          { name: 'Additions', value: event.payload.pull_request.additions.toString(), inline: true },
          { name: 'Deletions', value: event.payload.pull_request.deletions.toString(), inline: true },
          { name: 'Changed Files', value: event.payload.pull_request.changed_files.toString(), inline: true }
        ] : undefined
      }, event.payload.sender, event.payload.organization);
    }

    return true;
  }
}
