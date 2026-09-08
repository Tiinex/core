import {parseSemver, stableVersion, bumpVersion, recommendRelease} from './policy.mjs';
export const RELEASE_POLICY = 'tiinex.master-npm-release.v1';
export function compareVersion(a,b){const x=parseSemver(a),y=parseSemver(b);return x.major-y.major||x.minor-y.minor||x.patch-y.patch;}
export function releasePlan({pkg,metadata,sourceCommit,messages=[],previousPackage=null}) {
 if(!/^@tiinex\/[a-z0-9-]+$/.test(pkg.name)||pkg.private===true)throw Error('release.package.invalid');
 if(!/^[a-f0-9]{40,64}$/.test(sourceCommit))throw Error('release.source-commit.required');
 const versions=Object.values(metadata?.versions||{});
 const done=versions.find(v=>(v.tiinexRelease?.sourceCommit||v.gitHead)===sourceCommit && !parseSemver(v.version).prerelease);
 if(done)return {policy:RELEASE_POLICY,action:'skip',reason:'source-already-published',version:done.version,sourceCommit};
 const stable=versions.filter(v=>!parseSemver(v.version).prerelease).sort((a,b)=>compareVersion(a.version,b.version));
 const last=stable.at(-1);const floor=stableVersion(pkg.version);
 let decision;
 if(!last)decision={bump:'bootstrap',rawSeverity:'bootstrap',targetVersion:floor,reasons:['First stable version: explicit source package floor.']};
 else decision=recommendRelease({currentVersion:last.version,previousVersion:last.version,previousPackage:previousPackage||last,currentPackage:pkg,commitMessages:messages});
 if(compareVersion(floor,decision.targetVersion)>0){decision={...decision,targetVersion:floor,reasons:[...decision.reasons,'Source package version explicitly raises the minimum release version.']};}
 if(metadata?.versions?.[decision.targetVersion])throw Error('release.version.collision');
 return {policy:RELEASE_POLICY,action:'publish',name:pkg.name,version:decision.targetVersion,previousVersion:last?.version||null,previousCommit:last?.tiinexRelease?.sourceCommit||last?.gitHead||null,sourceCommit,decision};
}
export function assertPublishContext(env,repository) {
 if(env.GITHUB_ACTIONS!=='true'||!['push','workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)||env.GITHUB_REF!=='refs/heads/master'||env.GITHUB_REPOSITORY!==repository)throw Error('release.master-only: publishing requires this repository on refs/heads/master');
 if(env.TIINEX_ENABLE_NPM_PUBLISH!=='true')throw Error('release.not-enabled');
}
export async function readRegistry(name,{fetcher=globalThis.fetch}={}) {
 const response=await fetcher(`https://registry.npmjs.org/${encodeURIComponent(name)}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
 if(response.status===404)return {name,versions:{}};
 if(!response.ok)throw Error(`release.registry.failure:${response.status}`);
 const data=await response.json();if(data.name!==name||!data.versions||typeof data.versions!=='object')throw Error('release.registry.invalid-response');return data;
}
