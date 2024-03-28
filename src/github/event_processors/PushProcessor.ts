import { singleton } from 'tsyringe';
import { Hook } from '../../config/AppConfiguration';
import DiscordWebHookSender from '../../discord/DiscordWebHookSender';
import type { OrganizationSimple } from '../payload/Components';
import type { PushEvent } from '../payload/Events';
import GitHubPayloadValidator from '../payload/GitHubPayloadValidator';
import WebHookEvent from '../WebHookEvent';
import WebHookEventProcessor from '../WebHookEventProcessor';

@singleton()
export default class PushProcessor extends WebHookEventProcessor {
  constructor(
    private readonly payloadValidator: GitHubPayloadValidator,
    private readonly discordWebHookSender: DiscordWebHookSender
  ) {
    super();
  }

  async process(event: WebHookEvent, hook: Hook): Promise<boolean> {
    this.payloadValidator.assert(this.payloadValidator.validatorPushEvent, event.payload);

    if (event.payload.ref.startsWith('refs/tags/')) {
      await this.processTagRef(event.payload, hook);
      return true;
    }
    if (event.payload.ref.startsWith('refs/heads/')) {
      await this.processBranchRef(event.payload, hook);
      return true;
    }

    throw new Error(`Ref not supported: ${event.payload.ref}`);
  }

  private async processTagRef(event: PushEvent, hook: Hook): Promise<void> {
    const action = event.created ? 'created' : 'deleted';
    const tag = event.ref.substring('refs/tags/'.length);

    await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
      title: `[${event.repository.name}] Tag ${action}`,
      description: `Tag **[\`${tag}\`](${event.repository.html_url}/releases/tag/${tag})** ${action}`,
      url: `${event.repository.html_url}/releases/tag/${tag}`,
      color: event.created ? DiscordWebHookSender.COLOR_INFO : DiscordWebHookSender.COLOR_RED
    }, event.sender, event.organization as OrganizationSimple); // FIXME cast should not be necessary
  }

  private async processBranchRef(event: PushEvent, hook: Hook): Promise<void> {
    if (event.commits.length > 0) {
      return this.processPushedCommits(event, hook);
    }

    const branch = event.ref.substring('refs/heads/'.length);
    const action = event.deleted ? 'deleted' : 'created';

    await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
      title: `[${event.repository.name}] Branch ${action}`,
      description: `Branch ${branch} ${action} at [${event.repository.full_name}](${event.repository.html_url})`,
      url: `${event.repository.html_url}/branches`,
      color: event.deleted ? DiscordWebHookSender.COLOR_RED : DiscordWebHookSender.COLOR_GREEN
    }, event.sender, event.organization as OrganizationSimple); // FIXME cast should not be necessary
  }

  private async processPushedCommits(event: PushEvent, hook: Hook): Promise<void> {
    const action = event.forced ? 'force-pushed' : 'pushed';
    const branch = event.ref.substring('refs/heads/'.length);

    const descriptionWithAListOfCommits = event.commits
      .map((commit) => {
        return `**[\`${commit.id.substring(0, 7)}\`](${event.repository.html_url}/commit/${commit.id})** ${this.cutCommitMessageToLength(commit.message, 60)} - ${this.cutCommitMessageToLength(commit.author.username ?? commit.author.name, 20)}`;
      })
      .join('\n');

    await this.discordWebHookSender.sendGeneric(hook.discordWebhookUrl, {
      title: `[${event.repository.name}:${branch}] ${event.commits.length} commit${event.commits.length > 1 ? 's' : ''} ${action}`,
      description: descriptionWithAListOfCommits,
      url: event.compare,
      color: event.forced ? DiscordWebHookSender.COLOR_RED : DiscordWebHookSender.COLOR_INFO
    }, event.sender, event.organization as OrganizationSimple); // FIXME cast should not be necessary
  }

  // TODO: Make this utility MarkDown aware
  // TODO: Extract this utility method and use it on all the user generated content used in the Discord messages
  private cutCommitMessageToLength(str: string, maxLength: number): string {
    const firstLine = str.split('\n')[0].trim();
    if (firstLine.length <= maxLength) {
      return firstLine;
    }

    const ellipsis = '…';
    return firstLine.substring(0, maxLength - ellipsis.length) + ellipsis;
  }
}
