/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
import * as exec from '@actions/exec';

export async function executeAzCliCommand(
  azPath: string,
  args: string[],
  silent?: boolean
): Promise<string> {
  let output = '';
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      }
    },
    silent: !!silent
  };

  await exec.exec(`"${azPath}"`, args, execOptions);
  return output;
}
