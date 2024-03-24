import { singleton } from 'tsyringe';
import { HookOrganization, HookSender } from '../webserver/GitHubHookReceiverRouter';
import DiscordWebHookClient, { DiscordEmbed, DiscordHookBody } from './DiscordWebHookClient';

export type GenericHookData = Pick<DiscordEmbed, 'title' | 'description' | 'url' | 'color' | 'fields'>;

// TODO: We should disable hooks if the Discord WebHook got deleted etc.
@singleton()
export default class DiscordWebHookSender {
  public static readonly COLOR_PING = 0x76f700;
  public static readonly COLOR_INFO = 0x7289da;
  public static readonly COLOR_RENAME = 0xf7b818;
  public static readonly COLOR_RED = 0xff0000;
  public static readonly COLOR_GREEN = 0x00ff00;

  private static readonly HOOK_USERNAME = 'GitHub Activity';
  private static readonly HOOK_AVATAR_URL = 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png';
  private static readonly DEFAULT_BODY: DiscordHookBody = {
    username: DiscordWebHookSender.HOOK_USERNAME,
    avatar_url: DiscordWebHookSender.HOOK_AVATAR_URL,
    allowed_mentions: { parse: [] }
  };

  private webHookClient: DiscordWebHookClient;

  constructor(webHookClient: DiscordWebHookClient) {
    this.webHookClient = webHookClient;
  }

  async sendGeneric(hookUrl: string, data: GenericHookData, sender?: HookSender, organization?: HookOrganization): Promise<void> {
    await this.webHookClient.send(hookUrl, {
      ...DiscordWebHookSender.DEFAULT_BODY,
      embeds: [
        {
          ...this.generateDefaultEmbed(sender, organization),
          title: data.title,
          description: data.description,
          color: data.color,
          url: data.url,
          fields: data.fields
        }
      ]
    });
  }

  async sendOnPing(hookUrl: string, organization: HookOrganization): Promise<void> {
    await this.webHookClient.send(hookUrl, {
      ...DiscordWebHookSender.DEFAULT_BODY,
      embeds: [
        {
          ...this.generateDefaultEmbed(undefined, organization),
          title: 'Received Ping from GitHub',
          description: 'Looks like the webhook is working! :tada:',
          color: DiscordWebHookSender.COLOR_PING,
          author: {
            name: 'GitHub',
            icon_url: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png'
          }
        }
      ]
    });
  }

  private generateDefaultEmbed(sender?: HookSender, organization?: HookOrganization): Partial<DiscordEmbed> {
    const result: Partial<DiscordEmbed> = {};
    if (sender != null) {
      result.author = {
        name: sender.login,
        icon_url: sender.avatar_url || undefined
      };
    }
    if (organization != null) {
      result.footer = {
        text: organization.login,
        icon_url: organization.avatar_url || undefined
      };
    }
    return result;
  }
}
