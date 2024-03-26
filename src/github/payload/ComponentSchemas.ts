import type { JSONSchemaType } from 'ajv';
import type { Commit, Committer, OrganizationSimple, PullRequest, Repository, SimpleUser, WebHook } from './Components';

const SimpleUser: JSONSchemaType<SimpleUser> = {
  $id: 'SimpleUser',
  type: 'object',
  properties: {
    name: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    login: { type: 'string' },
    id: { type: 'number' },
    node_id: { type: 'string' },
    avatar_url: { type: 'string' },
    gravatar_id: { type: 'string', nullable: true },
    html_url: { type: 'string' },
    type: { type: 'string' },
    site_admin: { type: 'boolean' }
  },
  required: ['login', 'id', 'node_id', 'avatar_url', 'html_url', 'type', 'site_admin']
};

const OrganizationSimple: JSONSchemaType<OrganizationSimple> = {
  $id: 'OrganizationSimple',
  type: 'object',
  properties: {
    login: { type: 'string' },
    id: { type: 'number' },
    node_id: { type: 'string' },
    avatar_url: { type: 'string' },
    description: { type: 'string', nullable: true }
  },
  required: ['login', 'id', 'node_id', 'avatar_url']
};

const Repository: JSONSchemaType<Repository> = {
  $id: 'Repository',
  type: 'object',
  properties: {
    id: { type: 'number' },
    node_id: { type: 'string' },
    name: { type: 'string' },
    full_name: { type: 'string' },
    organization: { type: 'string', nullable: true },
    forks: { type: 'number' },
    owner: { $ref: 'SimpleUser' },
    private: { type: 'boolean' },
    html_url: { type: 'string' },
    description: { type: 'string', nullable: true },
    fork: { type: 'boolean' },
    homepage: { type: 'string', nullable: true },
    language: { type: 'string', nullable: true },
    forks_count: { type: 'number' },
    stargazers_count: { type: 'number' },
    watchers_count: { type: 'number' },
    size: { type: 'number' },
    default_branch: { type: 'string' },
    open_issues_count: { type: 'number' },
    is_template: { type: 'boolean', nullable: true },
    topics: { type: 'array', items: { type: 'string' }, nullable: true },
    has_issues: { type: 'boolean' },
    has_projects: { type: 'boolean' },
    has_wiki: { type: 'boolean' },
    has_pages: { type: 'boolean' },
    has_downloads: { type: 'boolean' },
    has_discussions: { type: 'boolean', nullable: true },
    archived: { type: 'boolean' },
    disabled: { type: 'boolean' },
    visibility: { type: 'string', enum: ['public', 'private', 'internal'] },
    pushed_at: { oneOf: [{ type: 'number' }, { type: 'string' }] },
    created_at: { oneOf: [{ type: 'number' }, { type: 'string' }] },
    updated_at: { type: 'string' },
    open_issues: { type: 'number' },
    watchers: { type: 'number' },
    master_branch: { type: 'string', nullable: true }
  },
  required: [
    'id',
    'node_id',
    'name',
    'full_name',
    'owner',
    'private',
    'html_url',
    'fork',
    'forks_count',
    'stargazers_count',
    'watchers_count',
    'size',
    'default_branch',
    'open_issues_count',
    'has_issues',
    'has_projects'
  ]
};

const Commit: JSONSchemaType<Commit> = {
  $id: 'Commit',
  type: 'object',
  properties: {
    added: { type: 'array', items: { type: 'string' } },
    distinct: { type: 'boolean' },
    id: { type: 'string' },
    author: { $ref: 'Committer' },
    committer: { $ref: 'Committer' },
    message: { type: 'string' },
    modified: { type: 'array', items: { type: 'string' } },
    removed: { type: 'array', items: { type: 'string' } },
    timestamp: { type: 'string' },
    tree_id: { type: 'string' }
  },
  required: ['added', 'distinct', 'id', 'author', 'committer', 'message', 'modified', 'removed', 'timestamp', 'tree_id']
};

const Committer: JSONSchemaType<Committer> = {
  $id: 'Committer',
  type: 'object',
  properties: {
    date: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    name: { type: 'string' },
    username: { type: 'string', nullable: true }
  },
  required: ['name']
};

const PullRequest: JSONSchemaType<PullRequest> = {
  $id: 'PullRequest',
  type: 'object',
  properties: {
    id: { type: 'number' },
    node_id: { type: 'string' },
    html_url: { type: 'string' },
    diff_url: { type: 'string' },
    patch_url: { type: 'string' },
    issue_url: { type: 'string' },
    commits_url: { type: 'string' },
    number: { type: 'number' },
    state: { type: 'string', enum: ['open', 'closed'] },
    locked: { type: 'boolean' },
    title: { type: 'string' },
    user: { $ref: 'SimpleUser' },
    body: { type: 'string', nullable: true },
    author_association: {
      type: 'string',
      enum: ['COLLABORATOR', 'CONTRIBUTOR', 'FIRST_TIMER', 'FIRST_TIME_CONTRIBUTOR', 'MANNEQUIN', 'MEMBER', 'NONE', 'OWNER']
    },
    draft: { type: 'boolean', nullable: true },
    merged: { type: 'boolean', nullable: true },
    comments: { type: 'number' },
    review_comments: { type: 'number' },
    additions: { type: 'number' },
    deletions: { type: 'number' },
    changed_files: { type: 'number' }
  },
  required: [
    'id',
    'node_id',
    'html_url',
    'diff_url',
    'patch_url',
    'issue_url',
    'commits_url',
    'number',
    'state',
    'locked',
    'title',
    'user',
    'author_association',
    'comments',
    'review_comments',
    'additions',
    'deletions',
    'changed_files'
  ],
  additionalProperties: true
};

const WebHook: JSONSchemaType<WebHook> = {
  $id: 'WebHook',
  type: 'object',
  properties: {
    id: { type: 'number' },
    active: { type: 'boolean' },
    created_at: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
    updated_at: { type: 'string' },
    deliveries_url: { type: 'string', nullable: true },
    url: { type: 'string', nullable: true },
    ping_url: { type: 'string', nullable: true },
    test_url: { type: 'string', nullable: true }
  },
  required: ['id', 'active', 'created_at', 'name', 'type', 'updated_at']
};

export const COMPONENT_SCHEMAS = [
  SimpleUser,
  OrganizationSimple,
  Repository,
  Commit,
  Committer,
  PullRequest,
  WebHook
];

export { Commit as CommitSchemaType };
