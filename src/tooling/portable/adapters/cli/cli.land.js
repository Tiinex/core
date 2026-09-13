import { prepareNodeSourceFrontier } from '../node/sourceFrontierComparison.js';

export async function land(flags, material, readOptionalJson, splitFlag) {
  const repositoriesValue = await readOptionalJson(flags.repositories || flags.repos);
  const selectionsValue = await readOptionalJson(flags.selections);
  const repositories = repositoriesValue.repositories || (Array.isArray(repositoriesValue) ? repositoriesValue : []);
  return {
    input: {
      ...material,
      repositories: await attachExactTargetSnapshots(repositories, flags),
      selections: selectionsValue.selections || selectionsValue || repositoriesValue.selections || {},
      workspaceIds: splitFlag(flags.workspaces || flags['workspace-ids'])
    },
    options: {}
  };
}

async function attachExactTargetSnapshots(repositories = [], flags = {}) {
  return Promise.all(repositories.map(async (repository, index) => {
    if (repository?.sourceSnapshot || repository?.snapshot || !String(repository?.root || repository?.path || '').trim()) return repository;
    const root = String(repository.root || repository.path || '').trim();
    const workspaceId = String(repository.workspaceId || repository.id || `landing-target-${index + 1}`);
    const frontier = await prepareNodeSourceFrontier({ kind: 'local-workspace', path: root, workspaceId, label: `workspace-landing-target:${workspaceId}` }, { maxFiles: flags['max-files'] });
    const workspace = (frontier.workspaces || [])[0] || null;
    return {
      ...repository,
      sourceSnapshot: workspace?.snapshot || {
        state: 'qualification-error',
        entries: [],
        evidence: {},
        findings: frontier.findings || []
      }
    };
  }));
}
