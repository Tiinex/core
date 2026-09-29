import { fileURLToPath } from 'node:url';

export const PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT = '668753e47a281db060cb74ef957683f4f773b3a4';
export const PORTABLE_CANONICAL_BOOTSTRAP_ROOT = fileURLToPath(new URL('./schema-pack/schemas/', import.meta.url));

export const portableCanonicalBootstrapRuntime = Object.freeze({
  defaultSchemaMaterialPaths: Object.freeze([PORTABLE_CANONICAL_BOOTSTRAP_ROOT]),
  defaultSchemaSource: Object.freeze({
    workspaceId: 'docs',
    repository: 'Tiinex/docs',
    commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
    sourcePathPrefix: '.topics/.schemas'
  }),
  defaultSchemaProviderSource: Object.freeze({
    id: 'tiinex-docs',
    repository: 'Tiinex/docs',
    ref: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
    source: 'portable-schema-pack-runtime-profile'
  }),
  defaultCarrierProfile: Object.freeze({
    id: 'tiinex-foundation',
    requiredMajorWorkspaceIds: Object.freeze(['business', 'docs', 'site']),
    source: 'canonical-bootstrap-runtime-profile'
  })
});
