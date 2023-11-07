/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { getAppMetadata } from '../src/get-app-metadata';
// @ts-ignore
import { mockInputs } from './mock-inputs';
import { getConfig } from '../src/config';
import { run } from '../src/main';

describe('get app metadata', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return az app metadata', async () => {
    jest
      .spyOn(exec, 'exec')
      .mockImplementation(async (azPath, arg, options) => {
        options &&
          options.listeners &&
          options.listeners.stdout &&
          options.listeners.stdout(
            Buffer.from('[{"name":"test-app", "resourceGroup":"test-rg"}]')
          );
        return Promise.resolve(0);
      });

    mockInputs();
    const config = await getConfig();
    const result = await getAppMetadata(config);
    expect(result.name).toBe('test-app');
    expect(result.resourceGroup).toBe('test-rg');
  });

  it('should throw if az return more than one app', async () => {
    jest
      .spyOn(exec, 'exec')
      .mockImplementation(async (azPath, arg, options) => {
        options &&
          options.listeners &&
          options.listeners.stdout &&
          options.listeners.stdout(
            Buffer.from(
              '[{"name":"test-app", "resourceGroup":"test-rg"}, {"name":"test-app2", "resourceGroup":"test-rg2"}]'
            )
          );
        return Promise.resolve(0);
      });

    jest.spyOn(core, 'setFailed');

    mockInputs();
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('Multiple apps found.');
  });

  it('should throw if az return more no app', async () => {
    jest
      .spyOn(exec, 'exec')
      .mockImplementation(async (azPath, arg, options) => {
        options &&
          options.listeners &&
          options.listeners.stdout &&
          options.listeners.stdout(Buffer.from('[]'));
        return Promise.resolve(0);
      });

    jest.spyOn(core, 'setFailed');

    mockInputs();
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('No apps found.');
  });
});
