import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
const result = await runCommonAuthorCli({ flags: {
  workspace: '/mnt/data/anchor-major002-merged/business',
  schema: 'tiinex.handoff.v1',
  directory: '.topics/initiatives/refactor/orchestration/handoffs',
  parent: '.topics/initiatives/refactor/orchestration/handoffs/010-1-anchor-full-recovery-role-lineage-and-chrome-experiment-correcti.trace.md',
  body: '/mnt/data/anchor-major002-merged/recovery-returns-body.md',
  title: 'Anchor Full Recovery — Qualified Returns Integrated And Prism Lineage Corrected',
  summary: 'Preserve the current full recovery after integrating qualified Docs/Core/Site/VS Code returns and the direct Prism Role continuation.',
  authors: 'Anchor',
  why: 'Refresh durable recovery after accepted specialist returns and Role-lineage correction before further parallel work.',
  status: 'ready/local'
}}, {
  defaultSchemaMaterialPaths: ['/mnt/data/anchor-major002-merged/docs/.topics/.schemas'],
  defaultSchemaSource: { workspaceId: 'docs', repository: 'Tiinex/docs', commit: '3988951208eb9a8926e84ab42625d4b42fa00c2d', sourcePathPrefix: '.topics/.schemas' }
});
console.log(JSON.stringify(result, null, 2));
