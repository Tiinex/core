import path from 'node:path';
import { projectNodeGitCommitProvenance } from '../node/git.commitProvenance.js';

export async function runGitCommitProvenanceCli(parsed, io = console) {
  try {
    const root = path.resolve(String(parsed.positionals[0] || parsed.flags.root || '.'));
    const result = await projectNodeGitCommitProvenance(root, { repositoryLabel: parsed.flags.label || parsed.flags['repository-label'] || '' });
    if (parsed.flags.message || parsed.flags.plain) io.log(result.message);
    else io.log(JSON.stringify(result, null, parsed.flags.compact === true ? 0 : 2));
    return 0;
  } catch (error) {
    io.error(JSON.stringify({ schema: 'tiinex.portable.cli.error.v1', error: String(error?.message || error), command: parsed.command }, null, 2));
    return 1;
  }
}
