import * as core from '@actions/core';
import * as io from '@actions/io';
import * as exec from '@actions/exec';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */

async function executeAzCliCommand(
  azPath: string,
  args: string[],
  silent?: boolean,
  execOptions: any = {}
) {
  execOptions.silent = !!silent;
  await exec.exec(`"${azPath}"`, args, execOptions);
}

export async function run(): Promise<void> {
  try {
    core.info(`Running Azure CLI Login.`);
    const azPath = await io.which('az', true);
    if (!azPath) {
      throw new Error('Azure CLI is not found in the runner.');
    }

    core.info(`Azure CLI path: ${azPath}`);

    let output = '';
    const execOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    };

    await executeAzCliCommand(azPath, ['--version'], true, execOptions);
    core.info(`Azure CLI version used:\n${output}`);

    const serviceTag = core.getInput('serviceTag');
    console.log(serviceTag);
    const pillarCode = core.getInput('pillarCode');
    console.log(pillarCode);
    // const environmentName = core.getInput('environmentName');
    const instance = core.getInput('instance');
    console.log(instance);
    const region = core.getInput('region');
    console.log(region);
    const subscriptionId = core.getInput('subscriptionId');
    console.log(subscriptionId);

    const args = [
      'functionapp',
      'list',
      '--query',
      `[?tags.tag_application=='${serviceTag}'&&tags.tag_pillar_code=='${pillarCode}'&&tags.tag_instance_code=='${instance}'&&location=='${region}'].{name: name, resourceGroup: resourceGroup}`,
      '--subscription',
      subscriptionId,
      '--output',
      'json'
    ];
    console.log(args);
    output = '';
    await executeAzCliCommand(azPath, args, false, execOptions);
    console.log(output);
    const functionApps = JSON.parse(output);
    console.log(functionApps);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
