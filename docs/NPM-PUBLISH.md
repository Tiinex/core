# npm publicering — en engångssetup, sedan master-only

## Vad som nu finns

Core, App och Playthings har `ci.yml` och `publish.yml`. CI testar pushar och pull requests.
Publicering körs endast för `refs/heads/master`, både vid push och vid manuell omkörning.
`main`, feature-brancher, taggar och PR-kod kan inte publicera genom dessa workflows.
En extra kontroll i Node-koden verifierar repository, event, SHA och master före publicering.
Inget publicerades och inga GitHub-inställningar ändrades i denna leverans.

Releasekoden finns EN gång i `@tiinex/core/node/release`. App och Playthings har tunna
anropare. Playthings tidigare versionspolicy flyttades till Core; den gamla filvägen
är en re-export, inte ytterligare en implementation.

## 1. Landa källorna och testa hela kedjan

Landa på arbetsbranch först. Skriv inte över `.git`, egna credentials eller lokalt
arbete utan backup. Källornas nya versioner är Core 0.1.1, App 0.1.1 och Playthings 0.1.0.
App och Site fortsätter ha exakta dependencies; framtida oberoende npm-releaser
uppgraderar INTE automatiskt andra repos låsfiler.

Första gången är paketversionerna ännu opublicerade. Ett gemensamt test kan ändå
köras utan source-länkar: verktyget packar källorna, installerar arkiven i en separat
npm-miljö, hämtar de exakta externa beroendena och kör tester, bygg och browser-smoke.
Originalrepona ändras inte. Python med Playwright behövs för sista gaten:

```sh
python -m pip install playwright==1.55.0
python -m playwright install --with-deps chromium
node core/tools/qualify-source-set.mjs --core core --app app --site site --playthings playthings
```

Sökvägarna är explicita testinputs, inte runtime-dependencies. Anpassa dem till din
lokala workspace-layout. En JSON-rapport lämnas i den utskrivna temporära katalogen.
I Anchor-runtimen gick headless- och tarball-testerna att köra men npm-DNS saknades;
React/Vite/browser-gaterna är därför INTE redovisade som lokala PASS.

## 2. Första publiceringen per paket

Paketet behöver finnas på npm innan dess Trusted Publisher kan konfigureras.
Tiinex-organisationen finns redan; skapa inte en ny. Använd ditt eget npm-konto
med publiceringsrätt och 2FA, och behåll credentials utanför repona.

När hela kvalificeringen ovan är grön: commita de granskade källorna på `master`.
Arbetsträdet måste vara rent. Kör i ordningen **Core → App → Playthings**:

```sh
npm login
npm ci
npm run publish:bootstrap
```

Bootstrap-kommandot kräver master, ren källa och ett hittills opublicerat paket.
Det kör paketets `validate` eller `check`, packar ett separat release-träd och
publicerar första stabila versionen på `latest` med ditt konto/2FA. Källornas
package.json ändras inte av versionsstegningen. Arkiv och kvitto finns i `.release/`.
Om paketet redan finns stoppar bootstrap: konfigurera då Trusted Publisher i stället.
Om gamla versioner saknar en giltig gitHead/commit-bas behövs explicit migrering;
verktyget gissar inte historik eller hoppar över okända publiceringar.

Bootstrap lägger till source-commit-metadata i det publicerade arkivet. Därför är
nya @tiinex-pins i de medföljande låsfilerna exakta versioner men utan påhittad SRI.
De externa beroendenas befintliga SRI är bevarad. Efter respektive första publicering
kan `npm install --package-lock-only --ignore-scripts` i konsumenterna låsa verklig
registry-integrity. Lokal testdistribution har separat verifierad SRI i sitt eget lock.
De medskickade kandidat-tarballernas hash ska inte förväxlas med ett senare
commit-stämplat publiceringsarkiv.

## 3. npm Trusted Publisher + GitHub Environment

För varje paket på npmjs.com → Package → Settings → Trusted Publisher:

| Fält | Värde |
| --- | --- |
| Provider | GitHub Actions |
| Organization/user | Tiinex |
| Repository | core, app respektive playthings |
| Workflow filename | publish.yml |
| Environment name | npm |
| Allowed actions | npm publish |

I motsvarande GitHub-repo: Settings → Environments → skapa **npm**.
Sätt deployment branch policy till **Selected branches: master endast**.
Lägg inte in reviewers om publicering ska vara helt automatisk efter testerna.
Detta skyddar även mot en annan branch som försöker ändra sin egen workflow-guard.

Settings → Secrets and variables → Actions → Variables:
`TIINEX_ENABLE_NPM_PUBLISH = true`.
Aktivera först efter kvalificeringen. Ingen NPM_TOKEN behövs eller ska checkas in.
Workflows använder GitHub-hosted Ubuntu, Node 24, npm 11.6.2 och jobbets `id-token: write`.
Provenance begärs vid OIDC-publicering; npm kräver korrekt `repository.url` och
publikt repo/paket för automatisk provenance.

Testa med en vanlig commit till master. Actions ska testa, välja version, packa och
publicera; en omkörning av exakt samma publicerade source-commit ska hoppa över
publicering utan ny versionsökning. Workflows gör inga versionscommits eller taggar,
så det uppstår ingen commit-loop. Behörigheten `contents: write` behövs inte.

När OIDC fungerar: npm Publishing access → **Require two-factor authentication and
disallow tokens**. Det hindrar inte den konfigurerade Trusted Publisher.

## Versionsregler

- Vanlig commit / `fix:` / `docs:`: patch.
- `feat:` eller en ny offentlig export: minor.
- Breaking-markör (`!` / `BREAKING CHANGE`) eller borttagen publik export: major-signal.
- Före 1.0 blir en automatisk major-signal MINOR. `[release:major]` väljer uttryckligen 1.0.
- `[release:minor]` och `[release:patch]` kan ange avsikt, men kan inte nedgradera en starkare signal.
- Hela commit-intervallet sedan senaste registry-release granskas; starkaste signalen vinner.

Detta är en konservativ publiceringspolicy, inte ett bevis på att koden är semantiskt
bakåtkompatibel. Tester/granskning avgör API-kompatibilitet. Om source-versionen
manuellt satts högre fungerar den som ett uttryckligt versionsgolv.

Registry är versionshistorik; full Git-historik behövs för gitHead → HEAD. En redan
publicerad eller överspelad commit hoppas över. Divergerad historik, nätfel, 401/403,
429, 5xx och ändrat release-arkiv blockerar. Endast ett faktiskt HTTP 404 betyder
att paketet saknas. Publicering körs seriellt per repository. Avbruten körning kan
köras om utan att en redan bekräftad publicering automatiskt skapar nästa version.

## Officiella referenser kontrollerade 2026-09-08

https://docs.npmjs.com/trusted-publishers/
https://docs.npmjs.com/cli/v11/commands/npm-trust/

Dessa beskriver npm/OIDC-beteendet. Tiinex versionsval och branch-guard är vår
implementerade och testade policy, inte funktioner som npm automatiskt tillhandahåller.
