import * as core from '@actions/core';

export function mockInputs(
  pillarCode = 'pillarCode',
  serviceTag = 'serviceTag',
  subscriptionId = '123',
  environmentName = 'environmentName',
  instance = 'instance',
  region = 'region',
  appType = 'function'
) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    if (name === 'environmentName') {
      return environmentName;
    }
    if (name === 'instance') {
      return instance;
    }
    if (name === 'serviceTag') {
      return serviceTag;
    }
    if (name === 'pillarCode') {
      return pillarCode;
    }
    if (name === 'subscriptionId') {
      return subscriptionId;
    }
    if (name === 'region') {
      return region;
    }
    if (name === 'appType') {
      return appType;
    }
    throw new Error(`Unexpected input ${name}`);
  });
}
