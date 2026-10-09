/** Host-neutral, read-only catalog projection for agent discovery.
 * The operation catalog remains the only owner of operation identity/safety.
 * Discovery never grants execution or a Tiinex Role-holder assignment.
 */
export function projectPortableAgentCapabilities(descriptors = [], request = {}) {
  const query = String(request?.query || '').trim().toLowerCase();
  if (query.length > 120) return Object.freeze({
    schema: 'tiinex.portable.agent-capability-projection.v1', status: 'blocked',
    operations: Object.freeze([]), totalMatching: 0,
    findings: Object.freeze([{ severity: 'error', code: 'agent-capabilities.query-too-long' }])
  });
  const operations = descriptors.filter(item => item && typeof item.name === 'string')
    .map(item => Object.freeze({
      id: item.name, intent: String(item.description || ''),
      safety: String(item.safety || 'unqualified'),
      inputSchemaId: String(item.inputSchema || ''),
      outputSchemaId: String(item.outputSchema || ''),
      hostExecution: 'not-qualified',
      roleAuthorization: 'not-established',
      boundary: 'A schema ID is not a machine-readable host argument schema. Only a separately qualified host adapter may register an executable operation.'
    }))
    .filter(item => !query || `${item.id} ${item.intent}`.toLowerCase().includes(query))
    .sort((a,b) => a.id.localeCompare(b.id));
  return Object.freeze({
    schema: 'tiinex.portable.agent-capability-projection.v1', status: 'ready',
    totalMatching: operations.length,
    operations: Object.freeze(operations.slice(0,50)),
    truncated: operations.length > 50,
    findings: Object.freeze([]),
    boundary: 'Discovery only. No execution, filesystem mutation, host panel delegation, Role conversion, Handoff assignment or source/semantic authority is implied.'
  });
}
