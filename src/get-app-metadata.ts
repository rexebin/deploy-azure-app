import { Config } from './config';
import { executeAzCliCommand } from './execute-az-cli-command';

export async function getAppMetadata(config: Config) {
  const args = [
    config.appCommand,
    'list',
    '--query',
    `[?tags.tag_application=='${config.serviceTag}'&&tags.tag_pillar_code=='${config.pillarCode}'&&tags.tag_instance_code=='${config.instance}'&&location=='${config.region}'].{name: name, resourceGroup: resourceGroup}`,
    '--subscription',
    config.subscriptionId,
    '--output',
    'json'
  ];

  console.log('Getting app name and resource group, please wait...');
  const output = await executeAzCliCommand(config.azPath, args, false);
  const app: { name: string; resourceGroup: string }[] = JSON.parse(output);
  if (app.length > 1) {
    throw new Error('Multiple apps found.');
  }
  if (app.length === 0) {
    throw new Error('No apps found.');
  }
  console.log(`App Name is: ${app[0].name}`);
  console.log(`App Resource Group Name: ${app[0].resourceGroup}`);
  return app[0];
}
