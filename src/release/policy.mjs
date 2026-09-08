const RELEASE_MARKER = /(?:\[release:(major|minor|patch)\]|\brelease(?:-intent)?\s*:\s*(major|minor|patch)\b)/ig;
const BREAKING_MARKER = /(?:^|\n)\s*BREAKING(?: CHANGE|-CHANGE)?\s*:|^[a-z]+(?:\([^\n)]*\))?!:/im;
const FEATURE_MARKER = /(?:^|\n)\s*feat(?:\([^\n)]*\))?\s*:|\[(?:feature|feat)\]/im;

export function parseSemver(value) {
  const match = String(value ?? '').trim().match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) throw new Error(`Invalid semantic version: ${value}`);
  return {major:Number(match[1]),minor:Number(match[2]),patch:Number(match[3]),prerelease:match[4] ?? ''};
}

export function stableVersion(value) {
  const parsed=parseSemver(value);
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function bumpVersion(value, bump) {
  const parsed=parseSemver(stableVersion(value));
  if (bump==='major') return `${parsed.major+1}.0.0`;
  if (bump==='minor') return `${parsed.major}.${parsed.minor+1}.0`;
  if (bump==='patch') return `${parsed.major}.${parsed.minor}.${parsed.patch+1}`;
  throw new Error(`Unsupported bump: ${bump}`);
}

function strongest(values) {
  const order={patch:1,minor:2,major:3};
  return values.reduce((best,value)=>order[value]>order[best] ? value : best,'patch');
}

function explicitMarkers(messages) {
  const found=[];
  for (const message of messages) {
    RELEASE_MARKER.lastIndex=0;
    let match;
    while ((match=RELEASE_MARKER.exec(String(message)))) found.push((match[1]??match[2]).toLowerCase());
  }
  return found;
}

function stableObject(value) {
  if (value===undefined) return null;
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableObject(value[key])]));
  return value;
}

function same(a,b){return JSON.stringify(stableObject(a))===JSON.stringify(stableObject(b));}

export function comparePackageSurface(previousPackage,currentPackage) {
  if (!previousPackage) return {severity:'patch',reasons:[]};
  const reasons=[]; const severities=[];
  if (previousPackage.name!==currentPackage.name) { severities.push('major'); reasons.push(`package name changed from ${previousPackage.name} to ${currentPackage.name}`); }
  if (previousPackage.type!==currentPackage.type) { severities.push('major'); reasons.push(`package module type changed from ${previousPackage.type} to ${currentPackage.type}`); }
  if (!same(previousPackage.engines?.node,currentPackage.engines?.node)) { severities.push('major'); reasons.push('supported Node engine declaration changed'); }
  const before=previousPackage.exports??{}; const after=currentPackage.exports??{};
  for (const key of Object.keys(before)) {
    if (!(key in after)) { severities.push('major'); reasons.push(`public export removed: ${key}`); }
    else if (!same(before[key],after[key])) { severities.push('major'); reasons.push(`public export target changed: ${key}`); }
  }
  for (const key of Object.keys(after)) if (!(key in before)) { severities.push('minor'); reasons.push(`public export added: ${key}`); }
  const beforeFiles=Array.isArray(previousPackage.files)?previousPackage.files:[];
  const afterFiles=Array.isArray(currentPackage.files)?currentPackage.files:[];
  for (const pattern of beforeFiles) if (!afterFiles.includes(pattern)) { severities.push('major'); reasons.push(`published file pattern removed: ${pattern}`); }
  for (const pattern of afterFiles) if (!beforeFiles.includes(pattern)) { severities.push('minor'); reasons.push(`published file pattern added: ${pattern}`); }
  return {severity:severities.length?strongest(severities):'patch',reasons};
}

export function recommendRelease({currentVersion,previousVersion=null,previousPackage=null,currentPackage,commitMessages=[],override=null}) {
  const current=parseSemver(currentVersion);
  if (!previousVersion) {
    const target=stableVersion(currentVersion);
    return {bump:'bootstrap',rawSeverity:'bootstrap',targetVersion:target,reasons:[`first stable release from ${currentVersion}`],explicit:false};
  }
  const base=stableVersion(previousVersion);
  const baseParsed=parseSemver(base);
  if (stableVersion(currentVersion)!==base) throw new Error(`package.json version ${currentVersion} does not share the latest release base ${base}`);
  if (current.prerelease) throw new Error(`package.json must stay on released stable version ${base} after the first release; found ${currentVersion}`);
  if (override) {
    if (!['major','minor','patch'].includes(override)) throw new Error(`Invalid release override: ${override}`);
    return {bump:override,rawSeverity:override,targetVersion:bumpVersion(base,override),reasons:[`manual --bump ${override} override`],explicit:true};
  }
  const markers=explicitMarkers(commitMessages);
  const explicit=markers.length?strongest(markers):null;
  const packageChange=comparePackageSurface(previousPackage,currentPackage);
  const breaking=commitMessages.some(message=>BREAKING_MARKER.test(String(message)));
  const feature=commitMessages.some(message=>FEATURE_MARKER.test(String(message)));
  const candidates=[packageChange.severity];
  const reasons=[...packageChange.reasons];
  if (breaking) { candidates.push('major'); reasons.push('breaking-change commit marker detected'); }
  if (feature) { candidates.push('minor'); reasons.push('feature commit marker detected'); }
  if (explicit) { candidates.push(explicit); reasons.push(`explicit release marker requested ${explicit}`); }
  let rawSeverity=strongest(candidates);
  let bump=rawSeverity;
  const explicitMajor=markers.includes('major');
  if (baseParsed.major===0 && rawSeverity==='major' && !explicitMajor) {
    bump='minor';
    reasons.push('pre-1.0 safety: automatic breaking changes advance the minor version; use [release:major] or --bump major to opt into 1.0.0');
  }
  if (!reasons.length) reasons.push('no public-surface or release-intent signal detected; defaulting to patch');
  return {bump,rawSeverity,targetVersion:bumpVersion(base,bump),reasons,explicit:Boolean(explicit)};
}
