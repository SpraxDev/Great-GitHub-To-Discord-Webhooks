import { singleton } from 'tsyringe';
import { Hook } from '../../config/AppConfiguration';
import DiscordWebHookSender from '../../discord/DiscordWebHookSender';
import { logAndCaptureError } from '../../SentrySdk';
import GitHubPayloadValidator from '../payload/GitHubPayloadValidator';
import WebHookEvent from '../WebHookEvent';
import WebHookEventProcessor from '../WebHookEventProcessor';

@singleton()
export default class RepositoryProcessor extends WebHookEventProcessor {
  constructor(
    private readonly payloadValidator: GitHubPayloadValidator,
    private readonly discordWebHookSender: DiscordWebHookSender
  ) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    if (event.action == null) {
      throw new Error('Action is required');
    }

    if (['archived', 'unarchived', 'publicized', 'privatized', 'created', 'deleted'].includes(event.action)) {
      this.payloadValidator.assert(this.payloadValidator.validatorRepositoryEvent, event.payload);

      let color = DiscordWebHookSender.COLOR_INFO;
      if (event.payload.action === 'created') {
        color = DiscordWebHookSender.COLOR_GREEN;
      } else if (event.payload.action === 'deleted') {
        color = DiscordWebHookSender.COLOR_RED;
      }

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository ${event.payload.action}`,
        description: `The repository has been ${event.payload.action}`,
        url: `${event.payload.repository.html_url}`,
        color
      }, event.payload.sender, event.payload.organization);
      return true;
    }

    if (event.action === 'renamed') {
      this.payloadValidator.assert(this.payloadValidator.validatorRepositoryRenamedEvent, event.payload);

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository renamed`,
        description: `The repository has been renamed`,
        url: `${event.payload.repository.html_url}`,
        color: DiscordWebHookSender.COLOR_RENAME,

        fields: [
          { name: 'Old Name', value: event.payload.changes.repository.name.from, inline: true },
          { name: 'New Name', value: event.payload.repository.name, inline: true }
        ]
      }, event.payload.sender, event.payload.organization);
      return true;
    }

    if (event.action === 'transferred') {
      this.payloadValidator.assert(this.payloadValidator.validatorRepositoryTransferredEvent, event.payload);

      const previousOwner = event.payload.changes.owner.from.organization?.login ?? event.payload.changes.owner.from.user?.login;
      if (previousOwner == null) {
        logAndCaptureError(new Error('Previous owner is required for transferred event'));
      }

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository transferred`,
        description: `A repository has been transferred to [${event.payload.repository.owner.login}](${event.payload.repository.owner.html_url}) (from ${previousOwner})`,
        url: `${event.payload.repository.html_url}`,
        color: DiscordWebHookSender.COLOR_INFO
      }, event.payload.sender, event.payload.organization);
      return true;
    }

    if (event.action === 'edited') {
      // TODO: changes.default_branch.from: string
      //       changes.description.from: string | null
      //       changes.homepage.from: string | null
      //       changes.topics.from: string[] | null
    }

    return false;
  }
}
