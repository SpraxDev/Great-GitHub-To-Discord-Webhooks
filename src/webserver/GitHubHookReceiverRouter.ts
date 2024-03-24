import * as Sentry from '@sentry/node';
import Ajv, { JSONSchemaType } from 'ajv';
import Crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'tsyringe';
import AppConfiguration, { Hook, HookToken } from '../config/AppConfiguration';
import WebHookEvent from '../github/WebHookEvent';
import WebHookEventProcessorRegistry from '../github/WebHookEventProcessorRegistry';

// TODO: Types auslagern
export type HookSender = {
  readonly login: string;
  readonly id: number;
  readonly avatar_url: string;
  readonly html_url: string;
  readonly type: 'Bot' | 'User' | 'Organization';
}
export type HookOrganization = {
  readonly login: string;
  readonly id: number;
  readonly avatar_url: string;
};
export type HookRepository = {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly private: boolean;
  readonly html_url: string;
  readonly owner: HookSender;
  readonly fork: boolean;
  readonly default_branch: string;
}
export type HookBody = {
  readonly action?: string;
  readonly sender: HookSender;
  readonly repository: HookRepository;
  readonly organization: HookOrganization;

  readonly changes?: { [key: string]: any };
}

// TODO: schemas auslagern und mit Docs gegenchecken
const schemaGitHubHookSender: JSONSchemaType<HookSender> = {
  type: 'object',
  properties: {
    login: { type: 'string' },
    id: { type: 'number' },
    avatar_url: { type: 'string' },
    html_url: { type: 'string' },
    type: { type: 'string', enum: ['Bot', 'User', 'Organization'] }
  },
  required: ['login', 'id', 'avatar_url', 'html_url', 'type']
};
const schemaGitHubHookOrganization: JSONSchemaType<HookOrganization> = {
  type: 'object',
  properties: {
    login: { type: 'string' },
    id: { type: 'number' },
    avatar_url: { type: 'string' }
  },
  required: ['login', 'id', 'avatar_url']
};
const schemaGitHubHookRepository: JSONSchemaType<HookRepository> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    full_name: { type: 'string' },
    private: { type: 'boolean' },
    html_url: { type: 'string' },
    owner: schemaGitHubHookSender,
    fork: { type: 'boolean' },
    default_branch: { type: 'string' }
  },
  required: ['id', 'name', 'full_name', 'private', 'html_url', 'owner', 'fork', 'default_branch']
};
const schemaGitHubHookBody: JSONSchemaType<HookBody> = {
  type: 'object',
  properties: {
    action: { type: 'string', nullable: true },
    sender: schemaGitHubHookSender,
    organization: schemaGitHubHookOrganization,
    repository: schemaGitHubHookRepository,

    changes: { type: 'object', nullable: true }
  },
  required: ['sender', 'organization']
};

@injectable()
export default class GitHubHookReceiverRouter {
  private readonly ajv = new Ajv();
  private readonly validateHookBody = this.ajv.compile(schemaGitHubHookBody);

  constructor(
    private readonly appConfig: AppConfiguration,
    private readonly eventProcessorRegistry: WebHookEventProcessorRegistry
  ) {
  }

  register(fastify: FastifyInstance): void {
    fastify.all<{ Params: { hookToken: HookToken } }>('/github/:hookToken', async (request, reply): Promise<void> => {
      const hookToken = request.params.hookToken;

      const hook = this.appConfig.get().hooks[hookToken];
      if (hook == null) {
        reply
          .code(404)
          .send('Not Found');
        return;
      }

      if (request.method === 'POST') {
        await this.handlePostRequest(hook, request, reply);
        return;
      }

      if (request.method === 'HEAD') {
        reply
          .header('Allow', 'HEAD, POST')
          .code(200)
          .send();
        return;
      }
      reply
        .header('Allow', 'HEAD, POST')
        .code(405)
        .send('Method Not Allowed');
    });
  }

  private async handlePostRequest(hook: Hook, request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const event = this.extractHeader(request, 'X-GitHub-Event');
    const delivery = this.extractHeader(request, 'X-GitHub-Delivery'); // TODO: Ignore duplicate deliveries or the header entirely

    if (!this.validateSignature(request, hook.secret)) {
      throw new Error('Webhook signature validation failed');
    }

    if (!this.validateHookBody(request.body)) {
      throw new Error('Invalid request body:' + JSON.stringify(this.validateHookBody.errors));
    }

    const action = request.body.action;

    let handledEvent = await this.eventProcessorRegistry.dispatch(new WebHookEvent(event, action, request.body), hook);
    if (!handledEvent) {
      console.error(`Received unknown event: {event=${event}, action=${action}, delivery=${delivery}}`);

      Sentry.captureMessage(`Received unknown Hook: {event=${event}, action=${action}}`, {
        level: 'warning',
        tags: {
          hookId: this.extractOptionalHeader(request, 'X-GitHub-Hook-ID'),
          delivery,
          event,
          action
        },
        extra: {
          headers: request.headers,
          body: JSON.stringify(request.body)
        }
      });
    } else {
      console.log(`Received known event: {event=${event}, action=${action}, delivery=${delivery}}`);
    }

    reply
      .code(204)
      .send();
  }

  private validateSignature(request: FastifyRequest, secret: string): boolean {
    const calculatedSignature = Crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(request.body))
      .digest('hex');

    return Crypto.timingSafeEqual(
      Buffer.from(this.extractHeader(request, 'X-Hub-Signature-256'), 'ascii'),
      Buffer.from(`sha256=${calculatedSignature}`, 'ascii')
    );
  }

  private extractHeader(request: FastifyRequest, header: string): string {
    const value = this.extractOptionalHeader(request, header);
    if (value == null) {
      throw new Error(`Missing required header '${header}'`);
    }
    return value;
  }

  private extractOptionalHeader(request: FastifyRequest, header: string): string | null {
    const value = request.headers[header.toLowerCase()] ?? null;
    if (value == null) {
      return null;
    }
    if (typeof value !== 'string') {
      throw new Error(`Expected header '${header}' to be a string, but got ${typeof value}`);
    }
    return value;
  }
}
