import { Config } from './config';
import { executeAzCliCommand } from './execute-az-cli-command';

export async function swap(
  config: Config,
  app: { name: string; resourceGroup: string }
) {
  const stagingSwapArgs = [
    config.appCommand,
    'deployment',
    'slot',
    'swap',
    '-n',
    app.name,
    '-g',
    app.resourceGroup,
    '--slot',
    'staging',
    '--subscription',
    config.subscriptionId
  ];

  console.log('Swapping staging to production, please wait...');
  const swapOutput = await executeAzCliCommand(
    config.azPath,
    stagingSwapArgs,
    false
  );
  if (swapOutput === '') {
    console.log('Swapping staging to production completed.');
  }
}
