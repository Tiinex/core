import path from 'node:path';
import { stableFingerprintBytes, utf8Bytes } from '../../../export/package.bytes.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';

// Deliberately narrow: only local Markdown inline link destinations can be
// rebound. HTML, code, raw filename mentions, URI schemes and uncertain link
// syntax fail closed rather than being silently left behind.
export function projectAssetReferenceRebind({ markdown, sourcePath, assetPaths }) {
  const text = String(markdown || '');
  const replacements = new Map();
  const findings = [];
  const refs = [];
  const pattern = /!?\[[^\]\r\n]*\]\((<[^>\r\n]*>|(?:\\.|[^)\r\n])*)\)/g;
  for (const match of text.matchAll(pattern)) {
    const link = match[1];
    const wrapped = link.startsWith('<') && link.endsWith('>');
    const body = wrapped ? link.slice(1,-1) : link;
    const [locator,suffix=''] = splitSuffix(body);
    if (!locator || /^(?:[a-z][a-z0-9+.-]*:|\/|\/\/)/i.test(locator)) continue;
    let decoded;
    try { decoded = decodeURIComponent(locator); }
    catch { findings.push(`reference-decode:${sourcePath}`); continue; }
    if (decoded.includes('\\') || decoded.includes('\0')) { findings.push(`reference-unsafe:${sourcePath}`); continue; }
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath),decoded));
    const destination = assetPaths.get(resolved);
    if (!destination) continue;
    const relative = path.posix.relative(path.posix.dirname(sourcePath), destination) || path.posix.basename(destination);
    // Keep escaped URL representation and any explicit fragment/query.
    const replacement = encodeURI(relative).replace(/#/g,'%23').replace(/\?/g,'%3F') + suffix;
    replacements.set(match.index, { from: match[0], to: match[0].replace(link, wrapped ? `<${replacement}>` : replacement), resolved });
    refs.push(Object.freeze({ assetPath:resolved, sourcePath, before:body, after:replacement }));
  }
  let rebuilt = '', cursor = 0;
  for (const [index, replacement] of [...replacements].sort(([a],[b]) => a-b)) {
    rebuilt += text.slice(cursor,index)+replacement.to;cursor=index+replacement.from.length;
  }
  rebuilt += text.slice(cursor);
  const scrubbed = [...replacements].sort(([a],[b])=>b-a).reduce((s,[index,v])=>s.slice(0,index)+(' '.repeat(v.from.length))+s.slice(index+v.from.length),text);
  // Ambiguous unparsed references must be accounted for by the operator.
  for (const oldPath of assetPaths.keys()) {
    const basename = path.posix.basename(oldPath);
    if (scrubbed.includes(oldPath) || scrubbed.includes(basename) || scrubbed.includes(encodeURI(basename))) {
      findings.push(`reference-unqualified:${sourcePath}:${oldPath}`);
    }
  }
  if (refs.length && sourcePath.endsWith('.trace.md')) {
    if (canonicalC14nV2SelfState(text).state !== 'verified') findings.push(`reference-self-unqualified:${sourcePath}`);
    else if (!findings.length) {
      const sealed = sealC14nV2Self(rebuilt);
      if (sealed.state !== 'sealed' || canonicalC14nV2SelfState(sealed.markdown).state !== 'verified') findings.push(`reference-seal-unqualified:${sourcePath}`);
      else rebuilt = sealed.markdown;
    }
  }
  return Object.freeze({status:findings.length?'blocked':'ready', sourcePath, markdown:rebuilt, refs:Object.freeze(refs), findings:Object.freeze(findings), beforeFingerprint:stableFingerprintBytes(utf8Bytes(text)), afterFingerprint:stableFingerprintBytes(utf8Bytes(rebuilt))});
}
function splitSuffix(s) { const index=s.search(/[?#]/);return index<0?[s]:[s.slice(0,index),s.slice(index)]; }
