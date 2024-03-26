import * as Sentry from '@sentry/node';
import Crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'tsyringe';
import AppConfiguration, { Hook, HookToken } from '../config/AppConfiguration';
import GitHubPayloadValidator from '../github/payload/GitHubPayloadValidator';
import WebHookEvent from '../github/WebHookEvent';
import WebHookEventProcessorRegistry from '../github/WebHookEventProcessorRegistry';

@injectable()
export default class GitHubHookReceiverRouter {
  constructor(
    private readonly appConfig: AppConfiguration,
    private readonly payloadValidator: GitHubPayloadValidator,
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
    const delivery = this.extractHeader(request, 'X-GitHub-Delivery');
    const providedPayloadSignature = this.extractHeader(request, 'X-Hub-Signature-256');

    if (event == null || delivery == null || providedPayloadSignature == null) {
      reply
        .code(400)
        .send('Bad Request (missing headers)');
      return;
    }

    if (!this.validateSignature(request.body, providedPayloadSignature, hook.secret)) {
      throw new Error('Webhook signature validation failed');
    }

    this.payloadValidator.assert(this.payloadValidator.validatorSimpleEvent, request.body);
    const handledEvent = await this.eventProcessorRegistry.dispatch(new WebHookEvent(event, request.body), hook);
    if (!handledEvent) {
      console.warn(`Received unknown event: {event=${event}, action=${request.body.action}, delivery=${delivery}}`);
      Sentry.captureMessage(`Received unknown Hook: {event=${event}, action=${request.body.action}}`, {
        level: 'warning',
        tags: {
          hookId: this.extractHeader(request, 'X-GitHub-Hook-ID'),
          delivery,
          event,
          action: request.body.action
        },
        extra: {
          headers: request.headers,
          body: JSON.stringify(request.body)
        }
      });
    } else {
      console.log(`Received known event: {event=${event}, action=${request.body.action}, delivery=${delivery}}`);
    }

    reply
      .code(204)
      .send();
  }

  private validateSignature(body: unknown, providedPayloadSignature: string, secret: string): boolean {
    const calculatedSignature = Crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    return Crypto.timingSafeEqual(
      Buffer.from(providedPayloadSignature, 'ascii'),
      Buffer.from(`sha256=${calculatedSignature}`, 'ascii')
    );
  }

  private extractHeader(request: FastifyRequest, header: string): string | null {
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
