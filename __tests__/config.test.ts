/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { run } from '../src/main';
import * as io from '@actions/io';
import * as core from '@actions/core';
// @ts-ignore
import { mockInputs } from './mock-inputs';
import { getConfig } from '../src/config';

describe('az path should be valid', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it.each(['az not found', ''])(
    'should throw if az path contains not found',
    async (result: string) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(io, 'which').mockImplementation(async () => {
        return Promise.resolve(result);
      });
      jest.spyOn(core, 'setFailed');
      await run();
      expect(core.setFailed).toHaveBeenCalledWith(
        'Azure CLI is not found in the runner.'
      );
    }
  );
});

describe('Config should be valid', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw if no instance is given', async () => {
    mockInputs('tms', 'product', '123', 'dev', '', 'north europe', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('Input instance is not set');
  });

  it('should throw if no region is given', async () => {
    mockInputs('tms', 'product', '123', 'dev', '123', '', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('Input region is not set');
  });

  it('should throw if no subscriptionId is given', async () => {
    mockInputs('tms', 'product', '', 'dev', '123', 'north europe', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      'Input subscriptionId is not set'
    );
  });

  it('should throw if no appType is given', async () => {
    mockInputs('tms', 'product', '123', 'dev', '123', 'north europe', '');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      "Input appType must be either 'function' or 'api'"
    );
  });
  it('should throw if appType is not function or api', async () => {
    mockInputs('tms', 'product', '123', 'dev', '123', 'north europe', 'test');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      "Input appType must be either 'function' or 'api'"
    );
  });

  it('should throw if no serviceTag is given', async () => {
    mockInputs('123', '', '123', 'dev', '123', 'north europe', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('Input serviceTag is not set');
  });

  it('should throw if no pillarCode is given', async () => {
    mockInputs('', 'product', '123', 'dev', '123', 'north europe', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('Input pillarCode is not set');
  });

  it('should throw if no environmentName is given', async () => {
    mockInputs('tms', 'product', '123', '', '123', 'north europe', 'function');
    jest.spyOn(core, 'setFailed');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      'Input environmentName is not set'
    );
  });
});

describe('appCommand should be either functionapp or webapp', () => {
  it('appCommand should be functionapp if app type for function', async () => {
    mockInputs(
      'tms',
      'product',
      '123',
      'dev',
      '123',
      'north europe',
      'function'
    );
    jest.spyOn(core, 'setFailed');
    const config = await getConfig();
    expect(config.appCommand).toBe('functionapp');
  });
  it('appCommand should be webapp if app type for api', async () => {
    mockInputs('tms', 'product', '123', 'dev', '123', 'north europe', 'api');
    jest.spyOn(core, 'setFailed');
    const config = await getConfig();
    expect(config.appCommand).toBe('webapp');
  });
});
