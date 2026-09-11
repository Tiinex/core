import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';
const roots = [
'/mnt/data/anchor-major002-merged/app',
'/mnt/data/anchor-major002-merged/cli',
'/mnt/data/anchor-major002-merged/core',
'/mnt/data/anchor-major002-merged/docs',
'/mnt/data/anchor-major002-merged/extension-chrome',
'/mnt/data/anchor-major002-merged/extension-vscode',
'/mnt/data/anchor-major002-merged/interop-native',
'/mnt/data/anchor-major002-merged/interop-openai',
'/mnt/data/anchor-major002-merged/provider-github',
'/mnt/data/anchor-major002-merged/provider-native',
'/mnt/data/anchor-major002-merged/runtime-native',
'/mnt/data/anchor-major002-merged/site',
'/mnt/data/anchor-major002-merged/verse-atlas',
'/mnt/data/anchor-major002-merged/verse-native',
'/mnt/data/anchor-major002-merged/verse-playthings'
];
const args = [
'manufacture-handoff-package',
'/mnt/data/anchor-major002-merged/business',
'--handoff','.topics/initiatives/refactor/orchestration/handoffs/010-1-1-anchor-full-recovery-qualified-returns-integrated-and-prism-line.trace.md',
'--workspace-id','business',
'--workspace-target','.topics/.workspaces/tiinex-business.workspace.md',
'--workspace-targets','/mnt/data/anchor-major002-merged/workspace-targets.json',
'--additional-workspaces', roots.map((p)=>`${p.split('/').pop()}=${p}`).join(','),
'--package-parent','/mnt/data/anchor-recovery-output/business-002-2-3-5-2-3-1-5-5-anchor-to-anchor.handoff-package.zip',
'--package-sibling-index','2',
'--output-dir','/mnt/data/anchor-recovery-output'
];
const runtime = {
  commandPrefix: 'tiinex-portable',
  defaultSchemaMaterialPaths: ['/mnt/data/anchor-major002-merged/docs/.topics/.schemas'],
  defaultSchemaSource: { workspaceId:'docs', repository:'Tiinex/docs', commit:'3988951208eb9a8926e84ab42625d4b42fa00c2d', sourcePathPrefix:'.topics/.schemas' },
  defaultCarrierProfile: { id:'tiinex-foundation', requiredMajorWorkspaceIds:['business','docs','site'], source:'anchor-local-merged' }
};
const code = await runPortableCli(args, console, runtime);
process.exitCode = code;
