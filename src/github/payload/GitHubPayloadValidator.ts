import Ajv, { ValidateFunction } from 'ajv';
import { singleton } from 'tsyringe';
import { COMPONENT_SCHEMAS } from './ComponentSchemas';
import type {
  ForkEvent,
  PingEvent,
  PullRequestEvent,
  PushEvent,
  RepositoryEvent,
  RepositoryRenamedEvent,
  RepositoryTransferredEvent,
  SimpleEvent
} from './Events';
import {
  ForkEventSchema,
  PingEventSchema,
  PullRequestEventSchema,
  PushEventSchema,
  RepositoryEventSchema,
  RepositoryRenamedEventSchema,
  RepositoryTransferredEventSchema,
  SimpleEventSchema
} from './EventSchemas';

@singleton()
export default class GitHubPayloadValidator {
  private readonly ajv: Ajv;

  public readonly validatorSimpleEvent: ValidateFunction<SimpleEvent>;

  public readonly validatorPingEvent: ValidateFunction<PingEvent>;

  public readonly validatorRepositoryEvent: ValidateFunction<RepositoryEvent>;
  public readonly validatorRepositoryRenamedEvent: ValidateFunction<RepositoryRenamedEvent>;
  public readonly validatorRepositoryTransferredEvent: ValidateFunction<RepositoryTransferredEvent>;

  public readonly validatorForkEvent: ValidateFunction<ForkEvent>;
  public readonly validatorPullRequestEvent: ValidateFunction<PullRequestEvent>;
  public readonly validatorPushEvent: ValidateFunction<PushEvent>;

  constructor() {
    this.ajv = new Ajv({
      strict: true,
      schemas: COMPONENT_SCHEMAS
    });

    this.validatorSimpleEvent = this.ajv.compile(SimpleEventSchema);

    this.validatorPingEvent = this.ajv.compile(PingEventSchema);

    this.validatorRepositoryEvent = this.ajv.compile(RepositoryEventSchema);
    this.validatorRepositoryRenamedEvent = this.ajv.compile(RepositoryRenamedEventSchema);
    this.validatorRepositoryTransferredEvent = this.ajv.compile(RepositoryTransferredEventSchema);

    this.validatorForkEvent = this.ajv.compile(ForkEventSchema);
    this.validatorPullRequestEvent = this.ajv.compile(PullRequestEventSchema);
    this.validatorPushEvent = this.ajv.compile(PushEventSchema);
  }

  public assert<T>(validator: ValidateFunction<T>, data: any): asserts data is T {
    if (!validator(data)) {
      throw new Error(`Validation for schema '${(validator.schema as any)['$id']}' failed: ${JSON.stringify(validator.errors)}`);
    }
  }
}
