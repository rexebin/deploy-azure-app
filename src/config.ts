import * as core from '@actions/core';
import * as io from '@actions/io';

function getAppCommand(): string {
  const appType = core.getInput('appType');
  if (appType.toLowerCase() !== 'function' && appType.toLowerCase() !== 'api') {
    throw new Error(`Input appType must be either 'function' or 'api'`);
  }

  if (appType.toLowerCase() === 'function') {
    return 'functionapp';
  } else {
    return 'webapp';
  }
}

function getInput(name: string) {
  const value = core.getInput(name);
  if (!value) {
    throw new Error(`Input ${name} is not set`);
  }
  return value;
}

async function getAzPath() {
  core.info(`Running Azure CLI Login.`);
  const azPath = await io.which('az', true);
  if (!azPath) {
    throw new Error('Azure CLI is not found in the runner.');
  }
  return azPath;
}

export async function getConfig(): Promise<Config> {
  return {
    azPath: await getAzPath(),
    serviceTag: getInput('serviceTag'),
    pillarCode: getInput('pillarCode'),
    environmentName: getInput('environmentName'),
    instance: getInput('instance'),
    region: getInput('region'),
    subscriptionId: getInput('subscriptionId'),
    appCommand: getAppCommand()
  };
}

export interface Config {
  azPath: string;
  serviceTag: string;
  pillarCode: string;
  environmentName: string;
  instance: string;
  region: string;
  subscriptionId: string;
  appCommand: string;
}
