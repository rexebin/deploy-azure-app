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
    let output = '';
    const execOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    };

    const serviceTag = core.getInput('serviceTag');
    const pillarCode = core.getInput('pillarCode');
    // const environmentName = core.getInput('environmentName');
    const instance = core.getInput('instance');
    const region = core.getInput('region');
    const subscriptionId = core.getInput('subscriptionId');
    const appType = core.getInput('appType');
    if (
      appType.toLowerCase() !== 'functionapp' ||
      appType.toLowerCase() !== 'webapp'
    ) {
      throw new Error(`Input appType must be either 'functionapp' or 'webapp'`);
    }

    const args = [
      appType.toLowerCase(),
      'list',
      '--query',
      `[?tags.tag_application=='${serviceTag}'&&tags.tag_pillar_code=='${pillarCode}'&&tags.tag_instance_code=='${instance}'&&location=='${region}'].{name: name, resourceGroup: resourceGroup}`,
      '--subscription',
      subscriptionId,
      '--output',
      'json'
    ];
    await executeAzCliCommand(azPath, args, false, execOptions);
    const app: { name: string; resourceGroup: string }[] = JSON.parse(output);
    console.log(app[0]);
    console.log(app[0].name);
    console.log(app[0].resourceGroup);

    const stagingArgs = [
      appType.toLowerCase(),
      'deployment',
      'source',
      'config-zip',
      '-n',
      app[0].name,
      '-g',
      app[0].resourceGroup,
      '--slot',
      'staging',
      '--src',
      './app.zip',
      '--subscription',
      subscriptionId
    ];

    output = '';
    await executeAzCliCommand(azPath, stagingArgs, false, execOptions);
    console.log(output);

    const stagingSwapArgs = [
      appType.toLowerCase(),
      'deployment',
      'slot',
      'swap',
      '-n',
      app[0].name,
      '-g',
      app[0].resourceGroup,
      '--slot',
      'staging',
      '--subscription',
      subscriptionId,
      '--verbose'
    ];

    output = '';
    await executeAzCliCommand(azPath, stagingSwapArgs, false, execOptions);
    console.log(output);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
