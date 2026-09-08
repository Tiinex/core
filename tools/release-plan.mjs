// Compatibility wrapper: the release plan now includes automatic version selection.
import {runRelease} from '@tiinex/core/node/release';
await runRelease({argv:['prepare']});
