import Fastify, { type FastifyError, FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { singleton } from 'tsyringe';
import { logAndCaptureError, setupSentryFastifyIntegration } from '../SentrySdk';

@singleton()
export default class FastifyWebServer {
  private readonly fastify: FastifyInstance;

  constructor() {
    this.fastify = Fastify({
      ignoreDuplicateSlashes: true,
      bodyLimit: 50 * 1024 * 1024, // 50 MiB (twice the size of GitHub's documented max payload size)

      trustProxy: false // TODO
    });

    this.fastify.setErrorHandler((err: FastifyError, _req: FastifyRequest, reply: FastifyReply): void => {
      logAndCaptureError(err);

      reply
        .code(500)
        .send('Internal Server Error');
    });
    setupSentryFastifyIntegration(this.fastify);

  }

  async listen(host: string, port: number): Promise<void> {
    await this.fastify.listen({ host, port });
  }

  async shutdown(): Promise<void> {
    await this.fastify.close();
  }
}
