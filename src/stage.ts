import { Config } from './config';
import { executeAzCliCommand } from './execute-az-cli-command';

export async function stage(
  config: Config,
  app: { name: string; resourceGroup: string }
) {
  const stagingArgs = [
    config.appCommand,
    'deployment',
    'source',
    'config-zip',
    '-n',
    app.name,
    '-g',
    app.resourceGroup,
    '--slot',
    'staging',
    '--src',
    './app.zip',
    '--subscription',
    config.subscriptionId
  ];

  console.log('Deploying to staging, please wait...');
  await executeAzCliCommand(config.azPath, stagingArgs, false);
}
