import { JSONSchemaType } from 'ajv';
import { CommitSchemaType } from './ComponentSchemas';
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

export const SimpleEventSchema: JSONSchemaType<SimpleEvent> = {
  $id: 'SimpleEvent',
  type: 'object',
  properties: {
    action: { type: 'string', nullable: true },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['sender'],
  additionalProperties: true
};

export const PingEventSchema: JSONSchemaType<PingEvent> = {
  $id: 'PingEvent',
  type: 'object',
  properties: {
    sender: { $ref: 'SimpleUser' },
    hook: { $ref: 'WebHook' },
    hook_id: { type: 'number' },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    zen: { type: 'string' }
  },
  required: ['sender', 'hook', 'hook_id', 'zen']
};

export const RepositoryEventSchema: JSONSchemaType<RepositoryEvent> = {
  $id: 'RepositoryEvent',
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['archived', 'unarchived', 'publicized', 'privatized', 'created', 'deleted', 'renamed', 'transferred', 'edited']
    },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['action', 'repository', 'sender']
};

export const RepositoryRenamedEventSchema: JSONSchemaType<RepositoryRenamedEvent> = {
  $id: 'RepositoryRenamedEvent',
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['renamed'] },
    changes: {
      type: 'object',
      properties: {
        repository: {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              properties: {
                from: { type: 'string' }
              },
              required: ['from'],
              additionalProperties: false
            }
          },
          required: ['name'],
          additionalProperties: false
        }
      },
      required: ['repository'],
      additionalProperties: false
    },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['action', 'changes', 'repository', 'sender']
};

export const RepositoryTransferredEventSchema: JSONSchemaType<RepositoryTransferredEvent> = {
  $id: 'RepositoryTransferredEvent',
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['transferred'] },
    changes: {
      type: 'object',
      properties: {
        owner: {
          type: 'object',
          properties: {
            from: {
              type: 'object',
              properties: {
                organization: { $ref: 'OrganizationSimple' },
                user: { $ref: 'SimpleUser' }
              },
              additionalProperties: false
            }
          },
          required: ['from'],
          additionalProperties: false
        }
      },
      required: ['owner'],
      additionalProperties: false
    },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['action', 'changes', 'repository', 'sender']
};

export const ForkEventSchema: JSONSchemaType<ForkEvent> = {
  $id: 'ForkEvent',
  type: 'object',
  properties: {
    forkee: { $ref: 'Repository' },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['forkee', 'repository', 'sender']
};

export const PullRequestEventSchema: JSONSchemaType<PullRequestEvent> = {
  $id: 'PullRequestEvent',
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['opened', 'closed'] },
    number: { type: 'number' },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    pull_request: { $ref: 'PullRequest' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['action', 'number', 'repository', 'pull_request', 'sender']
};

export const PushEventSchema: JSONSchemaType<PushEvent> = {
  $id: 'PushEvent',
  type: 'object',
  properties: {
    ref: { type: 'string' },
    after: { type: 'string' },
    base_ref: { type: 'string', nullable: true },
    before: { type: 'string' },
    commits: { type: 'array', items: CommitSchemaType },
    compare: { type: 'string' },
    created: { type: 'boolean' },
    deleted: { type: 'boolean' },
    forced: { type: 'boolean' },
    organization: { $ref: 'OrganizationSimple' },
    repository: { $ref: 'Repository' },
    sender: { $ref: 'SimpleUser' }
  },
  required: ['ref', 'after', 'before', 'commits', 'compare', 'created', 'deleted', 'forced', 'repository', 'sender']
};
