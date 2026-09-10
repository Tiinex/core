import test from 'node:test';import assert from 'node:assert/strict';
import {releasePlan,assertPublishContext,readRegistry,publishedArchiveState} from '../src/release/plan.mjs';
const sha='a'.repeat(40),old='b'.repeat(40),pkg={name:'@tiinex/core',version:'0.1.1',type:'module',exports:{'.':'./src/index.js'},files:['src'],engines:{node:'>=22'}};
const previous={...pkg,version:'0.4.2',gitHead:old};const metadata={name:pkg.name,versions:{'0.4.2':previous}};
const plan=(messages,current=pkg)=>releasePlan({pkg:current,metadata,sourceCommit:sha,messages});
test('bootstrap chooses explicit stable package floor',()=>assert.equal(releasePlan({pkg:{...pkg,version:'0.1.0-dev.0'},metadata:{versions:{}},sourceCommit:sha}).version,'0.1.0'));
test('default patch needs no version edit or tag',()=>assert.equal(plan(['plain human commit']).version,'0.4.3'));
test('features get minor',()=>assert.equal(plan(['feat(scene): add view']).version,'0.5.0'));
test('breaking marker before 1.0 gets minor, not an involuntary 1.0',()=>assert.equal(plan(['feat!: redesign']).version,'0.5.0'));
test('explicit major opts in to 1.0',()=>assert.equal(plan(['[release:major]']).version,'1.0.0'));
test('strongest batch signal wins',()=>assert.equal(plan(['fix: a','feat: b','docs: c']).version,'0.5.0'));
test('surface removal is not downgraded by patch marker',()=>assert.equal(plan(['[release:patch]'],{...pkg,exports:{}}).version,'0.5.0'));
test('post-1.0 break yields major',()=>{const p={...previous,version:'1.4.2'};assert.equal(releasePlan({pkg,metadata:{versions:{'1.4.2':p}},sourceCommit:sha,messages:['fix!: remove']}).version,'2.0.0');});
test('retry of already released commit skips',()=>assert.equal(releasePlan({pkg,metadata:{versions:{'0.4.2':{...previous,tiinexRelease:{sourceCommit:sha}}}},sourceCommit:sha}).action,'skip'));
test('a prerelease of same commit does not suppress its stable promotion',()=>assert.equal(releasePlan({pkg,metadata:{versions:{'0.4.2-dev.0':{...previous,version:'0.4.2-dev.0',gitHead:sha}}},sourceCommit:sha}).action,'publish'));
const env={GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/master',GITHUB_REPOSITORY:'Tiinex/core',TIINEX_ENABLE_NPM_PUBLISH:'true'};
test('only master can obtain permission',()=>{assert.doesNotThrow(()=>assertPublishContext(env,'Tiinex/core'));for(const ref of ['refs/heads/main','refs/heads/feature','refs/tags/v1.0.0','refs/pull/1/merge'])assert.throws(()=>assertPublishContext({...env,GITHUB_REF:ref},'Tiinex/core'),/master-only/);});
test('PR, fork, local invocation and disabled config cannot publish',()=>{for(const patch of [{GITHUB_EVENT_NAME:'pull_request'},{GITHUB_REPOSITORY:'fork/core'},{GITHUB_ACTIONS:'false'},{TIINEX_ENABLE_NPM_PUBLISH:'false'}])assert.throws(()=>assertPublishContext({...env,...patch},'Tiinex/core'));});
test('registry auth/network/server failures never mean package absent',async()=>{for(const status of [401,403,429,500])await assert.rejects(()=>readRegistry(pkg.name,{fetcher:async()=>({ok:false,status})}),/registry.failure/);await assert.rejects(()=>readRegistry(pkg.name,{fetcher:async()=>{throw Error('DNS')}}),/DNS/);});
test('only actual 404 permits bootstrap',async()=>assert.deepEqual((await readRegistry(pkg.name,{fetcher:async()=>({status:404})})).versions,{}));

test('registry 404 can settle to a visible package under an explicit bounded retry policy',async()=>{
 let calls=0,sleeps=[];const visible={name:pkg.name,versions:{'0.1.0':{...pkg,version:'0.1.0'}}};
 const result=await readRegistry(pkg.name,{attempts:3,retryDelayMs:7,sleeper:async ms=>sleeps.push(ms),fetcher:async(_url,options)=>{calls+=1;assert.equal(options.headers['Cache-Control'],'no-cache');return calls<3?{status:404}:{status:200,ok:true,json:async()=>visible};}});
 assert.equal(calls,3);assert.deepEqual(sleeps,[7,14]);assert.equal(result.versions['0.1.0'].version,'0.1.0');
});
test('bounded registry retry still reports durable 404 as absence',async()=>{let calls=0;const result=await readRegistry(pkg.name,{attempts:3,retryDelayMs:0,sleeper:async()=>{},fetcher:async()=>{calls+=1;return {status:404};}});assert.equal(calls,3);assert.deepEqual(result,{name:pkg.name,versions:{}});});
test('authorization and server failures are never retried as propagation lag',async()=>{for(const status of [401,403,429,500]){let calls=0;await assert.rejects(()=>readRegistry(pkg.name,{attempts:5,sleeper:async()=>{},fetcher:async()=>{calls+=1;return {ok:false,status};}}),/registry.failure/);assert.equal(calls,1);}});

test('published archive state distinguishes exact idempotency, version collision and absence',()=>{
 const integrity='sha512-exact';const exact={versions:{'0.1.0':{version:'0.1.0',dist:{integrity}}}};
 assert.equal(publishedArchiveState(exact,{version:'0.1.0',integrity}).status,'exact');
 assert.equal(publishedArchiveState(exact,{version:'0.1.0',integrity:'sha512-other'}).status,'collision');
 assert.equal(publishedArchiveState(exact,{version:'0.1.1',integrity}).status,'absent');
});
