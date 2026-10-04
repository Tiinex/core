const DOCS_COMMIT='3988951208eb9a8926e84ab42625d4b42fa00c2d';
const PATHS=Object.freeze({
  'tiinex.root.v1':'.topics/.schemas/tiinex.root.v1.schema.md',
  'tiinex.workspace.v1':'.topics/.schemas/workspace/tiinex.workspace.v1.schema.md',
  'tiinex.task.v1':'.topics/.schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.handoff.v1':'.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md',
  'tiinex.party.role.v1':'.topics/.schemas/party/role/tiinex.party.role.v1.schema.md',
  'tiinex.evidence.v1':'.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md'
});

export function currentSchemaTarget(schemaId) {
  const path=PATHS[String(schemaId||'')];
  if(!path) throw new Error(`No explicit test-fixture schema permalink for ${schemaId}.`);
  return `https://github.com/Tiinex/docs/blob/${DOCS_COMMIT}/${path}`;
}
