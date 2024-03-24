import { singleton } from 'tsyringe';
import { Hook } from '../../../config/AppConfiguration';
import DiscordWebHookSender from '../../../discord/DiscordWebHookSender';
import WebHookEvent from '../../WebHookEvent';
import WebHookEventProcessor from '../../WebHookEventProcessor';

@singleton()
export default class RepositoryProcessor extends WebHookEventProcessor {
  constructor(private readonly discordWebHookSender: DiscordWebHookSender) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    // TODO: Sub-Registry for actions?
    if (['archived', 'unarchived', 'publicized', 'privatized', 'created', 'deleted'].includes(event.action!)) {
      let color = DiscordWebHookSender.COLOR_INFO;
      if (event.action === 'created') {
        color = DiscordWebHookSender.COLOR_GREEN;
      } else if (event.action === 'deleted') {
        color = DiscordWebHookSender.COLOR_RED;
      }

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository ${event.action}`,
        description: `The repository has been ${event.action}`,
        url: `${event.payload.repository.html_url}`,
        color
      }, event.payload.sender, event.payload.organization);
      return true;
    }

    if (event.action === 'renamed') {
      // TODO: Properly validate body.changes
      const oldName = event.payload.changes?.repository?.name?.from;

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository renamed`,
        description: `The repository has been renamed`,
        url: `${event.payload.repository.html_url}`,
        color: DiscordWebHookSender.COLOR_RENAME,

        fields: [
          { name: 'Old Name', value: oldName, inline: true },
          { name: 'New Name', value: event.payload.repository.name, inline: true }
        ]
      }, event.payload.sender, event.payload.organization);
      return true;
    }

    if (event.action === 'transferred') {
      // TODO: changes.owner.from
      //       changes.owner.from.organization: HookOrganization
      //       changes.owner.from.user: HookSender | null

      await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
        title: `[${event.payload.repository.name}] Repository transferred`,
        description: `A repository has been transferred to [${event.payload.repository.owner.login}](${event.payload.repository.owner.html_url}) (from ${event.payload.changes?.owner?.from?.organization?.login ?? event.payload.changes?.owner?.from?.user?.login})`,
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
