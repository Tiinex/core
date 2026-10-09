import { createHash } from 'node:crypto';
import { parseRoleMaterial } from './handoff/coldStartQualification.materials.js';

const BEGIN = '<!-- tiinex:agent-role:begin';
const END = '<!-- tiinex:agent-role:end -->';
const HASH = /^[0-9a-f]{64}$/;
const hash = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const blocked = (code) => Object.freeze({ schema:'tiinex.portable.agent-role-sync-plan.v1', status:'blocked', code, action:'blocked' });

/** Qualify a selected Role and project only its conventional opt-in agent path. */
export function qualifyPortableRoleAgentTarget(roleMarkdown = '', rolePath = '') {
  const role=parseRoleMaterial({path:rolePath,markdown:roleMarkdown,explicit:true});
  if (!role || role.canonicalQualification?.state!=='qualified' || !role.label) return null;
  const slug=role.label.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return slug ? `.github/agents/tiinex-${slug}.agent.md` : null;
}

/** A qualified Role is *described* to the host; never converted into privileges.
 * This portable plan is the single authority for generated agent content. */
export function projectPortableAgentRoleSync({ roleMarkdown='', rolePath='', currentMarkdown=null, targetPath='' } = {}) {
  if (typeof roleMarkdown !== 'string' || !roleMarkdown) return blocked('agent-sync.role-required');
  if (typeof targetPath !== 'string' || !/^\.github\/agents\/[a-z0-9][a-z0-9-]*\.agent\.md$/.test(targetPath)) return blocked('agent-sync.target-invalid');
  const role = parseRoleMaterial({ path:String(rolePath || ''), markdown:roleMarkdown, explicit:true });
  if (!role || role.canonicalQualification?.state !== 'qualified' || !role.label || !HASH.test(role.sha256)) return blocked('agent-sync.role-unqualified');
  const slug = role.label.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if (!slug || targetPath !== `.github/agents/tiinex-${slug}.agent.md`) return blocked('agent-sync.target-role-mismatch');
  const existing = currentMarkdown === null ? null : String(currentMarkdown);
  if (existing !== null) {
    const header = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(existing);
    if (!header) return blocked('agent-sync.frontmatter-invalid');
    const names=[...header[1].matchAll(/^name\s*:\s*(.+)$/gm)];
    const invocation=[...header[1].matchAll(/^user-invocable\s*:\s*(.+)$/gm)];
    if (names.length !== 1 || invocation.length !== 1 || invocation[0][1].trim() !== 'false') return blocked('agent-sync.frontmatter-role-invocation-conflict');
  }
  const meta = `---\nname: tiinex-${slug}\ndescription: "Tiinex Role presentation for ${role.label.replace(/["\\\r\n]/g,'')} (not a holder assignment)"\nuser-invocable: false\n---\n\n`;
  const generated = [
    `# Tiinex Role — ${role.label}`,
    '',
    '> Qualified Role presentation only. This agent file does NOT assign a Tiinex holder, grant tools or establish a Handoff.',
    '',
    `**Role kind:** ${role.roleKind || 'unspecified'}`,
    '',
    '## In scope',
    role.boundary.inScope || '(no qualified in-scope text)',
    '',
    '## Out of scope',
    role.boundary.outOfScope || '(no qualified out-of-scope text)',
    '',
    '## Authority limits',
    role.authorityBoundary.doesNotAuthorize || role.interpretationLimits.mustNotBeTreatedAs || '(no additional authority stated)',
    '',
    'For executable actions, independently qualify the selected operation, current Workspace, required approvals and active Role assignment.',
    ''
  ].join('\n');
  const marker = `${BEGIN} source-sha256=${role.sha256} body-sha256=${hash(generated)} -->`;
  const region = `${marker}\n${generated}${END}\n`;
  let output;
  if (existing === null) output = meta + region;
  else {
    const matches = [...existing.matchAll(/<!-- tiinex:agent-role:begin source-sha256=([0-9a-f]{64}) body-sha256=([0-9a-f]{64}) -->\r?\n/g)];
    if (matches.length !== 1) return blocked('agent-sync.owned-region-missing-or-ambiguous');
    const start = matches[0].index;
    const bodyStart = start + matches[0][0].length;
    const end = existing.indexOf(END,bodyStart);
    if (end < 0 || existing.indexOf(END,end+END.length) !== -1 || existing.indexOf(BEGIN,bodyStart) !== -1) return blocked('agent-sync.owned-region-invalid');
    if (hash(existing.slice(bodyStart,end)) !== matches[0][2]) return blocked('agent-sync.generated-region-edited');
    const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(existing);
    if (!fm || start < fm[0].length) return blocked('agent-sync.frontmatter-invalid');
    // Preserve the entire human-owned frontmatter and surrounding prose byte-for-byte.
    // Unqualified grants are blocked rather than copied into an apparently authorized Role.
    if (/^\s*(?:tools|agents|hooks|handoffs|model|target|mcp-servers|permissions)\s*:/mi.test(fm[1])) return blocked('agent-sync.frontmatter-capability-unqualified');
    // 'name' must not drift away from the role's intended agent identity.
    if (!new RegExp(`^name:\\s*["']?tiinex-${slug}["']?\\s*$`,'m').test(fm[1])) return blocked('agent-sync.frontmatter-name-conflict');
    // The suffix belongs to the user, including its exact CRLF/LF boundary.
    // Never replace a human-owned CRLF with a generated LF during refresh.
    const userSuffix = existing.slice(end + END.length);
    const ownedRegion = /^\r?\n/.test(userSuffix) ? region.slice(0, -1) : region;
    output = existing.slice(0, start) + ownedRegion + userSuffix;
  }
  const action = existing === null ? 'create' : output === existing ? 'noop' : 'replace';
  return Object.freeze({schema:'tiinex.portable.agent-role-sync-plan.v1',status:'ready',action,roleLabel:role.label,
    roleSha256:role.sha256, targetPath, beforeSha256:existing === null ? '' : hash(existing),
    afterSha256:hash(output), outputMarkdown:output,
    boundary:'Generated region only; frontmatter and unmanaged body are human-owned. No role holder, tool execution, remote write or permission granted.'});
}
